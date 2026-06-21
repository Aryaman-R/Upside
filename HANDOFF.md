# Upside — Handoff

Handoff doc for the next person/agent picking this up. Pairs with
[`README.md`](README.md) (product) and [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md)
(architecture).

---

## Wave 5 — backend Phase 1: auth + cloud sync ☁️

The backend has begun. **Phase 1 (auth + offline-first sync) is implemented** and
**optional** — with no env vars the app runs exactly as before (fully local).

- **Schema:** `supabase/migrations/0001_init.sql` — a per-user `app_state` JSONB
  snapshot with **Row-Level Security** (every row scoped to `auth.uid()`).
- **Auth:** Supabase email/password (`src/context/AuthContext.jsx`,
  `src/lib/supabase.js`); inert when unconfigured.
- **Sync:** `src/lib/cloudSync.js` + wiring in `AppContext.jsx` — on sign-in,
  pull the cloud snapshot or upload local ("claim local progress"); debounced
  push on change; `syncStatus` shown in the Settings **Account card** + a TopBar
  chip. Reducer gained a `HYDRATE` action (migrate + replace).
- **Setup:** [`supabase/README.md`](supabase/README.md); copy `.env.example` →
  `.env.local`. `.env*` is gitignored.
- **Verified:** `npm test` (15), `npm run lint`, `npm run build`, and a no-env
  boot (HTTP 200) all pass.

**Next: Phase 2 — server-authoritative money** (normalize the JSONB snapshot into
tables; validate point/position/challenge writes server-side). See
[`docs/BACKEND.md`](docs/BACKEND.md) §7.

> ⚠️ Live end-to-end sync needs a real Supabase project (URL + anon key) + the
> migration applied — that can't be provisioned from this repo. The code is
> wired and builds; it activates the moment those env vars are present.

---

## Wave 4 — quality, responsible-gambling depth, backend boundary 🧰

This wave hardened the app and pushed the **frontend-only** roadmap to its
sensible end:

- **Pure, tested reducer.** All state logic extracted to
  `src/context/reducer.js` (no React); **14 unit tests** via Node's built-in
  runner (`npm test`) cover bets, overdraw/limit/cool-off guards, market +
  challenge settlement, savings, streak transitions, daily allowance, friend
  dedupe, and migration. `AppContext` is now thin React glue.
- **Responsible-gambling controls.** Self-imposed **daily stake limit** and
  **"take a break" cool-off** (24h/3d/1wk), enforced in the reducer and surfaced
  across Settings, betting, and challenges (urge tools stay open during a break).
- **Date-aware settlement.** Closed markets are flagged "ready to settle" in
  Portfolio with a "Settle all closed" bulk action.
- **Journal home + export.** Urge reflections now appear on Insights; CSV export
  added in Settings (alongside JSON).
- **Accessibility.** Modal now has a real focus trap (Tab cycling) + focus
  restore on close.
- **Backend boundary defined.** [`docs/BACKEND.md`](docs/BACKEND.md) marks where
  client-only ends and what a backend unlocks (accounts/sync, real multiplayer,
  outcomes measurement, payments) — the recommended next increment is **Phase 1:
  auth + sync**.

Verified: `npm test` (14 pass), `npm run lint`, `npm run build` all clean.

---

## Wave 3 — professional UI + social 🎨

- **Design-system overhaul** for a professional, product-grade look (away from
  the "vibecoded" emoji-icon feel): a dependency-free inline-SVG icon set
  (`src/components/ui/Icon.jsx`) replacing emoji-as-icons across nav, stat tiles,
  the top bar, and trends; refined tokens (neutral surface scale, subtler
  borders/shadows, tighter radii + heading tracking) in `tailwind.config.js` +
  `index.css`; reworked `Button`/`Badge`/`StatTile`/`ProgressBar`; a real logo
  mark and refined sidebar/top-bar.
- **Social features** (`src/pages/Social.jsx`, `src/components/social/*`,
  `src/data/social.js`): add/remove **friends** (from a mock suggestion pool),
  create/leave **groups** with a shared play-money standings board, and run
  **head-to-head challenges** — stake play points on a pick vs a friend, settle
  to award the 2× matched pot. New reducer actions: `ADD_FRIEND`,
  `REMOVE_FRIEND`, `CREATE_GROUP`, `LEAVE_GROUP`, `CREATE_CHALLENGE`,
  `RESOLVE_CHALLENGE`. The social graph is **mock + local** — real multiplayer
  (presence, invites, matched settlement) needs a backend.

Verified: `npm run build` + `npm run lint` pass clean after the wave.

---

## Wave 2 — what was just added ✨

The second build wave (UI refresh + feature depth) landed:

- **Polymarket-style UI refresh.** Market cards now show implied-probability
  bars, a deterministic price **sparkline**, cents-style odds, and a 7-day
  trend. New dependency-free SVG chart primitives (`Sparkline`, `Donut`,
  `BarChart`) and a sticky **TopBar** (live balances, streak, daily claim,
  profile) frame every page.
- **Onboarding & personalization.** A first-run, non-dismissable
  `OnboardingModal` (philosophy → name/avatar → daily allowance). Profile +
  allowance are editable in a new **Settings** page.
- **Settings & data controls.** Edit profile/allowance, **export data** (JSON
  download), and a confirm-gated **Reset progress**. State is now **versioned**
  (`upside.state.v2`) with a `migrateState` backfill so older blobs load safely.
- **Live streak + daily allowance.** `CHECK_IN` advances a real day-over-day
  streak on load; `CLAIM_DAILY` grants a once-per-day play-point allowance.
- **Date-aware markets.** `marketStatus()` drives "closing soon"/"closed"
  treatment; closed markets reject new bets in both the card and bet modal.
- **Insights page.** Cumulative Money-Kept curve, win-rate donut, and
  before/after mood bars — all derived locally.
- **Monetization.** [`docs/MONETIZATION.md`](docs/MONETIZATION.md) + a
  non-functional **Upside Plus** teaser (`/plus`). No payments, no pay-to-win.

Verified: `npm run build` and `npm run lint` both pass clean after the wave.

---

## Current state — what's done ✅

A complete, runnable frontend-only MVP. `npm install && npm run dev` works out of
the box; `npm run build` and `npm run lint` both pass clean.

All five MVP feature areas are implemented and wired to shared state:

- **Play-money prediction markets** — 10 mock markets across 5 categories with
  category filtering; Yes/No and multi-outcome; stake play points via a bet
  modal with quick-stakes, live payout preview, and balance guard.
- **Portfolio** — open positions grouped by market, "Simulate result" mock
  resolution (probability-weighted), settled win/loss history, KPI tiles.
- **Leaderboard** — 10 mock rivals with the real user merged in, highlighted,
  and ranked live by points.
- **Money Kept (savings redirect)** — running total, editable goal + progress
  bar, milestone copy, quick-add redirect form with notes, full history log.
- **Urge-intervention flow** — persistent, always-available button opening a
  4-step flow (cooldown timer → reflection journal → redirect-to-savings →
  support resources), logging a journal entry.
- **Dashboard** — KPIs (points, money kept, open positions, standing/streak),
  savings progress, open-position snapshot, safety strip.

Cross-cutting:
- Single `useReducer` + Context store (`src/context/AppContext.jsx`) with
  optional `localStorage` persistence.
- Reusable UI kit (`Button`, `Card`, `Badge`, `Modal`, `ProgressBar`,
  `StatTile`).
- Seeded initial state so every screen is populated on first run.
- Responsive layout (desktop sidebar / mobile top-strip + floating urge button).
- Real support resources (1-800-GAMBLER, NCPG, Gamblers Anonymous, 988) in the
  urge flow and footer.
- Documentation: README, implementation/architecture doc, this handoff.

### Verified
- `npm install` — clean (some upstream deprecation/audit warnings, none
  blocking).
- `npm test` — 14 reducer unit tests pass (Node's built-in runner, no deps).
- `npm run build` — succeeds (~72 modules, ~80 kB gzipped JS).
- `npm run dev` — boots on :5173, serves HTTP 200.
- `npm run lint` — passes with no errors.

---

## Known gaps & limitations ⚠️

These are intentional MVP boundaries or honest rough edges, not bugs:

1. **Reducer is unit-tested; no e2e yet.** `npm test` runs 14 reducer tests
   (`src/context/reducer.test.js`). There's still no component/e2e coverage — a
   Playwright smoke test of onboarding → bet → settle → savings → urge is the
   next testing increment (and needs a browser, so it's CI-oriented).
2. **Manual UI verification only.** The build, lint, and server-boot were
   verified programmatically; full click-through interaction testing in a real
   browser was not automated. Recommend a manual pass or Playwright smoke tests.
3. **No TypeScript.** Types are documented (JSDoc + IMPLEMENTATION.md) but not
   enforced. Migration would be a clean, contained improvement.
4. **Markets still don't *auto*-resolve.** They are now date-aware (betting locks
   after `closeDate`), but settlement is still user-triggered ("Simulate result")
   to keep the demo deterministic. A date-based auto-settle is still optional.
5. **Sparklines/trends are synthetic.** Market price history is deterministically
   generated from the market id (no real feed) — cosmetic by design.
6. **Accessibility improved, not audited.** Modals now trap focus + restore it
   on close; focus ring, Escape-to-close, and ARIA are in. A full screen-reader
   pass (labels on every control, live-region announcements) is still pending.
7. **Single local user.** Profile (name/avatar/allowance) is now editable, but
   there's still no auth/accounts or multi-device sync — all state is local.
8. **Upside Plus is a teaser only.** `/plus` collects no payment and makes no
   network call; "join waitlist" just sets local state.

---

## Recommended next steps 🚀

**The frontend-only roadmap is effectively complete.** Waves 2–4 cleared the
original list (state versioning, reset, date-aware markets + settle, live streak,
onboarding/personalization, insights, responsible-gambling limits, reducer tests,
modal a11y). The remaining frontend polish is small; the substantive work now
needs a server.

**Frontend polish still doable without a backend** (optional, low priority):
1. **Playwright e2e** smoke test (onboarding → bet → settle → savings → urge) —
   CI-oriented since it needs a browser. (Reducer is already unit-tested.)
2. **TypeScript migration** for the data models + reducer.
3. **Full a11y audit** (screen-reader labels, live regions).

**Backend is underway** — see [`docs/BACKEND.md`](docs/BACKEND.md). **Phase 1
(auth + sync) is done** (Wave 5). The next increment is **Phase 2:
server-authoritative money** — normalize the `app_state` JSONB snapshot into
tables (positions, journal, social, …) and validate point/position/challenge
writes server-side, then layer **Phase 3 real-time social**. Everything
money-related stays bound by the no-real-money invariants. To run Phase 1 live,
create a Supabase project and follow [`supabase/README.md`](supabase/README.md).

---

## Things to NOT build (by design) 🚫

Carried forward from the brief — do not add these:

- **Real-money betting / wagering, or any cash value for points.**
- **Roth IRA / retirement / investment funding flows**, or anything that moves
  real money. "Money Kept" must stay a *simulation*. (Rationale in
  `README.md` → _Out of scope_ and `docs/IMPLEMENTATION.md` → §6.)
- **A backend / accounts / payments** for app data.

These are excluded for legal/operational reasons and because they cut against
the harm-reduction goal. If a future direction needs real money movement, that's
a product/legal decision — not a quick feature.

---

## Where things live (quick map)

| You want to… | Look at |
| --- | --- |
| Change app state / actions | `src/context/AppContext.jsx` |
| Add/edit markets / price history | `src/data/markets.js` |
| Edit leaderboard rivals | `src/data/leaderboard.js` |
| Edit urge prompts / moods | `src/data/prompts.js` |
| Edit support resources | `src/data/resources.js` |
| Edit avatars / allowance options | `src/data/avatars.js` |
| Edit social graph / suggestions | `src/data/social.js` |
| Tweak friends / groups / challenges | `src/pages/Social.jsx`, `src/components/social/*` |
| Add/restyle an icon | `src/components/ui/Icon.jsx` |
| Tweak the urge flow | `src/components/urge/UrgeModal.jsx` |
| Tweak onboarding | `src/components/onboarding/OnboardingModal.jsx` |
| Tweak betting | `src/components/markets/BetModal.jsx` |
| Tweak market cards / charts | `src/components/markets/MarketCard.jsx`, `src/components/ui/{Sparkline,Donut,BarChart}.jsx` |
| Tweak the top bar | `src/components/layout/TopBar.jsx` |
| Date/streak/format helpers | `src/lib/format.js` |
| Restyle the brand | `tailwind.config.js`, `src/index.css` |
| Add a page/route | `src/App.jsx` + `src/pages/` + `src/components/layout/Layout.jsx` |
| Revenue strategy | `docs/MONETIZATION.md` |
