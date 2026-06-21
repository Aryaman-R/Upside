# Upside — Handoff

Handoff doc for the next person/agent picking this up. Pairs with
[`README.md`](README.md) (product) and [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md)
(architecture).

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
- `npm run build` — succeeds (56 modules, ~65 kB gzipped JS).
- `npm run dev` — boots on :5173, serves HTTP 200.
- `npm run lint` — passes with no errors.

---

## Known gaps & limitations ⚠️

These are intentional MVP boundaries or honest rough edges, not bugs:

1. **No automated tests.** No unit/integration/e2e tests exist yet. The reducer
   in `AppContext.jsx` is the highest-value target (pure function, easy to test) —
   now with more actions to cover (`CHECK_IN`, `CLAIM_DAILY`, `COMPLETE_ONBOARDING`).
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
6. **Accessibility is partial.** Focus ring + Escape-to-close + ARIA on the
   modal/progress bar are in; the onboarding modal is intentionally
   non-dismissable. A full a11y audit (focus trapping, labels) hasn't been done.
7. **Single local user.** Profile (name/avatar/allowance) is now editable, but
   there's still no auth/accounts or multi-device sync — all state is local.
8. **Upside Plus is a teaser only.** `/plus` collects no payment and makes no
   network call; "join waitlist" just sets local state.

---

## Recommended next steps 🚀

Wave 2 cleared most of the original list (state versioning, reset control,
date-aware markets, live streak, onboarding/personalization, insights). Remaining,
in rough priority order:

1. **Add tests.** Start with the reducer (`PLACE_BET` overdraw guard,
   `RESOLVE_MARKET` win/lose math, `ADD_SAVINGS`, `CHECK_IN` streak transitions,
   `CLAIM_DAILY` once-per-day guard). Add a Playwright smoke test for
   onboarding → bet → resolve → savings → urge.
2. **Manual QA pass** across desktop and mobile breakpoints; confirm onboarding,
   daily claim, urge cooldown, date-locked markets, and Insights charts render
   with both empty and populated data.
3. **TypeScript migration** for safety on the data models and reducer.
4. **Optional date-based auto-settle** for markets past `closeDate`.
5. **Deeper harm-reduction features**: self-imposed play limits, time-of-day
   nudges, optional check-in reminders, accountability sharing.
6. **Toward revenue** (see [`docs/MONETIZATION.md`](docs/MONETIZATION.md)):
   accounts + sync, an opt-in outcomes-measurement layer, and a real Plus
   checkout — each gated on a backend + privacy review.

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
| Tweak the urge flow | `src/components/urge/UrgeModal.jsx` |
| Tweak onboarding | `src/components/onboarding/OnboardingModal.jsx` |
| Tweak betting | `src/components/markets/BetModal.jsx` |
| Tweak market cards / charts | `src/components/markets/MarketCard.jsx`, `src/components/ui/{Sparkline,Donut,BarChart}.jsx` |
| Tweak the top bar | `src/components/layout/TopBar.jsx` |
| Date/streak/format helpers | `src/lib/format.js` |
| Restyle the brand | `tailwind.config.js`, `src/index.css` |
| Add a page/route | `src/App.jsx` + `src/pages/` + `src/components/layout/Layout.jsx` |
| Revenue strategy | `docs/MONETIZATION.md` |
