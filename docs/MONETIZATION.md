# Upside — Monetization & Sustainability

How Upside funds itself **because of its purpose, not in spite of it**. This is a
strategy exploration, not a committed roadmap. It pairs with
[`../README.md`](../README.md) (product), [`IMPLEMENTATION.md`](IMPLEMENTATION.md)
(architecture), and [`../HANDOFF.md`](../HANDOFF.md) (status).

> ⚠️ **This is a demo/prototype. Everything financial here is SIMULATED.** No
> real bank, brokerage, or IRA is ever contacted; no login happens at any
> institution; no money actually moves. The Upside balance, funding sources,
> destination accounts, and the 5% fee are all client-side simulations that
> *model* the intended business — they do not execute it. A real version would
> require licensed financial infrastructure (see §6). "points" remain a pure
> play currency for the social leaderboard/challenges, with no cash value.

---

## 1. The core constraint: aligned incentives

Upside is a **gambling harm-reduction** product with a new premise:
**"Win it, or invest it. Never just lose it."** A user funds an **Upside
balance** from their bank (a **funding source**), predicts in **dollars**, and
connects **destination accounts** — a **Roth IRA by default**, plus high-yield
savings or other retirement accounts — where redirected losses land.

- **WIN →** profit returns to the Upside balance.
- **LOSE →** the stake, minus a **5% platform fee**, is routed into the
  destination account (the Roth IRA by default) and tracked as **"Invested"**.

That mechanic *is* the incentive alignment, and it shapes every revenue idea:

> **We earn only when we route a user's money into that user's own savings.**

A harm-reduction tool that makes more money when users play more compulsively is
a contradiction. Our revenue does the opposite: the platform's income is a small
slice of money the user *keeps* (invests in their own future), not a slice of
money the user loses to a house. The test for any revenue stream stays simple:

- ✅ **Aligned:** we earn more when users get *healthier* — stay in control,
  invest their would-be losses, reach out for help, recover.
- ❌ **Misaligned:** we earn more when users play more, chase losses, or stay
  hooked.

---

## 2. What we will **not** do (hard "no"s)

These are excluded on ethics and brand-integrity grounds, not just legality:

- **No house edge on wins, no rake on wagering.** We take **nothing** when a
  user wins, and nothing on the act of predicting itself. Our only fee is the
  **5% on redirected losses**, and that fee exists *because* it accompanies money
  being moved into the user's own account. We never profit from a user losing
  more overall — the more they lose, the more of *their own money* they keep.
- **No gambling/sportsbook ads or affiliate links.** Sending an at-risk user to
  DraftKings/FanDuel/Polymarket for a referral fee is the exact harm we exist to
  reduce. Hard no, at any price.
- **No selling or brokering user data.** Journal entries, moods, urge logs, and
  balances are deeply sensitive. They are never sold.
- **No paywalling safety.** The can't-lose mechanic, the always-available
  **"Take a pause"** urge-intervention flow, self-imposed dollar stake limits +
  cool-off breaks, helpline resources, and the Invested tracker are **free
  forever**. We never charge a person in crisis for the tool that helps them stop.
- **No loot-box / variable-reward dark patterns** engineered to boost compulsive
  play, and **no pay-to-win** — money never buys a prediction edge, better odds,
  or a leaderboard advantage.

---

## 3. Revenue models (in priority order)

### A. The 5% loss-routing fee  ⭐ core revenue mechanism

This is the primary line of the business. When a prediction loses, the staked
dollars are redirected into the user's connected destination account (Roth IRA
by default) **minus a 5% platform fee**. The user keeps **95% of every "loss"**
— now invested in their own future — and Upside earns the remaining 5% *for the
service of routing it there*.

Why this is honest and mission-aligned:

- The fee only ever fires **alongside money moving into the user's savings**. We
  literally cannot earn unless the user is protected from a real loss.
- It is transparent and legible: "you kept $95 of your $100; we took $5 to move
  it into your Roth." No hidden margin, no odds manipulation.
- It scales with *impulses successfully redirected*, which is exactly the health
  outcome we want to grow (see §7).

> In the demo this fee is computed and displayed but **never collected** — no
> real transaction occurs. §6 covers what collecting it for real would require.

### B. B2B / B2G licensing & white-label

Sell Upside as a configurable, white-labeled harm-reduction tool to
organizations whose mission already aligns with ours. A shareable, no-signup
walkthrough (`?demo=1` / `?tour=1`) is a strong sales asset here — buyers can
experience the loss-to-savings loop end to end without funding anything.

| Buyer | Why they'd pay | Motion |
| --- | --- | --- |
| **Treatment centers & clinicians** | A structured between-sessions tool; clinician-ready progress exports | Per-seat or per-clinic SaaS |
| **State problem-gambling councils** | Public-health mandate; often funded by operator levies | Annual contract / RFP |
| **Universities & student-wellness** | Rising student sports-betting harm | Campus site license |
| **Employers / EAP & wellness vendors** | Benefits differentiation; financial-wellness + productivity | Per-employee-per-month (PEPM) |
| **Sportsbooks' mandated "responsible gambling" budgets** | Regulators increasingly *require* RG spend; we are a credible, independent vendor (we take their RG budget, never their wagering revenue) | Vendor contract |

Incentives align (they buy *because* it reduces harm), revenue is recurring and
contractual, and it doesn't require charging vulnerable individuals a subscription.

### C. Grants & public-health funding

Harm reduction is a funded public-health category. Targets:

- **NCPG** and state affiliate grants.
- **SAMHSA** / behavioral-health innovation funding.
- **State gambling-mitigation funds** (many states earmark a % of gaming tax for
  treatment/prevention).
- **Foundations** focused on addiction, financial resilience, fintech-for-good,
  or youth mental health.

Non-dilutive, mission-validating, and a credibility signal for B2B sales. Best
paired with an outcomes study (see §6).

### D. Consumer supporter subscription — "Upside Plus"

A **freemium** tier (`/plus` in-app) for individuals who want deeper support
tooling — never a betting advantage and never a discount on safety:

- Long-range insights, trigger/time-of-day pattern analysis.
- Opt-in accountability partner (share streak & Invested total with a trusted
  person).
- Custom savings goals, milestone rewards, gentle check-in reminders.
- Larger guided-reflection library (CBT-informed prompts, breathing).
- Clinician/support-group-ready progress reports.

**Guardrail:** Plus is *additive support*, modeled on Calm/Headspace and
donation-forward apps. It must pass the §1 test — none of it makes anyone gamble
more, and it never touches the 5% mechanic or unlocks an edge. This is a
supporter model, not the growth engine.

### E. Anonymized, aggregated research partnerships (carefully)

Academic/public-health researchers value real-world harm-reduction and
financial-behavior data. **Only** with explicit opt-in, fully de-identified,
aggregated, and never commercial data brokering. Requires an ethics/IRB review
before any launch.

---

## 4. Why the fee is the engine (and stays honest)

Charging individuals who are trying to *lose less money* would normally be
ethically fraught. The 5% loss-routing fee resolves that tension: we are not
charging people to gamble — we are taking a small, transparent cut of money we
just **rescued into their own retirement/savings account**. The user is strictly
better off after every "loss" than they would be at a real sportsbook, where
they'd keep $0. B2B/B2G + grants (§3B, §3C) then diversify revenue and fund the
outcomes evidence that makes the whole thing credible.

---

## 5. Rough sizing (illustrative, not a forecast)

- **US sports-betting** is a >$10B/yr revenue market growing fast — every dollar
  of that is a dollar we'd redirect into savings rather than lose to a house.
- **~2.5M US adults** meet criteria for severe gambling problems; millions more
  are at-risk — a large underserved audience for a "losses become savings" model.
- Even a small fraction of redirected impulses generates fee revenue *while*
  building each user's invested balance — the two grow together.
- A focused B2B wedge — e.g. **50 clinics/campuses at $5–15k/yr** plus a couple
  of state-council contracts — is a credible early path that needs no consumer
  scale.

---

## 6. What a REAL (non-demo) version would require

Today's build **simulates** the entire money flow client-side. Turning that
simulation into a product that actually funds a balance, moves dollars, and
routes losses into a real Roth IRA is substantial, regulated work — this is the
hard part, and the demo does none of it:

- **Bank / funding-source integration** (e.g. an ACH + account-linking provider
  such as Plaid/Stripe/Dwolla) to pull money into the Upside balance — with the
  associated fraud, reversal, and settlement handling.
- **Brokerage / IRA custody integration** to actually open and deposit into a
  user's Roth IRA, high-yield savings, or retirement account — via a custodian
  or brokerage-as-a-service partner. This means real custody of client funds.
- **KYC/AML** — identity verification, sanctions/PEP screening, and transaction
  monitoring on every user who funds a balance or moves money.
- **Regulatory licensing & structure.** A real-money product that lets people
  *predict outcomes for dollars* and *routes funds into IRAs* sits near several
  regulated domains at once: **prediction/derivatives markets** (potential
  CFTC/state exposure depending on contract design), **money transmission**,
  **broker-dealer / robo-advisory** activity, and **IRA custody** rules. Each
  carries its own licensing, disclosure, and audit obligations, likely with
  counsel and partner institutions rather than building it all in-house.
- **Payments & fee collection** to actually charge and account for the 5% fee,
  including tax reporting on IRA contributions.
- **Accounts + backend + security** for multi-device, accountability sharing,
  B2B admin/reporting, and safe storage of financial data — with a full
  privacy/security review.
- **Compliance surround**: HIPAA-adjacent handling for clinical buyers,
  accessibility (WCAG), and clear data-ownership/export.

None of this changes the permanent exclusions: no house edge on play, no
gambling ads/affiliates, no pay-to-win, no selling user data, and safety
features are never paywalled.

---

## 7. Mission-aligned KPIs (how we'd measure success)

We track the *health* outcomes, not just revenue:

- $ **Invested** per active user; total dollars redirected from losses into
  savings/IRAs (the metric the 5% fee rides on).
- Urge flows completed; self-reported **mood shift** (before → after).
- Retention of **healthy engagement** (streaks) **without** rising play intensity.
- Referrals to real help (helpline taps) — a *good* outcome, even though it sends
  users away from us.
- Only then: fee revenue, ARR, B2B logos, grant funding, supporter conversions.

If a revenue line ever pushes a health KPI the wrong way, the revenue line is
wrong — not the KPI. Because our core fee only earns when a user's own savings
grow, revenue and health should move together by design.
