# YC Application — Answers

Working answers to Y Combinator application questions. Grounded in this
repository; kept honest about what's built vs. planned.

---

## What tech stack are you using, or planning to use, to build this product? Include AI models and AI coding tools you use.

**Frontend (today).** Upside is a React 18 single-page app built with Vite 5,
styled with Tailwind CSS 3 (PostCSS + Autoprefixer), and routed with React
Router 6. It's written in plain JavaScript/JSX with ES modules — no TypeScript.
All app state lives in a single pure, unit-tested reducer (`useReducer` +
Context), persisted to `localStorage`, so the current build runs fully
client-side with no server dependency.

**Backend (today, optional).** Supabase (Postgres + Auth) provides optional
accounts and multi-device sync — a JSONB state snapshot with last-write-wins
reconciliation. It's a state mirror, not a ledger.

**Backend (planned).** The current app *simulates* the money model (funded
balance, predictions, and routing a losing stake into a Roth IRA/savings). A
production version would add: bank/funding integration (e.g. Plaid), a
transactional ledger + custody for balances, brokerage/IRA routing via an RIA +
custodian, real prediction-market settlement, KYC/AML, and the associated
money-transmission/broker-dealer/robo-advisory licensing. We'd likely move to a
typed backend (Node/TypeScript or Go) with Postgres as we introduce real money
movement.

**Dev tooling.** Vite for build/HMR, ESLint 8 (react/react-hooks/react-refresh)
for linting, Node's built-in test runner for reducer unit tests, and Playwright
for browser-level verification. Deploys as a static bundle
(Vercel/Netlify/GitHub Pages).

**AI coding tools.** We build with **Claude Code** (Anthropic's agentic CLI)
running **Claude Opus** — used for feature implementation, multi-file refactors,
test generation, and documentation. Much of the current codebase, including the
funded-model reframe, the account-connection flows, and the guided walkthrough,
was implemented this way.

**AI models in the product.** None in the runtime today — the app is
deliberately deterministic. Where we're exploring AI: personalized,
non-judgmental nudges and reflection summarization in the "Take a pause" flow,
and early risk-signal detection from engagement patterns to surface support at
the right moment — all as opt-in, safety-aligned features, never to drive more
betting.

> _Note: everything above except the final "AI models in the product" paragraph
> is present in the repo today. That paragraph is forward-looking — there are
> currently no AI models in the runtime._
