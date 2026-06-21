# Upside — Implementation & Architecture

This document covers how Upside is built: architecture, state flow, data models,
component breakdown, and the reasoning behind key decisions. For a product
overview see [`../README.md`](../README.md); for status and next steps see
[`../HANDOFF.md`](../HANDOFF.md).

---

## 1. Architecture overview

Upside is a **100% client-side single-page app**. There is no backend, no API,
and no real-money handling anywhere in the system.

```
┌──────────────────────────────────────────────────────────────┐
│ index.html → main.jsx                                         │
│   <BrowserRouter>                                             │
│     <AppProvider>   ← all state lives here (useReducer)       │
│       <App>                                                   │
│         <Layout>    ← sidebar nav + persistent "Urge?" button │
│           <Routes>  ← Dashboard / Markets / Portfolio /       │
│                       Leaderboard / MoneyKept                 │
│         <UrgeModal> ← global intervention flow                │
└──────────────────────────────────────────────────────────────┘
```

- **State management:** a single `useReducer` store exposed through React
  Context (`AppContext`). The **pure reducer + initial state + migration live in
  `src/context/reducer.js`** (no React/JSX) so they can be unit-tested directly
  (`src/context/reducer.test.js`, run via `npm test`); `AppContext.jsx` is thin
  React glue (hydration, persistence, derived values). Every page reads/writes
  through the `useApp()` hook. No Redux, no external state library.
- **Persistence (optional):** the entire state object is serialized to
  `localStorage` (key `upside.state.v2`) on every change and rehydrated on load.
  The schema is versioned (`SCHEMA_VERSION`, currently `3`) and `migrateState`
  backfills any keys an older blob is missing, so shape changes don't crash the
  app. Fully functional with storage disabled (degrades to in-memory only).
- **Routing:** `react-router-dom` with five routes plus a catch-all redirect.
- **Styling:** Tailwind CSS utility classes, with two shared component classes
  (`.surface`, `.surface-muted`) defined in `index.css` and a small brand color
  scale in `tailwind.config.js`.

### Why this shape

- The brief calls for a frontend-only MVP with mock data and local state. A
  single reducer + context is the least-surprising way to model "one user, a
  handful of related slices of state, lots of small actions."
- Keeping **all** mutation in one reducer means every way the user can change
  points, positions, savings, or journal entries is enumerable in one file
  (`AppContext.jsx`) — useful for auditing that nothing touches real money.

---

## 2. Data models

All types are plain JS objects (no TypeScript in the MVP). Shapes below use
TS-like notation for clarity only.

### Market (`src/data/markets.js`)
```ts
Market {
  id: string
  category: 'Sports' | 'Crypto' | 'News' | 'Pop Culture' | 'Science'
  question: string
  closeDate: string          // ISO date
  volume: number             // cosmetic "points traded"
  outcomes: Outcome[]
}
Outcome {
  id: string
  label: string
  price: number              // 0..1 implied probability; also drives payout odds
}
```
`price` is doing double duty: it's the implied probability shown as a percentage,
and `1 / price` is the play-points payout multiplier (a 25%-priced outcome pays
4× the staked points if it wins). Prices within a market sum to ≈ 1.0.

### Position (runtime, in `AppContext` state)
```ts
Position {
  id: string
  marketId: string
  outcomeId: string
  outcomeLabel: string
  question: string           // denormalized for easy display
  stake: number              // points staked
  price: number              // price at time of bet
  status: 'open' | 'won' | 'lost'
  payout: number             // points won (0 until resolved/lost)
  placedAt: string           // ISO timestamp
}
```

### Savings ("Money Kept")
```ts
Savings {
  goal: number               // dollar goal for the progress bar
  total: number              // simulated dollars saved
  entries: SavingsEntry[]
}
SavingsEntry { id: string; amount: number; note: string; createdAt: string }
```
> `total`/`amount` are **dollars in a simulation** — a motivational counter. No
> real funds exist or move.

### Journal entry (urge intervention)
```ts
JournalEntry {
  id: string
  createdAt: string
  prompt: string
  reflection: string
  moodBefore: string | null  // mood tag id
  moodAfter: string | null
  savedSnapshot: number      // total money kept at the moment of the urge
}
```

### Leaderboard player (`src/data/leaderboard.js`)
```ts
Player { id: string; name: string; points: number; avatar: string; streak: number }
```
The current user is merged into this list at render time, never stored in it.

### Full app state
```ts
AppState {
  __v: number                      // schema version (migrated on load)
  onboarded: boolean               // gates the first-run onboarding modal
  user:    { id, name, avatar }
  settings: {
    dailyAllowance: number         // once-a-day claimable play points
    dailyStakeLimit: number        // self-imposed daily cap (0 = off)
    cooloffUntil: string | null    // ISO timestamp of a "take a break" window
  }
  lastActive: string               // day key (YYYY-MM-DD) for the streak
  lastAllowanceClaim: string|null  // day key of the last daily claim
  stakedToday: { day: string, amount: number }  // for the stake limit
  points:  number                  // play-points balance
  positions: Position[]
  resolvedMarkets: { [marketId]: winningOutcomeId }
  savings: Savings
  journal: JournalEntry[]
  stats:   { wins: number, losses: number }
  streak:  number
  social: {                        // mock + local; real multiplayer needs a backend
    friends:    Player[]
    groups:     { id, name, emoji, memberIds, createdAt }[]
    challenges: Challenge[]         // head-to-head play-money bets vs a friend
  }
}
```

---

## 3. State flow & actions

All mutations go through `reducer(state, action)` in `AppContext.jsx`.

| Action | Payload | Effect |
| --- | --- | --- |
| `PLACE_BET` | `{ marketId, outcomeId, outcomeLabel, question, stake, price }` | Deducts `stake` from points, prepends an open `Position`. Guards against overdraw. |
| `RESOLVE_MARKET` | `{ marketId, winningOutcomeId }` | Settles every open position on the market: winners get `stake × (1/price)` points and bump `stats.wins`; losers forfeit stake and bump `stats.losses`. Records the winning outcome in `resolvedMarkets`. |
| `ADD_POINTS` | `{ amount }` | Adds play points (e.g. a daily allowance). |
| `ADD_SAVINGS` | `{ amount, note }` | Increments `savings.total` and prepends a `SavingsEntry`. |
| `SET_SAVINGS_GOAL` | `{ goal }` | Updates the savings goal target. |
| `LOG_URGE` | `{ prompt, reflection, moodBefore, moodAfter, savedSnapshot }` | Prepends a `JournalEntry`. |
| `COMPLETE_ONBOARDING` / `UPDATE_PROFILE` | `{ name, avatar, ... }` | Sets onboarded + profile / edits profile. |
| `SET_ALLOWANCE` / `CLAIM_DAILY` | `{ amount }` / — | Sets the daily allowance / grants it once per day. |
| `CHECK_IN` | — | Advances the streak on consecutive days, resets after a gap (runs once per load). |
| `SET_STAKE_LIMIT` | `{ amount }` | Sets the self-imposed daily stake cap (0 = off). |
| `START_COOLOFF` / `END_COOLOFF` | `{ hours }` / — | Starts/ends a "take a break" window. **`PLACE_BET` and `CREATE_CHALLENGE` are blocked while a cool-off is active or the daily stake limit is exceeded.** |
| `ADD_FRIEND` / `REMOVE_FRIEND` | `{ friend }` / `{ id }` | Adds (deduped) / removes a friend (also clears group rosters). |
| `CREATE_GROUP` / `LEAVE_GROUP` | `{ name, emoji, memberIds }` / `{ id }` | Creates/removes a group. |
| `CREATE_CHALLENGE` | `{ friend, marketId, outcomeId, stake, price, ... }` | Escrows your stake on a head-to-head pick vs a friend. |
| `RESOLVE_CHALLENGE` | `{ id, won }` | Settles a challenge; winner takes the 2× matched pot. |
| `RESET` | — | Restores seeded initial state. |

**Derived values** (computed in a `useMemo` inside the provider, not stored):
`openPositions`, `settledPositions`, `pointsAtStake`, `savingsProgress`,
`winRate`. Pages consume these directly from `useApp()`.

### Market resolution ("mock outcomes")

Markets are resolved from the **Portfolio** page. "Simulate result" calls
`simulateOutcome(market)`, which picks a winning outcome **weighted by each
outcome's price** (its implied probability), then dispatches `RESOLVE_MARKET`.
This stands in for a real event settling and produces realistic win/lose
distributions while staying entirely in play points.

---

## 4. Component breakdown

### UI primitives (`src/components/ui/`)
- **Icon** — dependency-free inline-SVG line-icon set (Lucide-style) used across
  nav, stat tiles, the top bar, and trends instead of emoji-as-icons.
- **Button** — variants (`primary`, `secondary`, `ghost`, `danger`, `outline`)
  and sizes; consistent disabled/focus styles.
- **Card** — `.surface` container; `as` prop for semantic tags.
- **Badge** — status pills (`win`, `loss`, `open`, `brand`, `warn`, `neutral`).
- **ProgressBar** — 0..1 fraction, used by savings + cooldown.
- **StatTile** — labeled KPI tile (icon chip + value/sub).
- **Sparkline / Donut / BarChart** — tiny dependency-free SVG charts (market
  price trends + Insights).
- **Modal** — dependency-free dialog: Escape-to-close, backdrop click, scroll
  lock, and a **focus trap** (Tab cycling) with focus restore on close.

### Feature components
- **layout/Layout.jsx** — responsive sidebar (desktop) / top strip + floating
  button (mobile); icon nav; hosts the global `UrgeModal` + first-run
  `OnboardingModal`.
- **layout/TopBar.jsx** — sticky context bar: live balances, streak, daily-claim,
  avatar → Settings.
- **onboarding/OnboardingModal.jsx** — non-dismissable first-run flow
  (philosophy → name/avatar → daily allowance).
- **social/ChallengeModal.jsx**, **social/CreateGroupModal.jsx** — head-to-head
  challenge composer and group builder.
- **markets/MarketCard.jsx** — one market; outcome buttons trigger the bet flow;
  reflects resolved state with ✓/✕ markers.
- **markets/BetModal.jsx** — stake entry with quick-stake chips, live payout
  preview, balance guard, and explicit "points, not money" reassurance.
- **urge/UrgeModal.jsx** — the 4-step intervention: breathe (mood + cooldown
  timer) → reflect (journal prompt) → redirect (snapshot + add to savings) →
  support (mood-after + helplines). Logs a journal entry on finish.

### Pages (`src/pages/`)
- **Dashboard** — hero CTA, four KPI tiles, savings progress card, open-position
  snapshot, safety strip, win-rate footer.
- **Markets** — category filter + responsive market grid + bet modal.
- **Portfolio** — KPI tiles, open positions grouped by market with "Simulate
  result", and settled win/loss history.
- **Leaderboard** — mock players + the user merged & highlighted, ranked by
  points, with medals and streaks.
- **MoneyKept** — hero total + goal progress + milestone copy, KPI tiles, a
  "redirect an impulse" form with quick amounts, and a history log.
- **Insights** — live streak hero, KPI row, cumulative Money-Kept area chart,
  win-rate donut, before/after mood bars, and recent reflections (urge journal).
- **Social** (`/social`) — friends (add/remove from a suggestion pool), groups
  with a shared standings board, and head-to-head challenges (settle to award
  the 2× pot). Mock + local; real multiplayer needs a backend.
- **Settings** — profile/avatar/allowance, **play limits & breaks**
  (`SET_STAKE_LIMIT` / `START_COOLOFF`), data export (JSON + journal CSV), reset.
- **Plus** (`/plus`) — non-functional Upside Plus upsell teaser (no payments).

---

## 4a. Testing

The pure reducer is unit-tested with **Node's built-in test runner** (no test
framework dependency): `npm test` runs `src/context/reducer.test.js` (14 tests)
covering the money-affecting paths and responsible-gambling guards — bets,
overdraw/limit/cool-off rejection, market + challenge settlement math, savings,
streak transitions, the daily allowance, friend dedupe, and `migrateState`
backfill. Keeping the reducer pure (in `reducer.js`, free of React) is what makes
this possible. Not yet covered: component/e2e tests (a Playwright smoke test is
the next increment — see HANDOFF).

---

## 5. Key decisions & trade-offs

- **One reducer, no TypeScript.** Maximizes readability for an MVP and makes the
  "no real money" guarantee auditable in one file. Types are documented here and
  in JSDoc rather than enforced by a compiler. (Adding TS is a clean future
  step — see HANDOFF.)
- **`price` as both probability and odds.** Avoids carrying a separate odds
  field and keeps the mock data compact; the cosmetic payout math lives in
  `lib/format.js` (`priceToMultiplier`, `potentialPayout`).
- **localStorage as the only persistence.** Satisfies "no backend" while still
  feeling like a real app across reloads. Wrapped in try/catch so it never
  breaks the app.
- **Calming visual design.** Green-forward palette, no flashing/celebratory
  loss-chasing patterns — an intentional contrast with extractive gambling UIs.
- **Seeded initial state.** Every screen looks populated on first load, which
  makes the MVP demo well without the user having to set everything up.

---

## 6. Out of scope / intentionally excluded

Mirrors the README's exclusions, restated at the implementation level:

- **No real-money wagering or cash value.** Points cannot be bought, sold, or
  withdrawn. There is no payments code, no wallet, no transactions.
- **No Roth IRA / retirement / investment funding flow.** Routing "saved" money
  into a real account would require brokerage/custody integration, KYC/AML, and
  licensing — out of reach for a client-only MVP and counter to the
  harm-reduction goal of *defusing* the money urge. "Money Kept" is a
  **simulated** motivational tracker only.
- **No backend, accounts, or networking** for app data. Everything is local to
  the browser; the only external requests are the Google Fonts stylesheet and
  any helpline links the user chooses to open.
