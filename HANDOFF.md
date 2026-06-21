# Upside — Handoff

Handoff doc for the next person/agent picking this up. Pairs with
[`README.md`](README.md) (product) and [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md)
(architecture).

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
   in `AppContext.jsx` is the highest-value target (pure function, easy to test).
2. **Manual UI verification only.** The build, lint, and server-boot were
   verified programmatically; full click-through interaction testing in a real
   browser was not automated. Recommend a manual pass or Playwright smoke tests.
3. **No TypeScript.** Types are documented (JSDoc + IMPLEMENTATION.md) but not
   enforced. Migration would be a clean, contained improvement.
4. **Markets don't auto-resolve.** Resolution is user-triggered ("Simulate
   result") rather than tied to `closeDate`. A timer/date-based auto-settle was
   left out to keep the demo deterministic and in the user's control.
5. **State schema isn't versioned/migrated.** Persistence key is
   `upside.state.v1`; if the state shape changes, old localStorage could
   mismatch. There's no migration logic — bump the key or add migrations.
6. **Streak is static.** `streak` is seeded and used for display; it isn't yet
   computed from real daily activity.
7. **Accessibility is partial.** Focus ring + Escape-to-close + ARIA on the
   modal/progress bar are in; a full a11y audit (focus trapping, screen-reader
   labels on every control) hasn't been done.
8. **Single hard-coded user.** No auth/profiles; the user is `{ name: 'You' }`.

---

## Recommended next steps 🚀

In rough priority order:

1. **Add tests.** Start with the reducer (`PLACE_BET` overdraw guard,
   `RESOLVE_MARKET` win/lose math, `ADD_SAVINGS`). Add a Playwright smoke test
   for the bet → resolve → savings → urge happy paths.
2. **Manual QA pass** across desktop and mobile breakpoints; confirm the urge
   cooldown, redirect-to-savings, and leaderboard re-ranking all behave.
3. **State versioning/migrations** for `localStorage`, plus a visible "Reset
   progress" control in the UI (the `RESET` action already exists).
4. **Date-aware markets** — disable betting after `closeDate` and optionally
   auto-resolve, with a clearer "closing soon" treatment.
5. **TypeScript migration** for safety on the data models and reducer.
6. **Live streak logic** based on day-over-day engagement / staying within play
   limits.
7. **Personalization & onboarding** — set a name/avatar, a first-run explainer
   of the harm-reduction philosophy, and configurable play-point allowances.
8. **Deeper harm-reduction features** (future): self-imposed play limits,
   time-of-day nudges, exportable journal, optional check-in reminders.

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
| Add/edit markets | `src/data/markets.js` |
| Edit leaderboard rivals | `src/data/leaderboard.js` |
| Edit urge prompts / moods | `src/data/prompts.js` |
| Edit support resources | `src/data/resources.js` |
| Tweak the urge flow | `src/components/urge/UrgeModal.jsx` |
| Tweak betting | `src/components/markets/BetModal.jsx` |
| Restyle the brand | `tailwind.config.js`, `src/index.css` |
| Add a page/route | `src/App.jsx` + `src/pages/` + `src/components/layout/Layout.jsx` |
