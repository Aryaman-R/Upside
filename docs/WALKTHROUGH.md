# Guided Walkthrough — "One Evening With Upside"

**Status:** ✅ Built and shipping. This documents the walkthrough as implemented.

The walkthrough is an in-app **spotlight tour** that teaches the funded
"win it, or invest it" model and everything a user can do, framed as a single
evening: the urge, the setup, a prediction, the reveal, the payoff, and the
guardrails.

---

## What it is

A dependency-free coach-mark tour. It navigates between routes, dims the screen
with a single box-shadow cutout around the relevant UI element, and shows a card
of copy for each beat. Every step is skippable; the tour is **offered, never
forced**.

- **Component:** `src/components/tour/GuidedTour.jsx` (mounted once in
  `Layout.jsx`, so it's available on every route).
- **Step data:** `src/data/tour.js` — an array of
  `{ id, route, anchor, title, body, cta }`. Editing copy or reordering steps is
  a data-only change.
- **Spotlight anchors:** target elements carry a `data-tour="<anchor>"`
  attribute (e.g. `take-a-pause`, `topbar-balances`, `connect-funding`,
  `connect-destinations`, `markets-card`, `settle-position`, `money-kept-form`,
  `play-limits`). GuidedTour measures the anchor with `getBoundingClientRect`
  and re-measures on scroll/resize; steps with `anchor: null` center the card.
- **State:** `state.tour = { status, step }` in the reducer, where `status` is
  `pending | offer | active | done | skipped`. Persisted (and cloud-synced) with
  the rest of the state, so a finished tour doesn't re-fire on another device.

---

## The steps (verbatim copy lives in `src/data/tour.js`)

1. **Win it, or invest it.** *(Dashboard, centered)* — the pitch: keep the
   thrill, change the ending.
2. **First, the engine.** *(Connect Accounts → funding)* — fund your balance from
   a bank; all simulated.
3. **Where a loss goes.** *(Connect Accounts → destinations)* — link a Roth IRA /
   savings; a loss routes here instead of vanishing.
4. **Your three numbers.** *(Dashboard → TopBar)* — Balance, Invested, Streak.
5. **Real questions, real stakes.** *(Markets → first card)* — predict on real
   events.
6. **Every ticket has two good endings.** *(Markets)* — win → balance, lose →
   Roth IRA (minus a small fee); either way it stays yours.
7. **The sweat, then the reveal.** *(Portfolio → a position)* — "Simulate result";
   watch a win pay the balance or a loss invest.
8. **Watch it compound.** *(Invested → redirect form)* — losses + redirected
   urges add up across your accounts.
9. **When the urge is too big for a button.** *(Dashboard → "Take a pause")* — the
   always-available intervention flow.
10. **You hold the keys.** *(Settings → limits & breaks)* — dollar stake limits and
    cool-offs you control; safety never locks.
11. **One evening, two endings.** *(Dashboard, centered)* — the recap and a warm
    close.

Tone is warm and non-judgmental throughout; the tour never shames the user about
gambling, and it's honest that money and account connections are simulated.

---

## Entry points

- **After onboarding** — completing onboarding flips `tour.status` to `offer`;
  GuidedTour shows a one-time "Want the two-minute tour?" card with
  *Show me around* / *I'll find my own way*.
- **Settings → Replay walkthrough** — dispatches `START_TOUR` from step 1 anytime.
- **`?tour=1`** URL param — starts the tour for an already-onboarded user (for
  demo links, support replies, B2B pitches).

## Skip / resume & accessibility

- Every card has a quiet **Skip tour** link (`END_TOUR`, status `skipped`);
  skipping never re-triggers the auto-offer, but the tour stays replayable from
  Settings.
- **Esc** ends the tour. Focus moves to the tour card on each step. The current
  step persists, so the tour survives a reload mid-flow.

---

## Shipped alongside the tour

- The previously-orphaned **`UrgeModal`** ("Take a pause") is now wired into
  `Layout` via a persistent button (sidebar footer on desktop, a floating pill
  on mobile) — step 9 spotlights it. This was a real product fix: the app's
  signature intervention had no way to be opened before.
- The **Connect Accounts** flow (`/connect`) that steps 2–3 rely on.

---

## Notes for future changes

- To add or reword a step, edit `src/data/tour.js`. If a new step points at a UI
  element, add a `data-tour="<anchor>"` attribute to that element (any component
  that spreads props — `Card`, `Reveal` — forwards it; native elements take it
  directly).
- Steps 5–6 select the **first** market card as the anchor at render time, so
  they never break as individual markets close.
- A richer **"Meet Sam" demo account** (`?demo=1` seeding a lived-in six-week
  history to show otherwise-unreachable states) is a possible future phase; it
  would reuse the same `tour.js` step data over seeded state.
