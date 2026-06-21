# 📈 Upside

**Bet on yourself, not against your wallet.**

Upside is a frontend-only MVP web app for **gambling harm reduction**. It gives
people the dopamine of prediction-style betting — forecasting outcomes, building
a portfolio, climbing a leaderboard — using **play-money points only**, with
**zero real-money wagering**. At the same time, it redirects the urge to gamble
real dollars into a simulated **savings tracker**, reframing the betting impulse
as a savings win.

> ⚠️ **No real money. No real wagering. No retirement/IRA flows.** Everything
> here is play points and a *simulated* savings log. See
> [_Out of scope / intentionally excluded_](#-out-of-scope--intentionally-excluded).

---

## The harm-reduction philosophy

Problem gambling is driven by a behavioral loop: a craving for action, the rush
of a wager, and the chase after a loss. Telling someone to simply *stop* rarely
works because it leaves the craving unmet. Upside takes a **substitution +
redirection** approach:

1. **Satisfy the itch safely.** The forecasting, the portfolio, the leaderboard —
   the *fun* parts of prediction markets — are preserved with play points, so the
   craving for "action" has a harmless outlet.
2. **Redirect the money.** Whenever a real-money gambling impulse strikes, the
   app captures that dollar amount into a **"Money Kept"** tracker. The loss
   becomes a visible, accumulating win.
3. **Interrupt the urge.** A always-available **"Feeling the urge?"** flow adds a
   cooldown, a reflection prompt, a snapshot of money saved, and links to real
   help (1-800-GAMBLER and others).

The design language is deliberately calm and green (growth/savings) rather than
the high-arousal reds and flashing wins of typical gambling UIs.

> Upside is a supportive tool, **not** medical treatment or a substitute for
> professional care. If gambling is causing harm, please reach out to the
> resources linked throughout the app.

---

## Features

| Feature | What it does |
| --- | --- |
| 🎮 **Play-money prediction markets** | Browse mock markets across Sports, Crypto, News, Pop Culture, and Science. Each has a question, Yes/No or multi-outcome prices, and a closing date. Stake **points** (never money) on an outcome. |
| 🎟️ **Portfolio** | Track open positions, simulate market resolution with mock outcomes, and see settled win/loss history. Winnings and losses are points only. |
| 🏆 **Leaderboard** | Mock players ranked by points, with **you** merged in and highlighted so you always see your standing. |
| 🫂 **Friends & groups** | Add friends, form **groups** with a shared play-money standings board, and run friendly **head-to-head challenges** — stake play points on a pick, winner takes the matched pot. (Mock social graph; real multiplayer would need a backend.) |
| 💚 **Money Kept (savings redirect)** | A running total of dollars *saved instead of bet*, a goal + progress bar, quick-add redirects, milestones, and a full history log. |
| 🫧 **Urge-intervention flow** | A persistent "Feeling the urge?" button opens a 4-step flow: name the feeling → enforced cooldown timer → reflection journaling → redirect-to-savings → mood check + real support resources. |
| 🏠 **Dashboard** | One overview tying it together: points balance, money kept, open positions, current streak/standing, daily-allowance claim, and a safety reminder. |
| 📊 **Insights** | Your progress visualized — cumulative Money Kept over time, play win-rate, and before/after mood shifts from the urge flow, plus a live engagement streak. |
| 👋 **Onboarding & profile** | A first-run explainer of the harm-reduction philosophy, plus name/avatar and a self-set **daily play allowance**. Editable anytime in **Settings**. |
| 🧰 **Play limits & breaks** | Set a **self-imposed daily stake limit** and **"take a break"** cool-off periods (24h / 3d / 1 week). Enforced across betting *and* challenges — the urge tools always stay open. |
| ⚙️ **Settings & data controls** | Edit profile/allowance, set play limits, **export your data** (JSON), and **reset progress** — everything stays on your device. |
| ✨ **Upside Plus** *(teaser)* | A non-functional preview of an optional supporter tier (deeper insights, accountability, clinician reports). No payments, no pay-to-win — see [`docs/MONETIZATION.md`](docs/MONETIZATION.md). |

Markets are **date-aware**: they show a "closing soon" treatment and stop
accepting bets once past their close date.

---

## Tech stack

- **React 18** + **Vite 5** (fast dev server, instant HMR, simple build)
- **Tailwind CSS 3** for styling
- **React Router 6** for client-side routing
- **All state in local React state** (`useReducer` + Context). `localStorage` is
  used *optionally* to persist play progress between visits — there is **no
  backend, no database, no network calls** for app data.

---

## Getting started

Prerequisites: **Node 18+** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# → open http://localhost:5173
```

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build locally
npm run lint      # run ESLint
npm test          # run reducer unit tests (Node's built-in test runner)
```

For a full run guide (prerequisites, all scripts, a guided walkthrough,
troubleshooting, and deploy notes) see [`RUN.md`](RUN.md).

### Cloud sync (optional)

Upside runs **fully local and offline by default** — no account, no network. You
can optionally enable **accounts + multi-device sync** by pointing it at a
[Supabase](https://supabase.com) project:

```bash
cp .env.example .env.local   # then add your Supabase URL + anon key
```

Apply `supabase/migrations/0001_init.sql`, then sign up via **Settings →
Account**. Your local progress is uploaded on first sign-in and syncs from then
on. Full setup: [`supabase/README.md`](supabase/README.md). Architecture &
roadmap: [`docs/BACKEND.md`](docs/BACKEND.md).

The app ships with **seed data** (a couple of open positions, some savings
history, a journal entry) so every screen looks alive on first run. To wipe
back to a fresh state, clear the `upside.state.v1` key in your browser's
localStorage (or run `localStorage.clear()` in the devtools console).

---

## Project structure

```
src/
├── main.jsx                 # entry; mounts Router + AppProvider
├── App.jsx                  # routes + Layout shell
├── index.css                # Tailwind layers + shared component classes
├── context/
│   ├── reducer.js           # ⭐ pure state logic + initial state + migration (unit-tested)
│   ├── reducer.test.js      # reducer unit tests (npm test)
│   └── AppContext.jsx       # React glue: hydration, persistence, derived values
├── data/                    # mock data modules (no real data anywhere)
│   ├── markets.js           # prediction markets (+ deterministic price history)
│   ├── leaderboard.js       # mock rival players
│   ├── social.js            # mock friends + group options
│   ├── avatars.js           # avatar + allowance options
│   ├── prompts.js           # reflection prompts + mood tags
│   └── resources.js         # real problem-gambling support resources
├── lib/
│   ├── format.js            # pure formatting/odds helpers
│   └── storage.js           # optional localStorage wrapper
├── components/
│   ├── ui/                  # reusable primitives (Button, Card, Modal, …)
│   ├── layout/Layout.jsx    # sidebar nav + persistent urge button
│   ├── markets/             # MarketCard, BetModal
│   └── urge/UrgeModal.jsx   # the 4-step intervention flow
└── pages/                   # Dashboard, Markets, Portfolio, Leaderboard, MoneyKept
```

For a deeper dive — data models, component breakdown, state flow, testing — see
[`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md). For project status and next
steps, see [`HANDOFF.md`](HANDOFF.md). For how Upside could sustain itself
without compromising the mission, see [`docs/MONETIZATION.md`](docs/MONETIZATION.md).
For where the client-only milestone ends and a backend begins, see
[`docs/BACKEND.md`](docs/BACKEND.md).

---

## 🚫 Out of scope / intentionally excluded

These were **deliberately not built**, by design:

- **Real-money betting / wagering of any kind.** The entire premise is that no
  money is ever at risk. Points have no cash value and cannot be purchased,
  cashed out, or converted.
- **Roth IRA / retirement-account funding flows.** An earlier idea was to route
  "saved" money into a real investment/retirement account. This is **excluded**
  because moving real funds is legally and operationally unworkable for a
  client-only harm-reduction MVP (it would require brokerage integration,
  KYC/AML, custody, and regulatory licensing), and it works against the goal:
  the point is to *defuse* the money urge, not redirect it into another
  financial product. The "Money Kept" tracker is therefore a **simulation** — a
  motivational log, not a real account.
- **Any backend, account system, or money movement.** No servers, no payments,
  no transfers. All data is local to the browser.

Upside is an educational / harm-reduction prototype. It is not financial advice,
not a treatment program, and not a regulated gambling product.

### Support

If you or someone you know is struggling with gambling:

- **National Problem Gambling Helpline:** call/text **1-800-GAMBLER**
  (free, confidential, 24/7)
- **Gamblers Anonymous:** <https://www.gamblersanonymous.org/>
- **988 Suicide & Crisis Lifeline:** call or text **988**
