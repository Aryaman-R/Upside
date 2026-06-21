# Upside — Backend Plan (where frontend-only ends)

This document marks the boundary: **the client-only MVP is essentially
feature-complete**, and the remaining roadmap items genuinely require a backend.
It defines what a backend would add, a recommended architecture, the data model,
a migration path, and the privacy/compliance bar — so backend work can start
deliberately rather than by accident.

Pairs with [`IMPLEMENTATION.md`](IMPLEMENTATION.md) (current architecture),
[`../HANDOFF.md`](../HANDOFF.md) (status), and [`MONETIZATION.md`](MONETIZATION.md)
(revenue, which mostly unlocks *after* a backend exists).

> ✅ **Phase 1 (auth + sync) is implemented** — Supabase email/password auth and
> offline-first cloud state sync. It's *optional*: with no env vars the app runs
> exactly as before (fully local). Setup: [`../supabase/README.md`](../supabase/README.md).
> Remaining phases (2–7) are still ahead.

---

## 1. Why now

The frontend-only app already delivers the full harm-reduction product loop:
play-money markets, portfolio, leaderboard, Money Kept, the urge flow,
onboarding, insights, **responsible-gambling limits/cool-off**, **social
(friends/groups/challenges)**, and a **unit-tested reducer**. Everything that can
be honestly built against local state + mock data has been built.

What's left all shares one trait: **it needs a server because it spans devices,
users, real time, money, or durable evidence.** Pushing further on the client
would mean *faking* those — which the project has deliberately avoided.

## 2. What requires a backend (and why)

| Roadmap item | Why a backend is required |
| --- | --- |
| **Accounts & multi-device sync** | State currently lives in one browser's `localStorage`. Real identity + sync needs auth + a server datastore. |
| **Real multiplayer social** | Friends/groups/challenges are convincingly *simulated* against mock players. Real invites, presence, and **mutually-settled** challenges need shared server state + realtime. |
| **Outcomes measurement** | The single most valuable asset for grants + B2B (per MONETIZATION) — opt-in, de-identified, aggregated metrics — must be collected and stored server-side. |
| **Real market resolution** | Today markets resolve via local simulation. Tying outcomes to real events needs a data feed + a server job to settle. |
| **Check-in reminders / nudges** | Time-of-day reminders and push notifications need a scheduler + push service; web push needs a server key + worker. |
| **B2B/clinician features** | Org admin, seat management, and clinician-shared progress reports need accounts, roles, and server-side reports. |
| **Payments (Upside Plus)** | Any real subscription needs Stripe + a server to hold the source of truth for entitlements. (Still **no real-money wagering** — ever.) |

## 3. Recommended architecture (MVP)

Optimize for velocity and a strong security posture out of the box:

```
React client (this app, kept offline-first)
        │  HTTPS + WebSocket
        ▼
Supabase  ──  Postgres (data)  +  Auth (identity)  +  Realtime (social)
        │      └─ Row-Level Security (per-user isolation, enforced in DB)
        ▼
Edge/Server functions  ──  market settlement job, push scheduler, Stripe webhooks
```

**Why Supabase for the MVP:** managed Postgres + auth + realtime + storage with
**row-level security**, which is exactly the per-user isolation a sensitive
journal/mood dataset demands. It collapses three services (DB, auth, realtime)
into one and keeps us on standard SQL, so we can migrate off later without lock-in
on the data model. Alternatives: a typed Node/TS API (Fastify/Nest) + Postgres +
Prisma for maximum control, or Firebase for a NoSQL/realtime-first route. **Keep
the API thin** — most reads/writes map directly to tables guarded by RLS; reserve
server functions for settlement, scheduling, and payment webhooks.

## 4. Data model (localStorage → tables)

The reducer's state shape is already a clean schema; it maps almost 1:1 to tables
(all rows scoped by `user_id`, enforced with RLS):

- `profiles` (id, name, avatar, created_at) — 1:1 with auth user
- `settings` (user_id, daily_allowance, daily_stake_limit, cooloff_until)
- `wallets` (user_id, points, last_allowance_claim, streak, last_active, staked_today)
- `positions` (id, user_id, market_id, outcome_id, stake, price, status, payout, placed_at)
- `markets` (id, category, question, close_date, outcomes jsonb) — promoted from
  `data/markets.js`; later fed by a real events source
- `resolved_markets` (user_id, market_id, winning_outcome_id)
- `savings_entries` (id, user_id, amount, note, created_at)
- `journal_entries` (id, user_id, prompt, reflection, mood_before, mood_after, saved_snapshot, created_at) — **most sensitive**
- `friendships` (user_id, friend_id, status) — real bidirectional, replaces mock graph
- `groups` (id, name, emoji, owner_id) + `group_members` (group_id, user_id)
- `challenges` (id, challenger_id, opponent_id, market_id, outcome_id, stake, status, payout, created_at) — settlement becomes **server-authoritative** so both sides agree

> The pure reducer in `src/context/reducer.js` becomes the **shared contract**:
> the same transition logic can run server-side (or inform the API), keeping
> client optimistic updates and the server source-of-truth consistent.

## 5. Migration path (don't break the working app)

1. **Stay offline-first.** Keep the local reducer + `localStorage` as a cache;
   add a sync layer that reconciles with the server when authed/online.
2. **Auth as an additive gate**, not a wall — the app still runs anonymously
   on-device; signing in *imports* existing local state (we already have JSON
   export in Settings; add a one-time "claim my local progress" upload).
3. **Promote mock data to tables** (`markets`, then the social graph) behind the
   same hooks (`useApp`), so pages don't change.
4. **Server-authoritative money paths first** (points, positions, challenge
   settlement) to prevent client tampering once accounts exist.
5. **Layer realtime** for social presence + live challenge settlement.

## 6. Privacy, security & compliance (non-negotiable)

- **Sensitive data:** journal reflections + mood logs are mental-health-adjacent.
  Per-user RLS, encryption at rest + in transit, strict access logging, and a
  short-by-default retention policy.
- **User control:** data export (already shipped) + **hard delete** ("delete my
  account and everything") must exist before launch. GDPR/CCPA-aligned.
- **Never sell data.** Research/outcomes sharing is opt-in, de-identified,
  aggregated, and IRB-reviewed (see MONETIZATION §3E).
- **The invariants survive the backend:** no real-money wagering, no cash value
  for points, no IRA/brokerage flows. If a real **savings vault** is ever added
  (the "invest in yourself" direction), it goes through a *licensed partner*
  (FDIC program bank / broker-dealer) with KYC/AML — **not** custom money
  movement, and **savings before investing** to avoid reintroducing loss
  variance. If **payments** (Plus) are added, Stripe handles PCI; our server only
  stores entitlements.
- **B2B/clinical buyers** raise the bar to HIPAA-adjacent handling + a BAA.

## 7. Phased rollout

1. ✅ **Auth + sync** — identity, cloud-backed state, "claim local progress." **Done**
   (Supabase email/password + `app_state` JSONB snapshot + RLS; offline-first;
   `syncStatus` surfaced in Settings + the top bar).
2. **Server-authoritative money** — points/positions/challenges move to the server
   (normalize `app_state` into tables; validate writes server-side). **← next**
3. **Real social** — bidirectional friends, invites, presence, mutually-settled challenges (realtime).
4. **Outcomes measurement** — opt-in de-identified metrics (unlocks grants + B2B evidence).
5. **Reminders/nudges** — scheduler + web push.
6. **Payments / Upside Plus** — Stripe entitlements (still no wagering).
7. **(Optional, much later) Real savings vault** — via a regulated partner, savings-first.

### Phase 1 implementation notes
- **Sync model:** the whole reducer state is stored as one JSONB row per user
  (`app_state`), upserted with last-write-wins (`updated_at`). This makes the
  existing client multi-device with minimal change; Phase 2 normalizes it.
- **Offline-first:** `localStorage` stays the primary cache; sign-in pulls the
  cloud snapshot (or uploads local on first sign-in). Signed-out = anonymous local.
- **Files:** `supabase/migrations/0001_init.sql`, `src/lib/supabase.js`,
  `src/lib/cloudSync.js`, `src/context/AuthContext.jsx`, sync wiring in
  `AppContext.jsx`, `src/components/auth/AccountCard.jsx`.
- **Known follow-ups:** the Supabase SDK adds ~57 kB gzipped — lazy-load it when
  configured to keep the offline bundle lean; add an account-deletion flow before
  any real launch; consider multi-device conflict handling beyond last-write-wins.

## 8. What does *not* change

- The product thesis, the calm design language, and the no-real-money guarantees.
- The pure reducer and its tests — they become the cross-tier source of truth.
- The client stays usable offline; the backend augments, it doesn't replace.

---

**Bottom line:** the client-only milestone is done, and **backend Phase 1 (auth +
sync) is now implemented** (optional, offline-first, build + lint + 15 reducer
tests green). The next meaningful increment is **Phase 2: server-authoritative
money** — normalizing the JSONB snapshot into tables and validating writes
server-side.
