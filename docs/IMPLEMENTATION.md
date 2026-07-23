# Upside — Implementation & Architecture

This document covers how Upside is built: architecture, state flow, data models,
component breakdown, and the reasoning behind key decisions. For a product
overview see [`../README.md`](../README.md); for status and next steps see
[`../HANDOFF.md`](../HANDOFF.md).

> **What Upside is (the model in one line):** *"Win it, or invest it. Never just
> lose it."* You fund an Upside **balance** in dollars from a connected bank,
> predict on real events from that balance, and connect one or more
> **destination accounts** (a Roth IRA by default, plus high-yield savings or
> other retirement accounts). **Win** → your profit is paid into your balance.
> **Lose** → your stake, minus a **5% platform fee**, is routed into your default
> destination and tracked as **"Invested."** Every dollar figure, bank link, and
> destination in the app is a **demo — fully simulated.** No real institution is
> ever contacted, no credentials are requested, and no money moves.

---

## 1. Architecture overview

Upside is a **100% client-side single-page app**. There is no backend and no
API for app data. **Money and account connections are simulated end-to-end** —
the app is an honest demo of a funded product, not a live financial system.

```
┌──────────────────────────────────────────────────────────────┐
│ index.html → main.jsx                                         │
│   <BrowserRouter>                                             │
│     <AuthProvider>   ← optional cloud sync (inert with no env)│
│       <AppProvider>  ← all app state lives here (useReducer)  │
│         <App>                                                 │
│           <Layout>   ← nav + persistent "Take a pause" button │
│             <Routes> ← Dashboard / Markets / Portfolio /      │
│                        Connect / MoneyKept(Invested) / …      │
│           <UrgeModal>    ← global intervention flow           │
│           <GuidedTour>   ← offered-after-onboarding walkthrough│
│           <OnboardingModal> ← first-run gate                  │
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
  The schema is versioned (`SCHEMA_VERSION`, currently `4`) and `migrateState`
  backfills any keys an older blob is missing — including the newer funded-model
  keys (`balance`, `funding`, `destinations`, `defaultDestinationId`, `feesPaid`,
  `tour`) — so shape changes don't crash the app. Fully functional with storage
  disabled (degrades to in-memory only).
- **Cloud sync (optional, Phase 1):** an `AuthProvider` (`AuthContext`) wraps the
  app. When Supabase env vars are set, users can sign in (email/password) and the
  full reducer state syncs to a per-user JSONB row (`app_state`, RLS-isolated) —
  pull-on-sign-in / debounced-push-on-change, offline-first. With no env it's
  inert and the app stays fully local. See [`BACKEND.md`](BACKEND.md).
- **Routing:** `react-router-dom` with ten routes plus a catch-all redirect (see
  §4).
- **Styling:** Tailwind CSS utility classes, with two shared component classes
  (`.surface`, `.surface-muted`) defined in `index.css` and a small brand color
  scale in `tailwind.config.js`.

### Why this shape

- The brief calls for a frontend-only demo with mock data and local state. A
  single reducer + context is the least-surprising way to model "one user, a
  handful of related slices of state, lots of small actions."
- Keeping **all** mutation in one reducer means every way the user can change
  their **balance, invested savings, destinations, positions, or journal** is
  enumerable in one file (`reducer.js`) — useful for auditing that nothing
  touches real money and that the loss-routing / fee math is correct.

---

## 2. Data models

All types are plain JS objects (no TypeScript in the MVP). Shapes below use
TS-like notation for clarity only. **Money values are dollars** unless a field is
explicitly a **play-points** counter.

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
and `1 / price` is the payout multiplier (a 25%-priced outcome pays 4× the staked
dollars if it wins). Prices within a market sum to ≈ 1.0.

### Position (runtime, in `AppContext` state)
```ts
Position {
  id: string
  marketId: string
  outcomeId: string
  outcomeLabel: string
  question: string           // denormalized for easy display
  stake: number              // DOLLARS staked (deducted from balance)
  price: number              // price at time of bet
  status: 'open' | 'won' | 'lost'
  payout: number             // dollars paid back to balance on a win (else 0)
  routed?: number            // on a loss: dollars sent to the destination
  fee?: number               // on a loss: the 5% platform fee taken
  placedAt: string           // ISO timestamp
}
```

### Funding source & destination accounts (all SIMULATED)
```ts
Funding {                    // the bank/debit source that tops up the balance
  connected: boolean
  institution: string        // e.g. "Chase"
  mask: string               // last 4, e.g. "4821"
  connectedAt: string | null // ISO
}
Destination {                // where a lost stake / redirect is invested
  id: string
  kind: 'roth_ira' | 'traditional_ira' | '401k' | '529' | 'hysa'
  institution: string        // e.g. "Fidelity"
  mask: string               // last 4
  balance: number            // dollars routed into this account so far
  connectedAt: string        // ISO
}
```
The account catalogue lives in **`src/data/accounts.js`**: `FUNDING_INSTITUTIONS`
(banks), `DESTINATION_TYPES` (account kinds, each with representative providers;
`roth_ira` is flagged `recommended`), plus helpers `destinationType(kind)` and
`maskFrom(seed)` (a deterministic, believable-looking 4-digit mask). Human labels
for the account kinds live in `lib/format.js` (`ACCOUNT_KINDS`,
`accountKindLabel`). None of this connects to anything.

### Savings — the "Invested" tracker
```ts
Savings {
  goal: number               // dollar goal for the progress bar
  total: number              // total dollars invested (mirrors sum of destinations)
  entries: SavingsEntry[]
}
SavingsEntry {
  id: string
  amount: number             // dollars invested (net of fee, for losses)
  kind: 'loss' | 'redirect'  // routed loss vs. a manual urge redirect
  destinationId: string      // which account it went to
  fee?: number               // present on 'loss' entries (the 5% taken)
  question?: string          // present on 'loss' entries (which prediction)
  note: string
  createdAt: string          // ISO timestamp
}
```
> Formerly "Money Kept," this is the **"Invested"** ledger. Every entry is a real
> (simulated) dollar amount that landed in a destination account: `kind:'loss'`
> from a settled losing prediction (carries a `fee`), or `kind:'redirect'` from a
> manual urge redirect (no fee — it's your own money going where you choose).
> `savings.total` mirrors the sum of the `balance` fields across `destinations`.

### Journal entry (urge intervention)
```ts
JournalEntry {
  id: string
  createdAt: string
  prompt: string
  reflection: string
  moodBefore: string | null  // mood tag id
  moodAfter: string | null
  savedSnapshot: number      // total invested at the moment of the urge
}
```

### Leaderboard / social player (`src/data/leaderboard.js`)
```ts
Player { id: string; name: string; points: number; avatar: string; streak: number }
```
`points` here is the **play currency** for the friendly social layer, not money.
The current user is merged into the leaderboard at render time, never stored in
it.

### Full app state
```ts
AppState {
  __v: number                      // schema version (migrated on load) → 4
  onboarded: boolean               // gates the first-run onboarding modal
  user:    { id, name, avatar }
  settings: {
    dailyAllowance: number         // once-a-day claimable PLAY points
    dailyStakeLimit: number        // self-imposed daily DOLLAR cap (0 = off)
    cooloffUntil: string | null    // ISO timestamp of a "take a break" window
  }
  tour: { status, step }           // 'pending'|'offer'|'active'|'done'|'skipped'
  lastActive: string               // day key (YYYY-MM-DD) for the streak
  lastAllowanceClaim: string|null  // day key of the last daily claim
  stakedToday: { day: string, amount: number }  // for the dollar stake limit

  // --- Funded (simulated) money layer ---
  balance: number                  // funded Upside balance in DOLLARS
  funding: Funding                 // linked bank/debit source (pre-connected in seed)
  destinations: Destination[]      // connected loss destinations (Roth IRA seeded)
  defaultDestinationId: string|null// which destination receives routed losses
  feesPaid: number                 // lifetime platform fees taken from losses

  positions: Position[]            // dollar-staked predictions
  resolvedMarkets: { [marketId]: winningOutcomeId }
  savings: Savings                 // the "Invested" tracker
  journal: JournalEntry[]
  stats:   { wins: number, losses: number }
  streak:  number

  points:  number                  // PLAY-points balance (social + daily allowance)
  social: {                        // mock + local; real multiplayer needs a backend
    friends:    Player[]
    groups:     { id, name, emoji, memberIds, createdAt }[]
    challenges: Challenge[]         // head-to-head PLAY-points bets vs a friend
  }
}
```

`createInitialState()` seeds a lived-in demo: a `balance` of `$1,000`, a
pre-connected `Chase` funding source, one seeded `Fidelity` Roth IRA destination
(`dest-roth`, the default) with `$140` already invested, `feesPaid: 7.37`, two
open dollar positions, and two seeded `savings` entries (one `redirect`, one
`loss` carrying a `fee`). `points` (`8,550`) remains a separate play balance for
the social layer.

### Constants & helpers (in `reducer.js`)
- `LOSS_FEE_RATE = 0.05` — the platform fee taken from a lost stake before the
  rest is invested. The honest business model: 95% of a loss still lands in your
  account.
- `SCHEMA_VERSION = 4`.
- `round2(n)` — rounds dollars to cents so repeated math never drifts the
  balance.
- `defaultDestination(state)` — resolves `defaultDestinationId` to the
  destination object (falls back to the first, or null).
- `creditDestination(destinations, destId, amount)` — immutably adds `amount` to
  a destination's running `balance`.
- Guards: `inCooloff`, `stakedToday`, `stakeRemainingToday`, `recordStake`.

---

## 3. State flow & actions

All mutations go through `reducer(state, action)` in `src/context/reducer.js`.

### Funded predictions & money
| Action | Payload | Effect |
| --- | --- | --- |
| `PLACE_BET` | `{ marketId, outcomeId, outcomeLabel, question, stake, price }` | Deducts `stake` **dollars** from `balance`, records it against today's stake total, prepends an open `Position`. Guards: no overdraw (`stake > balance`), no non-positive stakes, blocked during a cool-off or over the daily stake limit. |
| `RESOLVE_MARKET` | `{ marketId, winningOutcomeId }` | Settles every open position on the market. **Win** → pays `stake × (1/price)` into `balance`, bumps `stats.wins`. **Loss** → computes `fee = stake × 0.05`, routes `stake − fee` into the **default destination** (via `creditDestination`), adds it to `savings.total`, appends a `kind:'loss'` savings entry, accrues `feesPaid`, bumps `stats.losses`. Records the winning outcome in `resolvedMarkets`. Net worth only ever dips by the small fee. |
| `ADD_SAVINGS` | `{ amount, note }` | A **manual redirect** (e.g. from the urge flow): credits `amount` dollars into the default destination and `savings.total`, prepends a `kind:'redirect'` entry. **No fee** — it's your own money. |
| `SET_SAVINGS_GOAL` | `{ goal }` | Updates the invested-goal target (clamped ≥ 1). |
| `ADD_POINTS` | `{ amount }` | Adds **play points** (never real money). |

### Connected accounts (all simulated)
| Action | Payload | Effect |
| --- | --- | --- |
| `CONNECT_FUNDING` | `{ institution, mask }` | Links/replaces the bank/debit funding source; sets `connected: true`, `connectedAt`. |
| `FUND_BALANCE` | `{ amount }` | Simulated deposit: adds `amount` dollars to `balance`. No-op if ≤ 0 or no funding connected. |
| `WITHDRAW_BALANCE` | `{ amount }` | Simulated withdrawal of winnings; subtracts from `balance` (guards against overdraw). |
| `CONNECT_DESTINATION` | `{ kind, institution, mask }` | Appends a `Destination` (balance 0). If there was no default, the first connected destination becomes the default automatically. |
| `SET_DEFAULT_DESTINATION` | `{ id }` | Points `defaultDestinationId` at a connected destination (no-op for an unknown id). |
| `REMOVE_DESTINATION` | `{ id }` | Removes a destination; if it was the default, falls back to the first remaining one (or null). |

### Onboarding, tour & profile
| Action | Payload | Effect |
| --- | --- | --- |
| `COMPLETE_ONBOARDING` | `{ name, avatar, dailyAllowance }` | Sets `onboarded`, name/avatar, and allowance. **Chains the guided tour**: if `tour.status === 'pending'`, flips it to `'offer'` (a one-time yes/no card) — never forced, and never re-offered later. |
| `START_TOUR` | — | `tour → { status: 'active', step: 0 }`. |
| `SET_TOUR_STEP` | `{ step }` | Moves to a step (clamped ≥ 0). |
| `END_TOUR` | `{ status? }` | Ends the tour with `'done'` (finished) or `'skipped'`; resets step. |
| `UPDATE_PROFILE` | `{ name, avatar }` | Edits profile. |
| `SET_ALLOWANCE` | `{ amount }` | Sets the daily **play-points** allowance. |

### Responsible-gambling controls
| Action | Payload | Effect |
| --- | --- | --- |
| `SET_STAKE_LIMIT` | `{ amount }` | Sets the self-imposed daily **dollar** stake cap (0 = off). |
| `START_COOLOFF` / `END_COOLOFF` | `{ hours }` / — | Starts/ends a "take a break" window. **`PLACE_BET` and `CREATE_CHALLENGE` are blocked while a cool-off is active or the daily stake limit is exceeded.** |
| `CHECK_IN` | — | Advances the engagement streak on consecutive days, resets after a gap (runs once per load). |
| `CLAIM_DAILY` | — | Grants the daily play-points allowance once per day. |

### Social (play points) & maintenance
| Action | Payload | Effect |
| --- | --- | --- |
| `ADD_FRIEND` / `REMOVE_FRIEND` | `{ friend }` / `{ id }` | Adds (deduped) / removes a friend (also clears group rosters). |
| `CREATE_GROUP` / `LEAVE_GROUP` | `{ name, emoji, memberIds }` / `{ id }` | Creates/removes a group. |
| `CREATE_CHALLENGE` | `{ friend, marketId, question, outcomeId, outcomeLabel, stake, price }` | Escrows **play points** on a head-to-head pick vs a friend (same cool-off / limit guards as bets). |
| `RESOLVE_CHALLENGE` | `{ id, won }` | Settles a challenge; winner takes the 2× matched pot. |
| `LOG_URGE` | `{ prompt, reflection, moodBefore, moodAfter, savedSnapshot }` | Prepends a `JournalEntry`. |
| `HYDRATE` | `{ state }` | Replaces state with a (migrated) snapshot — used by cloud sync. |
| `RESET` | — | Restores seeded initial state. |

### Derived values (`AppContext.jsx`)

Computed in a `useMemo` inside the provider (not stored) and spread onto the
`useApp()` value:

- `openPositions`, `settledPositions`
- `atStake` — **dollars** currently locked in open predictions (renamed from
  `pointsAtStake`)
- `netWorth` — `balance + savings.total` (liquid + invested)
- `defaultDest` — the default `Destination` object (via `defaultDestination`)
- `fundingConnected` — `funding.connected`
- `hasDestination` — at least one destination connected
- `accountsConnected` — `fundingConnected && hasDestination` (setup complete)
- `savingsProgress` — `savings.total / savings.goal`, clamped to 1
- `winRate`, `canClaimDaily`, `cooloffActive`, `stakeRemaining`, `stakedToday`

### Market resolution ("mock outcomes")

Markets are resolved from the **Portfolio** page. "Simulate result" calls
`simulateOutcome(market)`, which picks a winning outcome **weighted by each
outcome's price** (its implied probability), then dispatches `RESOLVE_MARKET`.
This stands in for a real event settling and produces realistic win/lose
distributions. In the funded model this is where the "you can't really lose"
mechanic becomes visible: a loss doesn't drain net worth, it invests it (minus
the fee).

---

## 4. Component breakdown

### UI primitives (`src/components/ui/`)
- **Icon** — dependency-free inline-SVG line-icon set (Lucide-style).
- **Button** — variants (`primary`, `secondary`, `ghost`, `danger`, `outline`)
  and sizes; consistent disabled/focus styles.
- **Card** — `.surface` container; `variant`/`padding`/`as` props.
- **Badge** — status pills (`win`, `loss`, `open`, `brand`, `warn`, `neutral`).
- **ProgressBar** — 0..1 fraction, used by the invested goal + cooldown.
- **StatTile / PageHeader / EmptyState / Reveal / AnimatedNumber** — labeled KPI
  tiles, section headers, empty-state cards, reveal-on-scroll wrapper, and a
  count-up number used for dollar figures.
- **Sparkline / Donut / BarChart** — tiny dependency-free SVG charts.
- **Modal** — dependency-free dialog: Escape-to-close, backdrop click, scroll
  lock, and a **focus trap** (Tab cycling) with focus restore on close.

### Feature components
- **layout/Layout.jsx** — responsive sidebar (desktop) / top bar + bottom tab
  bar (mobile). Sidebar shows a **Balance / Invested** summary in dollars and a
  grouped nav (**Play**: Dashboard, Markets, Portfolio · **Money**: Invested,
  Accounts, Insights · **Community**: Friends, Leaderboard). Hosts the global
  `UrgeModal`, the `GuidedTour`, and the first-run `OnboardingModal`. Mounts a
  persistent **"Take a pause"** button (sidebar footer, `data-tour="take-a-pause"`,
  plus a floating pill on mobile) that opens the urge flow — it never locks, even
  during a cool-off.
- **layout/TopBar.jsx** — sticky context bar: **Balance**, **Invested**, and
  streak chips (dollars via `formatUSD`), the daily play-points claim button,
  cloud-sync status, and avatar → Settings. The balances carry
  `data-tour="topbar-balances"`.
- **onboarding/OnboardingModal.jsx** — non-dismissable first-run flow reframed to
  the funded model: philosophy ("Win it, or invest it. Never just lose it." —
  predict with a **funded balance**, losses fund your future via a **Roth IRA**,
  stay in control) → name/avatar → daily play allowance. Dispatches
  `COMPLETE_ONBOARDING`, which then offers the tour.
- **tour/GuidedTour.jsx** (+ `src/data/tour.js`) — a dependency-free guided
  walkthrough. Reads `tour` from state; renders a one-time **offer card**
  (`status:'offer'`) after onboarding, then steps through `TOUR_STEPS`. Each step
  navigates to its `route`, spotlights the element with the matching
  `data-tour={anchor}` via a box-shadow cutout (or centers when `anchor` is
  null), and shows warm, non-judgmental copy. Skippable at every step (Esc →
  `skipped`); **replayable** from Settings or via the `?tour=1` query param. The
  11 steps walk intro → Connect (funding + destinations) → the three top-bar
  numbers → Markets → the both-outcomes bet slip → Portfolio settle → Invested →
  Take-a-pause → limits → outro.
- **accounts/ConnectAccountModal.jsx** — the **simulated** connection flow.
  `mode="funding"` links a bank (dispatches `CONNECT_FUNDING`); `mode="destination"`
  picks an account type then a provider (dispatches `CONNECT_DESTINATION`). Runs a
  fake ~1.5s "Securely connecting…" spinner, stores a name + `maskFrom(...)` mask,
  and shows a done state. A shield disclaimer ("no real account is connected, no
  login is ever requested") is always visible.
- **accounts/FundBalanceModal.jsx** — a **simulated** deposit from the funding
  source into `balance` (quick amounts + free entry → `FUND_BALANCE`). Disabled
  until a funding source is connected; also carries a "no real transfer happens"
  disclaimer.
- **social/ChallengeModal.jsx**, **social/CreateGroupModal.jsx** — head-to-head
  challenge composer and group builder (play points).
- **markets/MarketCard.jsx** — one market; outcome buttons trigger the bet flow;
  reflects resolved/closed/on-a-break state. Volume and trader counts are shown
  in **play points** (cosmetic market color); the first card carries
  `data-tour="markets-card"`.
- **markets/BetModal.jsx** — the dollar bet slip and the heart of "you can't
  really lose." Stake entry in dollars (quick-stake chips $10/$25/$50/$100 + Max),
  balance + daily-limit + cool-off guards, and a **both-outcomes receipt**: an
  "If you win → `payoutDollars` (+profit to balance)" card beside an "If you lose
  → `lossSplit.routed` to your {destination}, {fee} fee" card. On placement it
  confirms both endings and links to the Portfolio. Uses `payoutDollars`,
  `profitDollars`, `lossSplit`, and `accountKindLabel(defaultDest.kind)`.
- **urge/UrgeModal.jsx** — the 4-step intervention, now **mounted in Layout** and
  opened by the persistent "Take a pause" button (anywhere in the app): breathe
  (mood-before + 30s cooldown timer) → reflect (journal prompt) → **redirect**
  (shows how much you've already invested, then dispatches `ADD_SAVINGS` in
  **dollars** — no fee) → support (mood-after + helplines). Dispatches `LOG_URGE`
  on finish with a `savedSnapshot` of `savings.total`.

### Pages (`src/pages/`) & routes
- **Dashboard** (`/`) — hero ("Win it, or invest it. Never just lose it."), an
  account-connection nudge to `/connect` (shown until `accountsConnected`), the
  daily allowance card, four KPI tiles (**Balance / Invested / Open positions /
  Standing**), the Invested progress card, an open-position snapshot, and a safety
  strip. Dollars throughout.
- **Markets** (`/markets`) — category filter + market grid + `BetModal`; shows the
  live **balance** in the header, a cool-off banner + daily-limit note when
  relevant.
- **Portfolio** (`/portfolio`) — KPI tiles, open positions grouped by market with
  "Simulate result" (`RESOLVE_MARKET`; first card `data-tour="settle-position"`),
  and settled history rendering wins as "+$ to balance" and losses as the invested
  amount routed to `defaultDest` (using `lossSplit`).
- **MoneyKept** (`/money-kept`, labeled **"Invested"**) — hero total invested, a
  "where it's invested" card listing destination balances, KPI tiles, the
  **"redirect an impulse"** form (`data-tour="money-kept-form"`, quick dollar
  amounts + note → `ADD_SAVINGS`; `SET_SAVINGS_GOAL` for the goal), and a history
  log of loss + redirect entries. Links to `/connect` to manage accounts.
- **ConnectAccounts** (`/connect`) — the account hub. A prominent **demo/simulation
  banner**, a plain-language "how it works" (fund → predict → losses become
  savings), a **Balance / Invested / Total** summary, the **funding source**
  section (`data-tour="connect-funding"`; connect/change + Add funds), and the
  **destination accounts** section (`data-tour="connect-destinations"`; connect,
  make-default via `SET_DEFAULT_DESTINATION`, remove via `REMOVE_DESTINATION`).
- **Leaderboard** (`/leaderboard`) — mock players + the user merged & highlighted,
  ranked by **play points**, with medals and streaks.
- **Insights** (`/insights`) — streak hero, KPI row, cumulative Invested area
  chart, win-rate donut, before/after mood bars, and recent reflections.
- **Social** (`/social`) — friends, groups, and head-to-head **play-points**
  challenges. Mock + local; real multiplayer needs a backend.
- **Settings** (`/settings`) — profile/avatar, a **guided-walkthrough replay**
  (`START_TOUR`), **connected accounts** (funding status + default-destination
  selector, link to `/connect`), the daily **play** allowance, **play limits &
  breaks** (dollar stake cap `SET_STAKE_LIMIT` / `START_COOLOFF`,
  `data-tour="play-limits"`), data export (JSON + journal CSV), and reset.
- **Plus** (`/plus`) — non-functional Upside Plus upsell teaser (no payments).
- `*` — catch-all redirect to `/`.

---

## 4a. Testing

The pure reducer is unit-tested with **Node's built-in test runner** (no test
framework dependency): `npm test` runs `src/context/reducer.test.js` (**17
tests**) covering the money-affecting paths and responsible-gambling guards.
Coverage includes: `PLACE_BET` deducting **dollars** from `balance` (plus
overdraw/non-positive/daily-limit/cool-off rejection); `RESOLVE_MARKET` paying
winners `1/price` into the balance and routing a losing stake into savings
**minus the 5% fee** (asserting `savings.total`, the destination's `balance`, and
`feesPaid` all move by the right amounts); `ADD_SAVINGS` investing into the
default destination **without** a fee; the funding/destination lifecycle
(`FUND_BALANCE`, `CONNECT_DESTINATION`, `SET_DEFAULT_DESTINATION`,
`REMOVE_DESTINATION` with default fallback); the tour flow
(`COMPLETE_ONBOARDING` offering it once, then `START_TOUR` / `SET_TOUR_STEP` /
`END_TOUR`); plus goal clamping, streak transitions, the daily allowance,
challenge settlement, friend dedupe, `HYDRATE`, and `migrateState` backfill.
Keeping the reducer pure (in `reducer.js`, free of React) is what makes this
possible. Not yet covered: component/e2e tests (a Playwright smoke test is the
next increment — see HANDOFF).

---

## 5. Key decisions & trade-offs

- **A funded model, honestly presented as a demo.** Every dollar, bank link, and
  destination is simulated end-to-end — the app shows exactly how a real product
  *would* move money without ever moving any. The simulation disclaimers live
  right next to the connect/fund actions, not buried.
- **The 5% loss fee is the whole business model, and it's visible.** `LOSS_FEE_RATE`
  lives in one place; the bet slip shows the fee on the "if you lose" side, and
  `feesPaid` is tracked and surfaced. 95% of a loss still lands in the user's
  account — the harm-reduction and the revenue model are the same mechanic.
- **Dollars for money, points for play.** Predictions, the balance, and the
  Invested tracker are dollars; the leaderboard, challenges, and daily allowance
  stay on non-cashable play **points**. Keeping the two currencies separate keeps
  the social layer friendly and unmistakably not-money.
- **One reducer, no TypeScript.** Maximizes readability and makes the money math
  (loss routing, fee, net worth) auditable in one file. Types are documented here
  and in JSDoc rather than enforced by a compiler.
- **`price` as both probability and odds.** Avoids a separate odds field; the
  payout math lives in `lib/format.js` (`priceToMultiplier`, `payoutDollars`,
  `profitDollars`, `lossSplit`).
- **localStorage + optional cloud sync.** Local persistence with a versioned
  schema and a backfilling migrator (`SCHEMA_VERSION = 4`) so older blobs load
  cleanly; optional Supabase sync when configured.
- **Calming visual design.** Green-forward palette, no flashing/celebratory
  loss-chasing patterns, and a "you can't really lose" framing on every bet — an
  intentional contrast with extractive gambling UIs.
- **Seeded initial state + guided tour.** Every screen looks populated on first
  load, and a one-time (never forced) walkthrough explains the funded loop so the
  demo lands without setup.

---

## 6. Out of scope / intentionally excluded

Mirrors the README's exclusions, restated at the implementation level:

- **No real money moves and no real institutions are contacted.** The funded
  balance, bank funding, deposits/withdrawals, and destination accounts are all
  **simulated** for the demo — no payments code, no brokerage/custody
  integration, no KYC/AML, no credentials requested or stored. A production build
  would require licensing and real financial rails; this MVP demonstrates the
  product and its safety mechanics without them.
- **Play points cannot be cashed out.** The social/leaderboard/challenge points
  and the daily allowance are non-cashable and separate from the dollar layer.
- **No backend, accounts, or networking** for app data by default. Everything is
  local to the browser; the only external requests are the Google Fonts
  stylesheet, any helpline links the user opens, and — when explicitly configured
  — optional Supabase cloud sync (see [`BACKEND.md`](BACKEND.md)).
