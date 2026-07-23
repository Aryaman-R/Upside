# Upside — Handoff

Handoff doc for the next person/agent picking this up. Pairs with
[`README.md`](README.md) (product) and [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md)
(architecture).

> **The model, in one line:** _"Win it, or invest it. Never just lose it."_
> Upside is a funded prediction platform where **you can't really lose** — a
> winning prediction pays your balance, and a losing one routes your stake
> (minus a small fee) into your Roth IRA instead of vanishing.
>
> **Honesty caveat (read this first):** the whole app is a **DEMO**. Every
> balance, deposit, withdrawal, and account connection is **SIMULATED**.
> Connecting a bank or a Roth IRA is a mock flow — no login is ever requested,
> no real financial institution is contacted, and **no real money ever moves**.
> The app *presents* a real-money product and *simulates* all of it.

---

## Wave 6 — the funded model + connected accounts + walkthrough 💵

This wave was the big product pivot: from play-money "points" to a funded
**"you can't really lose"** prediction platform (still fully simulated). What
landed:

- **Funded dollar balance.** You fund an Upside `balance` (dollars) from a
  connected bank/debit **funding source**, then stake dollars from it on
  real-event markets. `PLACE_BET` now debits the balance in dollars.
- **Connected destination accounts.** You link one or more **destinations** for
  redirected losses — a **Roth IRA** (default), a **high-yield savings** account,
  and/or **other retirement** (Traditional IRA / 401(k) / 529).
- **Win / lose mechanics** (`RESOLVE_MARKET`):
  - **WIN** → stake + profit are paid back into your `balance` (withdrawable).
  - **LOSE** → the stake, minus a small **5% platform fee** (`LOSS_FEE_RATE`),
    is routed into the default destination account and logged in the reframed
    **"Invested"** tracker. Net worth only ever dips by that small fee — a loss
    becomes money invested in your future, not money gone.
- **"Money Kept" → "Invested" reframe.** The old simulated savings log is now
  the **Invested** tracker (`state.savings` still: `{goal, total, entries}`).
  Entries now carry `kind: 'loss' | 'redirect'` and a `destinationId`; loss
  entries also carry the `fee`. Nav label is now **"Invested"** (route stays
  `/money-kept`).
- **New Connect Accounts page** at **`/connect`** (`src/pages/ConnectAccounts.jsx`)
  with a `ConnectAccountModal` + `FundBalanceModal` (in `src/components/accounts/`).
  A new **"Accounts"** nav entry points here. The page opens with a plain
  simulation banner and a "how the money moves" three-step explainer.
- **Wired-up urge flow.** The always-available **"Take a pause"** urge
  intervention is now a **persistent button** in the UI (desktop sidebar +
  mobile floating pill in `Layout.jsx`) — previously the flow existed but was
  orphaned/unreachable. It never locks, even during a cool-off break.
- **Guided walkthrough — "One evening with Upside."** An in-app spotlight tour
  (`src/components/tour/GuidedTour.jsx`, steps in `src/data/tour.js`) offered
  once after onboarding, replayable from **Settings** and via **`?tour=1`**.
  It walks: fund your balance → connect a Roth IRA → place a prediction → see a
  loss become money invested → find the safety tools.
- **"points" demoted to a play currency.** Points still exist, but **only** as a
  secondary social/play currency: the leaderboard, head-to-head challenges, and
  the once-daily play allowance. The core prediction loop is now **dollars**.

Verified: `npm test` (17 pass), `npm run lint`, `npm run build` all clean.

### New/changed state & actions

- **State shape** (`src/context/reducer.js`, `createInitialState`), new keys:
  `balance` (number), `funding` `{connected, institution, mask, connectedAt}`,
  `destinations` (array of `{id, kind, institution, mask, balance, connectedAt}`),
  `defaultDestinationId`, `feesPaid`, and `tour` `{status, step}`. `savings` is
  the Invested tracker. **`SCHEMA_VERSION` is now 4** and `migrateState`
  backfills all new keys so older blobs still load.
- **New actions:** `CONNECT_FUNDING`, `FUND_BALANCE`, `WITHDRAW_BALANCE`,
  `CONNECT_DESTINATION`, `SET_DEFAULT_DESTINATION`, `REMOVE_DESTINATION`,
  `START_TOUR`, `SET_TOUR_STEP`, `END_TOUR`.
- **Reworked actions:** `PLACE_BET` (dollars from `balance`), `RESOLVE_MARKET`
  (win → balance, loss → destination minus fee, logged as Invested),
  `ADD_SAVINGS` (a manual redirect — credits the default destination, **no fee**,
  since it's your own money going where you choose).
- **Format helpers** (`src/lib/format.js`): added `payoutDollars`,
  `profitDollars`, `lossSplit`, `round2`, `ACCOUNT_KINDS`, and
  `accountKindLabel`.
- **New data:** `src/data/accounts.js` (funding + destination institution
  catalogue, all clearly marked simulated) and `src/data/tour.js` (walkthrough
  steps).

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
  chip. Reducer gained a `HYDRATE` action (migrate + replace). Because the
  snapshot is versioned, a device on an older schema is safely migrated on pull.
- **Setup:** [`supabase/README.md`](supabase/README.md); copy `.env.example` →
  `.env.local`. `.env*` is gitignored.

**Next: Phase 2 — server-authoritative money** (normalize the JSONB snapshot into
tables; validate balance/position/destination/challenge writes server-side). See
[`docs/BACKEND.md`](docs/BACKEND.md) §7.

> ⚠️ Live end-to-end sync needs a real Supabase project (URL + anon key) + the
> migration applied — that can't be provisioned from this repo. The code is
> wired and builds; it activates the moment those env vars are present.

---

## Wave 4 — quality, responsible-gambling depth, backend boundary 🧰

This wave hardened the app and pushed the **frontend-only** roadmap to its
sensible end:

- **Pure, tested reducer.** All state logic extracted to
  `src/context/reducer.js` (no React); unit tests via Node's built-in runner
  (`npm test`) cover bets, overdraw/limit/cool-off guards, market + challenge
  settlement, savings, streak transitions, daily allowance, friend dedupe, and
  migration. `AppContext` is now thin React glue. (The suite has since grown to
  **17 tests** for the dollar model + new account/tour actions.)
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
  outcomes measurement, payments).

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
  create/leave **groups** with a shared play-points standings board, and run
  **head-to-head challenges** — stake **play points** on a pick vs a friend,
  settle to award the 2× matched pot. New reducer actions: `ADD_FRIEND`,
  `REMOVE_FRIEND`, `CREATE_GROUP`, `LEAVE_GROUP`, `CREATE_CHALLENGE`,
  `RESOLVE_CHALLENGE`. The social graph is **mock + local** — real multiplayer
  (presence, invites, matched settlement) needs a backend. Note: challenges are
  the one place points still drive a stake; the core prediction loop is dollars.

---

## Wave 2 — what was just added ✨

The second build wave (UI refresh + feature depth) landed:

- **Polymarket-style UI refresh.** Market cards show implied-probability bars, a
  deterministic price **sparkline**, cents-style odds, and a 7-day trend. New
  dependency-free SVG chart primitives (`Sparkline`, `Donut`, `BarChart`) and a
  sticky **TopBar** (live balances, streak, daily claim, profile) frame every
  page.
- **Onboarding & personalization.** A first-run, non-dismissable
  `OnboardingModal` (philosophy → name/avatar → daily allowance) that now chains
  into the **guided walkthrough offer**. Profile + allowance are editable in a
  new **Settings** page.
- **Settings & data controls.** Edit profile/allowance, **export data** (JSON /
  CSV), and a confirm-gated **Reset progress**. State is **versioned** with a
  `migrateState` backfill so older blobs load safely.
- **Live streak + daily allowance.** `CHECK_IN` advances a real day-over-day
  streak on load; `CLAIM_DAILY` grants a once-per-day play-point allowance.
- **Date-aware markets.** `marketStatus()` drives "closing soon"/"closed"
  treatment; closed markets reject new predictions in both the card and modal.
- **Insights page.** Cumulative Invested curve, win-rate donut, and
  before/after mood bars — all derived locally.
- **Monetization.** [`docs/MONETIZATION.md`](docs/MONETIZATION.md) + a
  non-functional **Upside Plus** teaser (`/plus`).

---

## Current state — what's done ✅

A complete, runnable frontend-first MVP of the **funded "you can't really lose"**
model (all simulated). `npm install && npm run dev` works out of the box;
`npm run build` and `npm run lint` both pass clean.

All feature areas are implemented and wired to shared state:

- **Funded prediction markets** — 10 mock markets across 5 categories with
  category filtering; Yes/No and multi-outcome; stake **dollars** from your
  Upside balance via a bet modal with quick-stakes, live payout preview, and a
  balance guard.
- **Portfolio** — open positions grouped by market, "Simulate result" mock
  resolution (probability-weighted); a **win** pays your balance, a **loss**
  routes into your Roth IRA (minus the 5% fee) and shows up as Invested; settled
  history + KPI tiles.
- **Connect Accounts (`/connect`)** — link a **funding source** (bank/debit),
  connect **destination accounts** (Roth IRA / HYSA / other retirement), fund the
  balance (`FundBalanceModal`), and pick the **default destination** for
  redirected losses. A clear banner states everything is a simulated mock.
- **Invested (`/money-kept`, "savings redirect")** — running total, editable
  goal + progress bar, milestone copy, quick-add redirect form with notes, full
  history log distinguishing routed **losses** from manual **redirects**.
- **Leaderboard + Social** — 10 mock rivals with the real user merged in and
  ranked live by **play points**; friends, groups, and friendly head-to-head
  challenges (play points).
- **Urge-intervention flow** — **persistent, always-available "Take a pause"
  button** (desktop sidebar + mobile floating pill) opening a 4-step flow
  (cooldown timer → reflection journal → redirect-to-Invested → support
  resources), logging a journal entry. Never locks, even during a cool-off.
- **Guided walkthrough — "One evening with Upside"** — a spotlight tour offered
  after onboarding, replayable from Settings or via `?tour=1`.
- **Dashboard** — KPIs (balance, invested, open positions, standing/streak),
  Invested progress, open-position snapshot, safety strip.

Cross-cutting:
- Single `useReducer` + Context store (`src/context/AppContext.jsx`) with
  optional `localStorage` persistence and optional Supabase cloud sync.
- Reusable UI kit (`Button`, `Card`, `Badge`, `Modal`, `ProgressBar`,
  `StatTile`).
- Seeded initial state (pre-connected funding + a Roth destination) so every
  screen is populated on first run.
- Responsive layout (desktop sidebar / mobile top-strip + floating urge button).
- Real support resources (1-800-GAMBLER, NCPG, Gamblers Anonymous, 988) in the
  urge flow and footer.
- Documentation: README, implementation/architecture doc, this handoff.

### Verified
- `npm install` — clean (some upstream deprecation/audit warnings, none
  blocking).
- `npm test` — **17 reducer unit tests pass** (Node's built-in runner, no deps),
  covering the dollar model + new account/tour actions.
- `npm run build` — succeeds.
- `npm run dev` — boots on :5173, serves HTTP 200.
- `npm run lint` — passes with no errors.

---

## Harm-reduction mission — this is still the point 🎯

The funded model exists to **change the ending of a losing bet**, not to
encourage more betting. The safety layer is central and all present:

- **The "can't really lose" mechanic itself** — a loss becomes money invested in
  your future (Roth IRA by default), so your net worth only ever dips by the
  small fee.
- **Persistent "Take a pause" urge flow** — reachable from anywhere, never locks.
- **Self-imposed daily stake limits** (now in **dollars**) and **cool-off
  breaks** (24h / 3d / 1wk), enforced in the reducer.
- **Real help lines** — 1-800-GAMBLER, 988, Gamblers Anonymous — in the urge
  flow and footer.

Keep this front-and-center in any future work. If a change makes it easier to
chase losses or harder to reach the pause tools, it's the wrong change.

---

## Known gaps & limitations ⚠️

These are intentional MVP boundaries or honest rough edges, not bugs:

1. **Everything financial is SIMULATED.** No bank, Roth IRA, or brokerage is
   ever contacted; no login is requested; no real money moves. Connecting an
   account runs a fake "connecting…" animation and stores a name + a masked
   number (`src/data/accounts.js`, `ConnectAccountModal`). This is a demo of a
   real-money product, not the product.
2. **Reducer is unit-tested; no e2e yet.** `npm test` runs 17 reducer tests
   (`src/context/reducer.test.js`). There's still no component/e2e coverage — a
   Playwright smoke test of onboarding → connect → fund → predict → settle
   (win + loss) → urge is the next testing increment (needs a browser, so it's
   CI-oriented).
3. **Manual UI verification only.** Build, lint, and server-boot were verified
   programmatically; full click-through testing in a real browser was not
   automated. Recommend a manual pass or Playwright smoke tests.
4. **No TypeScript.** Types are documented (JSDoc + IMPLEMENTATION.md) but not
   enforced. Migration would be a clean, contained improvement.
5. **Markets still don't *auto*-resolve.** They are date-aware (predicting locks
   after `closeDate`), but settlement is user-triggered ("Simulate result") to
   keep the demo deterministic. A date-based auto-settle is still optional.
6. **Sparklines/trends are synthetic.** Market price history is
   deterministically generated from the market id (no real feed) — cosmetic by
   design.
7. **Accessibility improved, not audited.** Modals trap focus + restore it on
   close; focus ring, Escape-to-close, and ARIA are in. A full screen-reader
   pass is still pending.
8. **Single local user.** Profile is editable and optional cloud sync exists, but
   there's no server-authoritative money yet — the balance, destinations, and
   Invested totals are all client-side.
9. **Upside Plus is a teaser only.** `/plus` collects no payment and makes no
   network call.

---

## Recommended next steps 🚀

**The funded-model frontend is built** (connect mockups, funded balance, the
Invested reframe, the wired-up urge flow, and the guided walkthrough all
landed). Remaining frontend polish is small; the substantive work now needs a
server.

**Frontend polish still doable without a backend** (optional, low priority):
1. **Playwright e2e** smoke test (onboarding → connect → fund → predict →
   settle win + loss → urge) — CI-oriented since it needs a browser.
2. **TypeScript migration** for the data models + reducer (now including the
   account/balance shapes).
3. **Full a11y audit** (screen-reader labels, live regions), especially on the
   new Connect Accounts flow and the walkthrough spotlight.

**Backend is underway** — see [`docs/BACKEND.md`](docs/BACKEND.md). **Phase 1
(auth + sync) is done** (Wave 5). The next increment is **Phase 2:
server-authoritative money** — normalize the `app_state` JSONB snapshot into
tables (balance, positions, destinations, invested log, social, …) and validate
balance/position/destination/challenge writes server-side, then layer **Phase 3
real-time social**.

> The one hard line that stays: **this remains a simulation of a real-money
> product.** Any move toward *actual* funds movement, real bank/IRA connections,
> or real withdrawals is a serious product/legal/compliance decision (money
> transmission, custody, KYC, securities/retirement-account rules) — not a quick
> feature. Until that decision is made and the compliance work is done, keep the
> simulation honest: keep the "demo / no real money moves" disclosure visible.

---

## Things to keep honest (by design) 🚫

- **Keep the simulation disclosure visible.** The Connect Accounts banner and
  onboarding/walkthrough copy must keep stating that connections are mocked and
  no money moves. Do not quietly imply real funds are involved.
- **Don't turn the safety tools into friction-for-betting or remove them.** The
  pause flow, stake limits, and cool-offs are load-bearing, not optional chrome.
- **Don't let "points" creep back into the money loop.** Points are a play/social
  currency only (leaderboard + challenges + daily allowance). The prediction
  loop is dollars from the funded balance.
- **No pay-to-win / no selling an edge.** Monetization is the transparent 5% loss
  fee (and a benign Plus teaser) — not advantages that encourage more staking.

If a future direction needs real money movement, that's a product/legal decision
(see the Phase 2/3 note above) — not a drop-in change.

---

## Where things live (quick map)

| You want to… | Look at |
| --- | --- |
| Change app state / actions | `src/context/reducer.js` (pure) + `src/context/AppContext.jsx` (glue) |
| Tweak the funded balance / win-loss / fee logic | `src/context/reducer.js` (`PLACE_BET`, `RESOLVE_MARKET`, `LOSS_FEE_RATE`) |
| Tweak connect / fund / destination flows | `src/pages/ConnectAccounts.jsx`, `src/components/accounts/{ConnectAccountModal,FundBalanceModal}.jsx` |
| Edit funding / destination institutions | `src/data/accounts.js` |
| Edit the guided walkthrough | `src/data/tour.js`, `src/components/tour/GuidedTour.jsx` |
| Add/edit markets / price history | `src/data/markets.js` |
| Edit leaderboard rivals | `src/data/leaderboard.js` |
| Edit urge prompts / moods | `src/data/prompts.js` |
| Edit support resources | `src/data/resources.js` |
| Edit avatars / allowance options | `src/data/avatars.js` |
| Edit social graph / suggestions | `src/data/social.js` |
| Tweak friends / groups / challenges | `src/pages/Social.jsx`, `src/components/social/*` |
| Add/restyle an icon | `src/components/ui/Icon.jsx` |
| Tweak the urge flow / "Take a pause" button | `src/components/urge/UrgeModal.jsx`, `src/components/layout/Layout.jsx` |
| Tweak onboarding | `src/components/onboarding/OnboardingModal.jsx` |
| Tweak betting | `src/components/markets/BetModal.jsx` |
| Tweak market cards / charts | `src/components/markets/MarketCard.jsx`, `src/components/ui/{Sparkline,Donut,BarChart}.jsx` |
| Tweak the top bar | `src/components/layout/TopBar.jsx` |
| Money/date/streak/format helpers | `src/lib/format.js` (`payoutDollars`, `profitDollars`, `lossSplit`, `accountKindLabel`, …) |
| Restyle the brand | `tailwind.config.js`, `src/index.css` |
| Add a page/route | `src/App.jsx` + `src/pages/` + `src/components/layout/Layout.jsx` |
| Backend / cloud sync | `src/lib/{supabase,cloudSync}.js`, `src/context/AuthContext.jsx`, `supabase/` |
| Revenue strategy | `docs/MONETIZATION.md` |
