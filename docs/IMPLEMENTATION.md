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
  Context (`AppContext`). Every page reads and writes through the `useApp()`
  hook. No Redux, no external state library — the app is small enough that one
  reducer keeps things obvious and debuggable.
- **Persistence (optional):** the entire state object is serialized to
  `localStorage` (`upside.state.v1`) on every change and rehydrated on load.
  This is a convenience so returning users keep their play progress; the app is
  fully functional with storage disabled (it degrades to in-memory only).
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
  user:    { id, name, avatar }
  points:  number                  // play-points balance
  positions: Position[]
  resolvedMarkets: { [marketId]: winningOutcomeId }
  savings: Savings
  journal: JournalEntry[]
  stats:   { wins: number, losses: number }
  streak:  number
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
- **Button** — variants (`primary`, `secondary`, `ghost`, `danger`, `outline`)
  and sizes; consistent disabled/focus styles.
- **Card** — frosted `.surface` container; `as` prop for semantic tags.
- **Badge** — status pills (`win`, `loss`, `open`, `brand`, `warn`, `neutral`).
- **ProgressBar** — 0..1 fraction, used by savings + cooldown.
- **StatTile** — labeled KPI tile with value/sub/icon.
- **Modal** — dependency-free dialog: Escape-to-close, backdrop click, scroll
  lock, focus ring.

### Feature components
- **layout/Layout.jsx** — responsive sidebar (desktop) / top strip + floating
  button (mobile); shows live points & money-kept; hosts the global
  `UrgeModal`.
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
