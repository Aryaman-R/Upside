# Guided Walkthrough — "One Evening With Upside"

**Status:** Proposal for review. No code written yet.
**Author:** drafted from a multi-agent design pass (5 code readers → 3 competing designs → judge).
**Decision needed from you:** approve the concept + copy below, then I build it.

---

## 1. What this is

A first-run **guided walkthrough** that teaches a new user what Upside is, what it's *for*, and everything they can do — not as a feature checklist, but as a single simulated Tuesday night told in the order that night actually unfolds:

> the urge hits → you redirect the money → you scratch the itch safely → you sweat a pick → you share it → you see proof it worked → you set your own guardrails.

It's ~13 short steps, roughly two minutes, and it can be skipped at any time.

### Why this framing (and not a plain feature tour)

The sequencing does the persuasive work. Leading with **Take a pause** and **Money Kept** — the two features that make Upside a harm-reduction tool and not a casino skin — *before* any betting means that by the time the user places a play-money stake, the "play points · no real money" shield in the bet slip reads as a **kept promise**, not a disclaimer. A dry nav-order tour ("here's Markets, here's Portfolio…") informs; this persuades.

Three competing designs were built and scored. This one won on narrative (10/10) and delight (9/10) while staying fully feasible in the current stack. The other two ("classic spotlight tour" and "Meet Sam demo account") contributed specific ideas that are folded in below (§4) and a phase-2 idea (§7).

### How it coexists with the existing onboarding

The current `OnboardingModal` (3 steps: philosophy → name/avatar → daily allowance) **stays exactly as-is.** It does jobs a tour can't — it collects identity + allowance, and its non-dismissable philosophy step is a legal/ethical expectations gate.

The walkthrough **chains after it as an offer with a real decline path.** When the user clicks "Start playing" at the end of onboarding, the first tour card appears with two choices: *"Show me tonight"* or *"I'll find my own way."* A harm-reduction app that force-marched users through 13 steps would contradict its own "you hold the keys" message — so every step is skippable and every hands-on moment is optional.

---

## 2. The one prerequisite (a standing bug this fixes)

**`UrgeModal.jsx` is currently orphaned — it has zero importers (grep-verified).** The app's signature "Take a pause" intervention exists in code but is **not reachable anywhere in the UI today.**

This walkthrough ships the fix as a bundled prerequisite: a persistent **"Take a pause"** button mounted in `Layout` (sidebar footer on desktop; a floating pill above the tab bar on mobile) that opens the real `UrgeModal`. Step 2 of the tour spotlights it.

> This is a real product fix worth shipping regardless of the tour — I'm flagging it so it's a conscious decision, not silent scope. Without it, both the app's core feature and the tour's opening beat don't exist in the running app.

---

## 3. The walkthrough, step by step (verbatim copy for your review)

This is the part to react to — the `script` is exactly what the user reads. Each step names the screen, what's spotlighted, and what the user does. Every step has a **Next** button and a quiet **Skip tour** link; hands-on actions are optional.

---

### Step 1 — "Picture tonight." · Dashboard (full-screen story card, no spotlight)

> It's 9:40 on a Tuesday. The game's on, the group chat is talking parlays, and there's that familiar pull — put something on it, feel something. You already know how that night usually ends. Upside exists so it can end differently: same rush, same sweat, same bragging rights — and every dollar still in your pocket. Want to walk through one evening together? Two minutes. You can skip anytime.

**Buttons:** *Show me tonight* / *I'll find my own way*. This is the consent gate — the only step without a Next.

---

### Step 2 — "When the urge hits, this is your first move." · Dashboard → spotlight the new **Take a pause** button

> That pull you just pictured? It peaks and it passes — usually in under a minute. "Take a pause" walks you through the minute: thirty seconds of breathing, a moment to name what you're feeling, and real people to talk to if the wave is bigger than a button. It lives on every screen, it never locks — not even during a break — and nothing you write ever leaves your device. You don't have to be in crisis to press it. You just have to be curious what's on the other side of thirty seconds.

**Interaction (optional):** Tap the button to run the real 4-step flow — breathing orb + 30s countdown, mood chips, reflection prompt, real helplines (1-800-GAMBLER, 988). The tour dims its own card and waits, resuming when the modal closes. **Exiting early via the modal's own "I'm good now" button counts** — learning that the flow never traps you *is* the lesson. Or press Next; nothing is logged if you skip.

---

### Step 3 — "Turn the bet you didn't place into money you keep." · Money Kept → spotlight hero total, quick-amount chips, "Keep it"

> Here's the move that changes the math. The $25 you were about to put on the game? Log it here instead. No real money moves — this is a running count of what stayed in your pocket. The total up top is already yours: every dollar on it is a bet that never happened. Tap $25, add a note if you want — "skipped the Sunday parlay" has a nice ring to it — and hit "Keep it." Then watch the number climb.

**Interaction:** User taps the $25 chip and hits "Keep it." The tour auto-advances when a savings entry is added. **This entry is real and is kept** — it becomes their genuine first redirect. (No fake demo data anywhere; the tour ends with the habit already started.)

---

### Step 4 — "Now, about that itch." · Dashboard → spotlight the daily-allowance card **and the three TopBar number chips**

> Redirecting the money doesn't switch off the wanting — so Upside gives the itch somewhere safe to go. First, your three numbers up top: **Points** is your play currency, **Kept** is the number that actually matters, and **Streak** is just days you showed up. This card is tonight's stake: free play points, claimable once a day. No deposit, no card on file, no way to buy more. Points have no cash value, which means tonight literally cannot cost you anything. Claim yours.

**Interaction:** User clicks Claim; tour advances when the daily claim flips to done. (Seed state makes this always work on a fresh device.) Next fallback if already claimed. *[The "three numbers" explainer is grafted from the runner-up tour — it's the app's persistent vocabulary and deserves one explicit definition.]*

---

### Step 5 — "Real questions. Play stakes." · Markets → spotlight one open market card

> These are live forecasts on real events — sports, crypto, news, the Oscars. The big number is the crowd's odds: a high percentage means the crowd calls it likely, and a long shot pays more if you're right. Same math as the apps you know, same little price chart, same sweat. The difference is what's on the line: points, never money. Find a question you have a take on and tap Yes or No.

**Interaction:** User taps any outcome to open the bet slip; advances when it opens. **The spotlighted card is chosen at runtime** (the still-open market with the highest-priced outcome), not hardcoded — so it never rots as market close-dates pass. *[Grafted from the runner-up; the original draft hardcoded the Fed rate-cut card, which closes in days.]*

---

### Step 6 — "Make your play." · Bet slip modal (tour card docks to the screen edge)

> This is a real bet slip in every way that's fun, and none of the ways that hurt. Pick a stake — the receipt shows exactly what comes back if you're right. And see the shield? "Play points · no real money at stake." That's a promise, not a footnote: nothing on this screen can ever touch your bank account. Lock it in.

**Interaction:** User confirms a stake (a small one — 100 — is suggested). Advances when the position is created. The reducer's silent guards (overdraw / daily limit / cool-off) can never deadlock the tour, because Next always exists.

---

### Step 7 — "The sweat — with nothing real on the line." · Portfolio → spotlight an open position + "Simulate result"

> Every open position lives here while the real world makes up its mind. Tonight you don't have to wait: "Simulate result" settles a market right now, at the same odds it was priced. Try it on one of yours. However it lands, notice what just happened — the pick, the sweat, the reveal, the full arc of a bet — and your rent money never entered the room. A win here is points on the board. A loss here is a shrug.

**Interaction:** User clicks "Simulate result"; advances when a position settles. Settlement is **honestly probability-weighted random** — the copy is written to land on a win *or* a loss (a loss being on-message: "a shrug"), avoiding the trust-eroding trick of a rigged demo win.

---

### Step 8 — "Bragging rights, still free." · Leaderboard → spotlight the highlighted "(you)" row

> Every point you win moves you up this board. That highlighted row is you — and the names above it are catchable. Rankings, streak flames, a podium with a crown: the competitive rush survives fully intact. The only thing missing is the part where somebody's paycheck was funding it.

**Interaction:** Watch only (read-only page) → Next.

---

### Step 9 — "Sweating a pick alone is half the fun. This is the other half." · Social → spotlight friend cards + Challenge button

> Quinn and Theo are already in your circle. Challenge a friend head-to-head: you stake points on a pick, they match it, winner takes the whole pot. Or build a group like Sunday Squad and keep standings going all season. It's the group-chat energy you actually like — minus the screenshot of someone's busted five-leg parlay. Your circle is yours to edit, too — add or drop friends, leave a group, anytime.

**Interaction:** Optional — open a Challenge to peek at the modal (tour waits, resumes on close). Challenges ship empty in the seed, so the step points at the button rather than forcing a creation. *[The "your circle is yours to edit" line covers remove-friend / leave-group, which no design originally mentioned.]*

---

### Step 10 — "The morning after, in numbers." · Insights → spotlight sweeps from the Money Kept curve to the mood bars

> This is where the nights add up. Your Money Kept curve, climbing. Your win rate on play bets. And the chart that matters most: how you felt before a pause, and how you felt after. Most people arrive stressed and leave calm — you'll watch your own pattern take shape right here. Every number on this page is computed on your device, for an audience of exactly one. You.

**Interaction:** Watch only → Next. **Copy adapts:** if the user actually ran the pause in step 2 and redirected in step 3, the card pays that off ("your own mood entry is already on the chart"); if they skipped those, it doesn't claim entries that aren't there.

---

### Step 11 — "You set the guardrails. You hold the keys." · Settings → spotlight the "Play limits & breaks" card

> Good nights are easier with rails you chose yourself. Cap how many points you can stake per day — or leave "No daily limit" checked if that's honestly where you are; no judgment, and you can change it anytime. Need real distance? "Take a break" pauses all betting and challenges for a day, three days, or a week — and you can end it early, because this is your tool, not your warden. One thing never locks, no matter what: the pause button and your Money Kept. Safety doesn't take nights off.

**Interaction:** Optional — set a limit or toggle the "No daily limit" checkbox live (applies instantly, no save button). **Optional "show me" shortcut** (grafted from the demo-mode design): start a 24h break, hop to Markets to see every card calmly locked with the amber banner, then return and end the break early — proving "your keys, both ways" instead of just describing it. Next to continue.

---

### Step 12 — "Yours. Provably." · Settings → spotlight Data export, the Account/sync card, **and the Profile card**

> Everything you did tonight lives in this browser — not on our servers. Change your name or avatar up top whenever you like (you'll notice there's not a single chip, dice, or dollar sign in the set — that's on purpose). Export the whole thing as a file anytime, journal included. Want it to follow you between devices? Create a free account and your progress syncs to the cloud, starting with everything you've already built here. Optional, always. And if you ever want a truly clean slate, Reset lives at the bottom — behind an "are you sure," because we respect what you've built.

**Interaction:** Watch only, or click Export for the tangible "your data is yours" beat → Next. *[The profile-card mention closes a coverage gap — no design originally spotlighted editing name/avatar.]*

---

### Step 13 — "One evening, two endings." · Plus (closing card over the Plus hero)

> That's the whole loop: the urge, paused. The money, kept. The itch, scratched for free. One promise before you go — everything that keeps you safe here is free, forever. Upside Plus exists for people who want to support that work, and it will never sell a betting edge or paywall a lifeline. The next urge is coming. That's not a failure — it's a Tuesday. And now you know exactly where to put it.

**Button:** *Start my evening* → closes the tour and routes home. Footer note: "Replay this walkthrough anytime from Settings."

---

## 4. Refinements folded in from the runner-up designs

The two designs that didn't win contributed these, already woven into §3 above:

- **Runtime market selection** (step 5) and settle target (step 7) — pick the anchor at render time, never hardcode a market that will close.
- **"Your three numbers" orientation** (step 4) — one explicit definition of the Points / Kept / Streak chips.
- **Escape-hatch lesson** (step 2) — teach that "I'm good now" exits the pause flow instantly; "it never traps you" is the feature. The 30s timer is **not** shortened.
- **Conditional copy** (steps 4 & 10) — cards adapt to whether the user actually did the optional actions, so we never claim an entry that isn't there.
- **Live cool-off mini-loop** (step 11) — an optional "show me" that starts and ends a real break so the user *sees* betting lock and unlock.
- **Action-aware acknowledgments** — when a step auto-advances because the user claimed / bet / redirected, the next card opens with a one-line acknowledgment rather than jumping cold.

### Coverage gaps closed (found by the judge against the full feature map)

- **Profile editing** (name / 12-emoji avatar / "Saved ✓" flash) → step 12.
- **Remove friend / leave group** → step 9's "your circle is yours to edit" line.
- **Mobile navigation** — the tour card is positioned to clear the mobile bottom tab bar and "More" sheet; every step anchor exists in both the desktop-sidebar and mobile layouts, including the new mobile "Take a pause" pill.

### Accessibility

Focus moves to each tour card on advance; **Esc pauses** with the position saved; `prefers-reduced-motion` disables the spotlight pulse.

---

## 5. How it's built (grounded in the current stack — no new dependencies)

| Piece | Detail |
|---|---|
| **New component** | `src/components/tour/GuidedTour.jsx` (~300 lines) — mounts in `Layout.jsx` beside `<OnboardingModal>`; renders when `tour.status` is `offer` or `active`. |
| **Steps as data** | `src/data/tour.js` (~150 lines) — array of `{ id, route, anchor, title, script, advanceWhen, optionalAction }`. The copy above lives here. |
| **Spotlight** | Dependency-free: each target gets a `data-tour="…"` attribute on the *existing* element; GuidedTour measures it (`getBoundingClientRect` + resize/scroll listeners) and draws the classic single-div cutout (`box-shadow: 0 0 0 9999px rgba(…, .82)`), click-through when the step invites interaction. Tooltip reuses the existing `Card`/`Button` kit. |
| **Navigation** | react-router 6 `useNavigate()` on step change when the step's route differs from the current path. |
| **Advancing on real actions** | No event bus needed — GuidedTour sits under `AppProvider`, so `advanceWhen` predicates just watch derived state from `useApp()` (claim flips, `positions.length` grows, savings entry added, a position settles). Every step also has Next, so guards can never deadlock it. |
| **State** | `createInitialState()` gains `tour: { status: 'pending', step: 0 }`; three reducer cases (`START_TOUR`, `SET_TOUR_STEP`, `END_TOUR`); `COMPLETE_ONBOARDING` sets `tour.status = 'offer'` when pending. `migrateState`'s spread backfills `tour` on old blobs — **no schema-version bump.** Persisted in the existing `upside.state.v2` key and carried by the existing Supabase sync, so finishing the tour on one device means it won't re-fire on another. |
| **Prerequisite** | Mount the orphaned `UrgeModal` + a small `PauseButton` in `Layout` (~30 lines). |
| **Touched files** | `reducer.js` (+ `reducer.test.js`), `Layout.jsx`, `Settings.jsx` (a "Replay the walkthrough" row), and one-line `data-tour` attributes in ~10 view files (TopBar, Dashboard, MarketCard, BetModal, Portfolio, MoneyKept, Insights, Social, Leaderboard, Plus). |
| **Total scope** | ~600–800 lines, no new packages, no schema bump. |

### Entry points

- **Auto-chained** after onboarding's "Start playing" (with a real decline path).
- **Settings → "Replay the walkthrough"** row (restarts from step 1).
- **`?tour=1`** URL param — fires only when already onboarded; for demo links, support replies, B2B pitches.
- **After Settings → Reset progress** — seed restores `onboarded=false`, so onboarding replays and the tour offer chains again.

### Skip / resume

Every card has a quiet "Skip tour" link (skipping never re-triggers the auto-offer, but stays available in Settings forever). The step index persists on every change, so closing the tab mid-tour shows a "Pick up where you left off?" card on next load.

### No demo-data machinery

The app already seeds every screen the tour visits (8,550 points, two open positions, $140 of $500 kept with human notes, a stressed→calm journal entry feeding the mood chart, 3W–1L, a 4-day streak, friends Quinn & Theo, the Sunday Squad group). The tour points at **real, populated screens** and its interactions write **real state that's kept** — the user finishes with a genuine first redirect and an open position.

---

## 6. Deliberate design choices worth confirming

1. **Onboarding stays; the tour is an add-on offer** (not a replacement). Force-marching would contradict the product's ethos.
2. **Tour interactions are real and permanent** — we do *not* snapshot-and-undo. The runner-up design offered to "tidy up" the user's first redirect on exit; that undercuts the entire "the loss becomes a visible win" thesis. The first redirect *is* the point.
3. **No rigged demo win** — settlement stays honestly random; copy is written to land gracefully on a loss.
4. **The pause button ships now** as a real fix, independent of the tour.

---

## 7. Explicitly out of scope for phase 1 (a phase-2 option)

The "Meet Sam" **`?demo=1` sandboxed demo account** — boot into a richly seeded fictional user (six weeks in: 23-day streak, $465/$500 kept, a live challenge, a market ready to settle) with the tour narrating over it. This is the *only* way to show otherwise-unreachable states ("Settle all closed," a live challenge's "Reveal result," six-week Insights charts) and makes a shareable, riskless evaluation link for the B2B audience in `docs/MONETIZATION.md` (clinics, councils, EAPs).

**Recommendation:** ship the phase-1 real-state tour first; if approved, phase 2 reuses the exact same `tour.js` step data over Sam's state. I've scoped it separately because it reaches into the app's state initializer and sync effects — meaningfully more invasive than the phase-1 overlay.

---

## 8. Open questions for you

1. **Copy** — does the "one evening" voice land, or do you want it warmer / more clinical / shorter?
2. **13 steps** — right length, or trim (e.g. fold Leaderboard into Social)?
3. **Pause button placement** — sidebar footer (desktop) + floating pill above the mobile tab bar: good, or elsewhere?
4. **Phase 2 "Meet Sam"** — worth scoping now, or park it?
5. **Anything to *not* touch** before I start.
