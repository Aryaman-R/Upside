# Upside — Backend Plan (where the demo ends and a real backend begins)

This document marks the boundary: **the client-only demo is essentially
feature-complete**, and the remaining roadmap items genuinely require a backend.
The catch is that the demo now *pretends* to move real money — so this doc has
two jobs: (1) describe the accurate client + optional-sync architecture we
actually shipped, and (2) honestly enumerate what building the **real** funded
product would take, none of which the demo does.

> **The model, stated plainly.** Upside's pitch is *"Win it, or invest it. Never
> just lose it."* You fund an Upside **balance** (dollars) from a connected bank
> (**funding source**), predict on real events in dollars, and connect
> **destination accounts** (a Roth IRA by default, plus high-yield savings or
> other retirement) for redirected losses. WIN → profit lands in your balance.
> LOSE → your stake minus a **5% platform fee** is routed to your default
> destination and tracked as **"Invested."**
>
> **Everything above is a DEMO and everything is SIMULATED.** The app contacts
> **no real financial institution**, performs **no login to any bank or
> brokerage**, and **moves no money** — funding, the balance, prediction
> settlement, loss-routing, and every account "connection" are computed entirely
> client-side in the reducer. It is harm-reduction theater with real numbers and
> a fake ledger.

Pairs with [`IMPLEMENTATION.md`](IMPLEMENTATION.md) (current architecture),
[`../HANDOFF.md`](../HANDOFF.md) (status), and [`MONETIZATION.md`](MONETIZATION.md)
(revenue, which mostly unlocks *after* a real backend exists).

> ✅ **Phase 1 (auth + sync) is implemented** — Supabase email/password auth and
> offline-first cloud state sync. It's *optional*: with no env vars the app runs
> exactly as before (fully local, no network). Setup:
> [`../supabase/README.md`](../supabase/README.md). Remaining phases are still ahead.

---

## 1. Why now

The demo already delivers the full harm-reduction product loop: a funded
**balance**, dollar-denominated **predictions**, win/lose **settlement**,
**loss-routing** into a Roth IRA / savings destination (the "Invested" tracker),
a mock **`/connect`** account-linking flow, a guided walkthrough, portfolio,
leaderboard, the urge/redirect flow, onboarding, insights,
**responsible-gambling limits/cool-off**, **social (friends/groups/challenges on
play points)**, and a **unit-tested reducer**. Everything that can be honestly
*simulated* against local state + mock data has been built.

What's left all shares one trait: **it needs a server because it spans devices,
users, real time, or — most consequentially now — real money and the regulated
plumbing to move it.** The demo *renders* money movement; it does not *perform*
it. Every remaining item below is about making the simulated parts real, and
doing so safely and legally.

## 2. What's simulated client-side today vs. what a backend would own

Everything in the left column is computed by the pure reducer
(`src/context/reducer.js`) and persisted to `localStorage` (optionally mirrored
to Supabase). Nothing in the left column touches a real institution.

| Concern | Simulated today (client-only) | What a real backend must own |
| --- | --- | --- |
| **Funding source** | `CONNECT_FUNDING` flips a `funding` object to `connected` with a fake institution + mask; a `/connect` page shows a mock "connecting…" flow with no login. | Real bank linking (e.g. Plaid) with OAuth to the institution, account/routing verification, and ownership checks. |
| **Balance** | `FUND_BALANCE` / `WITHDRAW_BALANCE` just add/subtract a number; `balance` is a field in local state. | A custody/ledger system holding actual customer funds (an FBO account at a program bank), double-entry accounting, reconciliation. |
| **Prediction settlement** | `PLACE_BET` debits `balance`; `RESOLVE_MARKET` credits wins and routes losses — outcomes are chosen locally against mock markets. | A real prediction-market/exchange backend: an events data feed, authoritative resolution, and settlement against a real order/position book. |
| **Loss-routing → "Invested"** | On a loss, `RESOLVE_MARKET` computes stake − 5% fee, credits a `destinations[]` entry's `balance`, and appends a `savings` entry. | Actual transfers into a real brokerage/IRA (an ACATS/ACH rail through an RIA + custodian), tax-lot handling, contribution-limit checks. |
| **Destination accounts** | `CONNECT_DESTINATION` / `SET_DEFAULT_DESTINATION` / `REMOVE_DESTINATION` manage a local `destinations[]` array (Roth IRA default). | Real brokerage/IRA account opening or linking, KYC on the account holder, and a custodian relationship. |
| **Platform fee** | `feesPaid` accumulates a local number (`LOSS_FEE_RATE = 0.05`). | Secure, auditable fee collection into a real revenue account with a paper trail. |
| **Identity / sync** | Optional Supabase auth + an `app_state` JSONB snapshot (see §3). Signed-out = anonymous, fully local. | Same, hardened: server-authoritative writes so a client can't mint balance or forge an "Invested" entry. |

**Bottom line for §2:** the demo's money is a set of integers in a JSON blob. The
backend's job is to replace each of those integers with a regulated, idempotent,
auditable movement of real dollars — a much larger undertaking than the UI implies.

## 3. Current architecture (accurate — this is what ships)

A **React 18** single-page app. State is a single `useReducer` tree behind
**Context** (`useApp`), with all transitions in the **pure reducer**
(`src/context/reducer.js`) — no DOM, no storage, no network in the reducer, which
is why it's unit-testable. State persists to **`localStorage`** and is versioned
(`SCHEMA_VERSION`) with a **migrator** (`migrateState`) that backfills missing
keys — including the new money-model fields (`balance`, `funding`,
`destinations`, `defaultDestinationId`, `feesPaid`) — so older snapshots load
without crashing.

Cloud sync is a **strictly additive, optional** layer:

```
React client (offline-first; reducer + localStorage are the source of truth)
        │  (only if VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set)
        ▼
Supabase Auth (email/password)  +  Postgres `app_state` table (one JSONB row/user)
        └─ Row-Level Security scopes every row to its owner
```

- `src/lib/supabase.js` — creates the client **only** when both env vars exist;
  otherwise exports `supabase = null` and `isSupabaseConfigured = false`, and the
  app runs fully local with zero network calls.
- `src/lib/cloudSync.js` — two thin helpers over the `app_state` table:
  `pullState(userId)` reads the saved snapshot, `pushState(userId, state)`
  upserts the whole reducer tree (with `schema_version` from `state.__v`),
  keyed/conflict-resolved on `user_id`. RLS enforces per-user isolation in the DB.
- Sync model is **last-write-wins on a full-state JSONB snapshot** — the entire
  reducer tree is one row. Sign-in pulls the cloud snapshot (via `HYDRATE`, which
  runs it through `migrateState`) or uploads local state on first sign-in.

**Why this shape:** it makes the existing client multi-device with minimal change
and keeps the reducer as the single source of truth across tiers. It is *not* a
money system — the JSONB snapshot faithfully stores the *simulated* balance and
"Invested" numbers, but Supabase here is a state mirror, not a ledger or custodian.

## 4. Data model (localStorage → tables, when Phase 2 normalizes)

The reducer's state shape is already a clean schema; today it lives inside one
`app_state` JSONB blob. When money becomes real it must be **normalized and made
server-authoritative** (all rows scoped by `user_id`, enforced with RLS):

- `profiles` (id, name, avatar, created_at) — 1:1 with auth user
- `settings` (user_id, daily_allowance, daily_stake_limit, cooloff_until)
- **`balances`** (user_id, cents, updated_at) — the funded balance, but as a
  *ledger position*, not a mutable integer (see §5)
- **`funding_sources`** (id, user_id, provider, provider_item_id, institution,
  mask, status) — a real Plaid/link item, not a fake `{connected: true}` flag
- **`destinations`** (id, user_id, kind, provider_account_id, institution, mask,
  status) — real linked brokerage/IRA/HYSA accounts
- **`ledger_entries`** (id, user_id, kind, amount_cents, source_account,
  dest_account, external_ref, idempotency_key, created_at) — the append-only
  double-entry log behind funding, settlement, loss-routing, and fees
- `positions` (id, user_id, market_id, outcome_id, stake, price, status, payout,
  placed_at) — settled against a real market, not locally
- `markets` (id, category, question, close_date, outcomes jsonb) — promoted from
  `data/markets.js`; later fed by a real events/resolution source
- `journal_entries` (…, reflection, mood_before, mood_after, …) — **most sensitive**
- `friendships`, `groups`/`group_members`, `challenges` — the **play-points**
  social layer stays play-only and never touches the money tables

> The pure reducer stays the **shared contract** for UI-facing transitions, but
> every money-moving action (`FUND_BALANCE`, `WITHDRAW_BALANCE`, `PLACE_BET`,
> `RESOLVE_MARKET`, `CONNECT_FUNDING`, `CONNECT_DESTINATION`) must, in the real
> product, be a *request* to the server — never an authoritative local mutation.

## 5. Roadmap to a REAL funded product (the honest, hard part)

The demo skips **all** of the following. Shipping a real "win it or invest it"
platform means building every one of them, and most are regulated:

1. **Bank / funding-source integration.** Replace the mock `/connect` flow with
   real aggregation (e.g. **Plaid**): institution OAuth, account + ownership
   verification, and pulling funds via ACH. The demo's `CONNECT_FUNDING` reaches
   no bank and stores a fake mask.
2. **A ledger / custody system for the balance.** The funded balance must be real
   customer money held in an **FBO / program-bank account**, tracked with
   **double-entry accounting**, reconciled daily. The demo's `balance` is a
   single number in a JSON blob.
3. **Brokerage / IRA integration to route losses.** "Invested" must actually move
   dollars into a **Roth IRA / brokerage / HYSA** via an **RIA + custodian**
   relationship (or a partner like a broker-dealer/robo-advisor), respecting
   **contribution limits** and tax-lot rules. The demo just increments a
   destination's `balance` field.
4. **Real prediction-market settlement.** Outcomes must come from an authoritative
   **events data feed** and settle against a real position/order book — not from a
   local `RESOLVE_MARKET` where the client picks the winner.
5. **KYC / AML.** Identity verification, sanctions/PEP screening, and ongoing
   transaction monitoring are required before touching customer funds. The demo
   does zero identity checks.
6. **Licensing & regulatory posture.** Depending on structure this can implicate
   **money-transmission licenses**, **broker-dealer** or **RIA / robo-advisory**
   registration, and prediction-market/derivatives oversight (e.g. CFTC-adjacent
   questions). None of this applies to a pure simulation; **all** of it applies
   the moment real dollars move.
7. **Secure, auditable fee collection.** The 5% platform fee must be collected
   into a real revenue account with a full audit trail — not accumulated in a
   `feesPaid` counter.
8. **Idempotent, transactional money movement.** Every transfer needs an
   **idempotency key**, exactly-once semantics, ret/reversal handling, and
   durable records so a retry or crash can never double-move funds. The demo's
   reducer actions are none of these — they are synchronous, in-memory, and
   trivially replayable without consequence.

**None of the above exists in the current app.** It is a demonstration of the
*experience* of a funded harm-reduction platform, deliberately built so that a
mistake costs nothing because nothing is real.

## 6. Recommended architecture for the real build (MVP)

Keep the client offline-first, but make money paths server-authoritative and
route regulated flows through **licensed partners** rather than custom code:

```
React client (kept offline-first; optimistic UI only)
        │  HTTPS + WebSocket
        ▼
Supabase  ──  Postgres (data)  +  Auth (identity)  +  Realtime (social)
        │      └─ Row-Level Security (per-user isolation, enforced in DB)
        ▼
Server / edge functions
   ├─ Plaid (funding-source linking + ACH pull)
   ├─ Custodian / program bank (FBO balance, double-entry ledger)
   ├─ RIA + brokerage custodian (Roth IRA / brokerage / HYSA routing)
   ├─ Prediction-market data feed + settlement job
   ├─ KYC/AML provider (identity, screening, monitoring)
   └─ Stripe (any subscription entitlements — not wagering)
```

**Why Supabase for the app tier:** managed Postgres + auth + realtime with
**row-level security**, the per-user isolation a sensitive journal/mood dataset
demands. But note the split: Supabase holds *product* state; **it is not the
ledger or the custodian.** Real money lives with regulated partners, and the
server orchestrates them idempotently. Keep the client thin on money: it renders
optimistic UI and requests transfers; the server (and its partners) are the truth.

## 7. Migration path (don't break the working demo)

1. **Stay offline-first.** The local reducer + `localStorage` remain the cache;
   signed-out stays anonymous and fully local. (✅ shipped)
2. **Auth as an additive gate**, not a wall — signing in *imports* existing local
   state (JSON export already exists; "claim my local progress" uploads it). (✅ shipped)
3. **Freeze money as simulated** until the real rails exist — clearly labeled as a
   demo everywhere balances, funding, and "Invested" appear.
4. **Server-authoritative money next:** normalize the `app_state` JSONB into the
   tables in §4 and make every money-moving action a validated server request
   before any real funds are introduced.
5. **Integrate one regulated rail at a time** behind the same `useApp` hooks
   (funding → balance ledger → destination routing → market settlement), each
   gated by KYC/AML and idempotency.
6. **Layer realtime** for social presence + live challenge settlement (play points).

## 8. Privacy, security & compliance (non-negotiable)

- **Sensitive data:** journal reflections + mood logs are mental-health-adjacent.
  Per-user RLS, encryption at rest + in transit, strict access logging, and a
  short-by-default retention policy.
- **Financial data raises the bar further:** balances, funding sources, and
  destination accounts are regulated PII; expect SOC 2-grade controls, KYC/AML
  recordkeeping, and audit trails once real money is involved.
- **User control:** data export (already shipped) + **hard delete** ("delete my
  account and everything") must exist before any real-money launch. GDPR/CCPA-aligned.
- **Never sell data.** Research/outcomes sharing is opt-in, de-identified,
  aggregated, and IRB-reviewed (see MONETIZATION §3E).
- **The harm-reduction invariants survive the backend:** the fee is transparent,
  losses always route to *the user's own* destination account, and "savings
  before investing"-style guardrails avoid reintroducing loss variance. Real
  balance/IRA flows go through **licensed partners** (program bank / RIA +
  custodian / broker-dealer) with KYC/AML — **never** custom money movement. If
  **subscription payments** are added, Stripe handles PCI; our server only stores
  entitlements.

## 9. What does *not* change

- The product thesis (*"Win it, or invest it. Never just lose it."*), the calm
  design language, and the harm-reduction intent.
- The pure reducer and its tests — they stay the cross-tier contract for
  UI-facing transitions (money actions become server-backed).
- The client stays usable offline as a demo; the backend augments it into a real
  product, it doesn't replace the experience.
- **The play-points social layer stays play-only** and never touches real money.

---

**Bottom line:** the client-only *demo* is done, and **backend Phase 1 (optional
auth + full-state sync) is implemented** — but the demo's funding, balance,
prediction settlement, loss-routing, and account connections are **entirely
simulated in the reducer, contacting no real financial institution and moving no
money.** Turning it into the real "win it or invest it" platform means building
bank/funding integration (Plaid), a custody/ledger for the balance, brokerage/IRA
routing via an RIA + custodian, real market settlement, KYC/AML, the applicable
money-transmission / broker-dealer / robo-advisory licensing, secure fee
collection, and idempotent transactional money movement — **none of which the
current app does.**
