# 📈 Upside

**Win it, or invest it. Never just lose it.**

Upside is a frontend-only demo web app for **gambling harm reduction** built
around one idea: make it so a bet can't really hurt you. You predict on real
events with a **funded balance** — and if a prediction loses, your stake doesn't
vanish into the house's pocket. It's routed into **your own Roth IRA** (or a
savings account), minus a small platform fee. Win, and the profit is yours to
keep or withdraw. Either way, the money stays in your life.

> ⚠️ **This is a demo — everything is simulated.** Balances, deposits, and every
> account connection are mock. Connecting a bank or a Roth IRA runs a fake
> "connecting…" animation; **no login is ever requested, no real financial
> institution is contacted, and no real money ever moves.** The app *presents* a
> real-money product and simulates all of it. See
> [_What's real vs. simulated_](#-whats-real-vs-simulated).

---

## The harm-reduction thesis

Problem gambling is driven by a behavioral loop: a craving for action, the rush
of a wager, and the chase after a loss. Telling someone to simply *stop* rarely
works because it leaves the craving unmet. Upside changes the **outcome** of the
loop instead of denying it:

1. **Keep the thrill.** Real-event prediction markets — the forecasting, the
   sweat, the portfolio, the leaderboard — are all here.
2. **Change the loss.** When a prediction loses, the stake (minus a small 5%
   fee) is **invested into your connected Roth IRA or savings account**, not
   lost. A loss becomes money working for your future self. Your net worth only
   ever dips by the small fee — you can't really lose.
3. **Interrupt the urge.** An always-available **"Take a pause"** flow adds a
   cooldown, a reflection prompt, a way to redirect an impulse straight into
   savings, and links to real help (1-800-GAMBLER, 988, Gamblers Anonymous).

The design language is deliberately calm and green (growth/savings) rather than
the high-arousal reds and flashing wins of typical gambling UIs.

> Upside is a supportive prototype, **not** medical treatment, financial advice,
> or a regulated financial product. If gambling is causing harm, please reach out
> to the resources linked throughout the app.

---

## How the money model works

```
        Connect a bank            Fund your          Predict in dollars
      (funding source)   ──▶   Upside balance   ──▶   on real events
                                                            │
                                    ┌───────────────────────┴───────────────────────┐
                                    ▼                                                 ▼
                                  WIN                                               LOSE
                        stake + profit paid                          stake − 5% fee routed into
                        back to your balance                         your Roth IRA (or savings),
                        (keep or withdraw)                           logged as "Invested"
```

- **Funding source** — a connected bank/debit account (simulated) tops up your
  dollar **balance**, which is what you predict with.
- **Destination accounts** — connect a **Roth IRA** (default), a **high-yield
  savings account**, and/or **other retirement** (Traditional IRA / 401(k) /
  529). Lost stakes flow into your chosen default destination.
- **The 5% loss fee** is the honest business model: you keep 95% of every
  "loss" (invested in your own future), and Upside earns only when it routes
  money into your savings. See [`docs/MONETIZATION.md`](docs/MONETIZATION.md).

---

## Features

| Feature | What it does |
| --- | --- |
| 🔗 **Connect Accounts** *(`/connect`)* | A simulated account-linking flow: connect a bank **funding source**, then a **Roth IRA / high-yield savings / other-retirement** destination for redirected losses. Pick a default destination, add funds, manage everything. **Nothing actually connects** — it's a mock. |
| 🎯 **Funded prediction markets** | Browse markets across Sports, Crypto, News, Pop Culture, and Science. Stake **dollars** from your balance on an outcome. The bet slip shows both endings up front: win → profit to balance; lose → your stake invested in your Roth IRA. |
| 🎟️ **Portfolio** | Track open predictions, simulate settlement, and see history. A win pays your balance; a loss invests into your destination account (never shown as money simply gone). |
| 💚 **Invested** *(`/money-kept`)* | The reframed "Money Kept": a running total of dollars invested from losses **and** redirected urges, a per-destination breakdown, a goal + progress bar, and a full history log. |
| 🫧 **Take a pause** | A persistent, always-available button opens a 4-step urge intervention: name the feeling → enforced cooldown → reflection journaling → redirect an impulse into savings → mood check + real support resources. Never locks, even during a break. |
| 🧭 **Guided walkthrough** | "One evening with Upside" — an in-app spotlight tour that explains the whole model. Offered after onboarding, replayable from **Settings**, or open it anytime with **`?tour=1`**. |
| 🏆 **Leaderboard & 🫂 Friends** | A friendly **play-points** social layer: mock rivals ranked by points (with you highlighted), plus friends, groups, and head-to-head challenges. Play points are separate from your real-money balance. |
| 🏠 **Dashboard** | One overview: funded balance, invested total, open positions, streak/standing, a connect-accounts nudge, and a safety strip. |
| 📊 **Insights** | Progress visualized — cumulative invested over time, prediction win-rate, and before/after mood shifts from the urge flow, plus a live engagement streak. |
| 👋 **Onboarding & profile** | A first-run explainer of the funded model, name/avatar, and a self-set daily play allowance (for the social layer). Editable in **Settings**. |
| 🧰 **Limits & breaks** | Set a **self-imposed daily stake limit** (in dollars) and **"take a break"** cool-off periods (24h / 3d / 1 week). Enforced across predicting *and* challenges — the pause tools and Invested always stay open. |
| ⚙️ **Settings & data controls** | Manage connected accounts + default destination, edit profile, set limits, **export your data** (JSON/CSV), and **reset progress** — everything stays on your device. |
| ✨ **Upside Plus** *(teaser)* | A non-functional preview of an optional supporter tier. No payments, and safety features are never paywalled — see [`docs/MONETIZATION.md`](docs/MONETIZATION.md). |

Markets are **date-aware**: they show a "closing soon" treatment and stop
accepting predictions once past their close date.

---

## Tech stack

- **React 18** + **Vite 5** (fast dev server, instant HMR, simple build)
- **Tailwind CSS 3** for styling
- **React Router 6** for client-side routing
- **All state in local React state** (`useReducer` + Context). `localStorage`
  persists progress between visits; an **optional** Supabase integration adds
  accounts + multi-device sync. The money model is simulated entirely
  client-side — there is **no backend, no ledger, no custody, and no network
  calls to any financial institution**.

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
troubleshooting, and deploy notes) see [`RUN.md`](RUN.md). To open the in-app
tour, append `?tour=1` to any URL or use **Settings → Replay walkthrough**.

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

The app ships with **seed data** (a funded balance, a connected bank + Roth IRA,
a couple of open positions, some invested history, a journal entry) so every
screen looks alive on first run. To wipe back to a fresh state, use **Settings →
Reset progress**, or clear the `upside.state.v2` key in your browser's
localStorage (`localStorage.clear()` in devtools also works).

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
│   ├── accounts.js          # simulated funding + destination institution catalogue
│   ├── tour.js              # guided-walkthrough step copy
│   ├── leaderboard.js       # mock rival players
│   ├── social.js            # mock friends + group options
│   ├── avatars.js           # avatar + allowance options
│   ├── prompts.js           # reflection prompts + mood tags
│   └── resources.js         # real problem-gambling support resources
├── lib/
│   ├── format.js            # pure formatting / odds / dollar-payout helpers
│   └── storage.js           # optional localStorage wrapper
├── components/
│   ├── ui/                  # reusable primitives (Button, Card, Modal, …)
│   ├── layout/Layout.jsx    # sidebar nav + persistent "Take a pause" button
│   ├── accounts/            # ConnectAccountModal, FundBalanceModal
│   ├── markets/             # MarketCard, BetModal (both-outcomes receipt)
│   ├── tour/GuidedTour.jsx  # the in-app spotlight walkthrough
│   └── urge/UrgeModal.jsx   # the 4-step intervention flow
└── pages/                   # Dashboard, Markets, Portfolio, ConnectAccounts,
                             # MoneyKept (Invested), Leaderboard, Insights, Social, Settings, Plus
```

For a deeper dive — data models, component breakdown, state flow, testing — see
[`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md). For project status and next
steps, see [`HANDOFF.md`](HANDOFF.md). For how Upside could sustain itself, see
[`docs/MONETIZATION.md`](docs/MONETIZATION.md). For what building the *real*
(non-simulated) money movement would take, see [`docs/BACKEND.md`](docs/BACKEND.md).
For the guided-walkthrough design, see [`docs/WALKTHROUGH.md`](docs/WALKTHROUGH.md).

---

## 🔒 What's real vs. simulated

**Simulated (mock — nothing leaves the browser):**

- **Every account connection.** Linking a bank, Roth IRA, HYSA, or 401(k) runs a
  fake "connecting…" flow. No credentials are requested, no institution is
  contacted, no account is verified.
- **All money.** Your balance, deposits, winnings, the routed losses, and the
  destination-account balances are numbers in local state. **No real funds are
  ever held, moved, or invested.**
- **Prediction settlement.** "Simulate result" resolves a market with a
  probability-weighted mock outcome — a stand-in for a real event settling.

**Real:**

- The **harm-reduction tools** are real and usable: the pause flow, the
  self-imposed limits and breaks, and the linked **support resources**
  (1-800-GAMBLER, 988, Gamblers Anonymous) are genuine.

Building a *real* funded version would require bank/funding integration (e.g.
Plaid), a ledger and custody for the balance, brokerage/IRA integrations to
actually route losses, real market settlement, KYC/AML, and
money-transmission / broker-dealer / robo-advisory licensing — none of which the
demo does. See [`docs/BACKEND.md`](docs/BACKEND.md).

Upside is an educational / harm-reduction prototype. It is not financial advice,
not a treatment program, and not a regulated financial or gambling product.

### Support

If you or someone you know is struggling with gambling:

- **National Problem Gambling Helpline:** call/text **1-800-GAMBLER**
  (free, confidential, 24/7)
- **Gamblers Anonymous:** <https://www.gamblersanonymous.org/>
- **988 Suicide & Crisis Lifeline:** call or text **988**
