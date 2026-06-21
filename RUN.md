# Running Upside

Everything you need to get Upside running locally. For what the app *is*, see
[`README.md`](README.md); for architecture, [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md).

---

## Prerequisites

- **Node.js 18 or newer** (Node 20+ recommended) — check with `node -v`
- **npm** (ships with Node) — check with `npm -v`

No backend, database, API keys, or environment variables are required. Upside is
100% client-side.

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

### Previewing a production build

```bash
npm run build      # outputs to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

---

## First-run notes

- The app ships with **seed data** (a couple of open bets, some savings history,
  a journal entry) so every screen looks alive immediately.
- Your progress is saved to the browser's **localStorage** (key
  `upside.state.v1`) — it persists across reloads automatically.
- **To reset to a clean slate:** open your browser devtools console and run
  `localStorage.clear()`, then reload. (Or clear just the `upside.state.v1` key.)

---

## Try the core loop

1. **Markets** → tap an outcome on any market → stake some play points → confirm.
2. **Portfolio** → find your open bet → **Simulate result** to settle it (win or
   lose points).
3. **Leaderboard** → see where your points rank you against the mock field.
4. **Money Kept** → log a real-money impulse you redirected, watch the total +
   goal progress grow.
5. **Feeling the urge?** (sidebar button, or floating button on mobile) → walk
   through the cooldown → reflection → redirect-to-savings → support resources.

> All points are play-only and have no cash value. No real money is ever
> involved. If gambling is causing harm: **1-800-GAMBLER** (free, 24/7).

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `command not found: npm` | Install Node.js (see Prerequisites). |
| Port 5173 already in use | Run `npm run dev -- --port 5174`, or stop the other process. |
| Blank page / stale UI after pulling changes | Hard-refresh (Ctrl/Cmd+Shift+R); if needed, `localStorage.clear()` in the console. |
| Install errors | Delete `node_modules` and `package-lock.json`, then `npm install` again. Ensure Node is 18+. |
| Weird saved state | `localStorage.clear()` in the browser console, then reload. |

---

## Deploying (optional)

Upside is a static site — the `dist/` folder from `npm run build` can be hosted
anywhere that serves static files (Netlify, Vercel, GitHub Pages, Cloudflare
Pages, S3, etc.).

Because it uses client-side routing, configure the host to **rewrite all routes
to `index.html`** (SPA fallback) so deep links like `/portfolio` work on refresh.
On Netlify, for example, add a `_redirects` file with `/* /index.html 200`.
