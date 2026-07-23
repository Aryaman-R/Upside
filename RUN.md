# Running Upside

Everything you need to get Upside running locally. For what the app *is*, see
[`README.md`](README.md); for architecture, [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md).

> **Win it, or invest it. Never just lose it.** Upside is a funded prediction
> platform shown here as a **demo — every balance and account connection is
> simulated.** No real bank, no real login, no money ever moves. See
> [Try the core loop](#try-the-core-loop) for the honest details.

---

## Prerequisites

- **Node.js 18 or newer** (Node 20+ recommended) — check with `node -v`
- **npm** (ships with Node) — check with `npm -v`

No backend, database, API keys, or environment variables are required. Upside is
100% client-side, and because it's a demo there is nothing to fund and no
institution to connect to for real.

> Don't have Node? Install it from <https://nodejs.org> (LTS), or via a version
> manager like [`nvm`](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`.

---

## Quick start

```bash
# 1. Get the code
git clone https://github.com/Aryaman-R/Upside.git
cd Upside

# 2. Install dependencies (~30s, one time)
npm install

# 3. Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser. The dev server has hot
module reload — edits show up instantly without a refresh.

To stop the server, press **Ctrl+C** in the terminal.

---

## All scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 5173 (hot reload). |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally to preview the production build. |
| `npm run lint` | Run ESLint over the source. |
| `npm run test` | Run the Node test suite (`src/**/*.test.js`). |

### Previewing a production build

```bash
npm run build      # outputs to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

---

## First-run notes

- The app ships with **seed data** so every screen looks alive immediately: a
  starting **balance** of $1,000, a simulated **funding source** (Chase), a
  default **destination account** (a Fidelity Roth IRA), a couple of open
  predictions, some Invested history, and a journal entry.
- Everything is a **demo**. The bank, the Roth IRA, the high-yield savings, the
  balance — all simulated. No login is ever requested and no real money moves.
- Your progress is saved to the browser's **localStorage** (key
  `upside.state.v2`). The internal schema is **v4**; on load a migrator backfills
  any missing keys, so older saved blobs still open cleanly.
- **To reset to a clean slate:** open your browser devtools console and run
  `localStorage.clear()`, then reload. (Or clear just the `upside.state.v2` key.)

---

## Try the core loop

The whole idea: **predict with a funded balance — win it back as profit, or turn
a loss into money invested in your future.** Nothing here touches a real
account; it's all simulated.

1. **Connect Accounts** (`/connect`) → link a **funding source** (simulated
   bank) that fills your balance, then connect one or more **destination
   accounts** — a **Roth IRA** (the default), a **high-yield savings** account,
   or **another retirement** account. A losing stake gets routed here instead of
   vanishing. All connections are simulated — no real institution, no login.
2. **Fund the balance** → add money from the connected funding source. Your
   **balance** (dollars) is what you predict with; it, your **Invested** total,
   and your streak show in the top bar on every screen.
3. **Markets** → tap **Yes** or **No** on any real-event market → stake some
   **dollars** → confirm to open a prediction.
4. **Portfolio** (`/portfolio`) → find your open prediction → **Simulate result**
   to settle it at its priced odds. **Win** → the profit lands in your balance.
   **Lose** → your stake, minus the **5% platform fee**, is routed to your
   default destination (the Roth IRA) and counted as **Invested**. Either way
   your net worth barely dips — only by the small fee.
5. **Invested** (`/money-kept`) → watch every routed loss and redirected urge add
   up, split across your real accounts. About to bet somewhere else? Redirect
   that impulse straight into savings here — no fee, all yours.
6. **Take a pause** → the persistent button (sidebar on desktop, floating pill on
   mobile) is always one tap away, even during a self-imposed break → walk
   through cooldown → reflection → redirect-to-savings → real help lines.
7. **Settings** (`/settings`) → set a **daily stake limit** (in dollars) or take a
   **cool-off break** that pauses all predicting. The pause tools and your
   Invested savings never lock.

> **Guided walkthrough — "One evening with Upside":** a two-minute tour is
> *offered* (never forced) right after onboarding. Replay it anytime from
> **Settings → Replay walkthrough**, or open it directly by adding the
> **`?tour=1`** URL param (e.g. `http://localhost:5173/?tour=1`).

> **This is a demo.** All money and account connections are simulated — no real
> money is ever involved. The friendly **points** you'll still see power only the
> social leaderboard, challenges, and daily play allowance. If gambling is
> causing harm: **1-800-GAMBLER** (free, 24/7).

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `command not found: npm` | Install Node.js (see Prerequisites). |
| Port 5173 already in use | Run `npm run dev -- --port 5174`, or stop the other process. |
| Blank page / stale UI after pulling changes | Hard-refresh (Ctrl/Cmd+Shift+R); if needed, `localStorage.clear()` in the console. |
| Install errors | Delete `node_modules` and `package-lock.json`, then `npm install` again. Ensure Node is 18+. |
| Weird saved state | `localStorage.clear()` in the browser console, then reload. |
| Walkthrough won't reopen | Use **Settings → Replay walkthrough**, or visit `/?tour=1`. |

---

## Deploying (optional)

Upside is a static site — the `dist/` folder from `npm run build` can be hosted
anywhere that serves static files (Netlify, Vercel, GitHub Pages, Cloudflare
Pages, S3, etc.).

Because it uses client-side routing, configure the host to **rewrite all routes
to `index.html`** (SPA fallback) so deep links like `/portfolio`, `/connect`, and
`/money-kept` work on refresh. On Netlify, for example, add a `_redirects` file
with `/* /index.html 200`.
