# Upside — Monetization & Sustainability

How Upside could fund itself **without betraying its purpose**. This is a
strategy exploration, not a committed roadmap. It pairs with
[`../README.md`](../README.md) (product), [`IMPLEMENTATION.md`](IMPLEMENTATION.md)
(architecture), and [`../HANDOFF.md`](../HANDOFF.md) (status).

> ⚠️ Nothing here introduces real-money wagering, cash-out, or any cash value
> for play points. Those remain permanently out of scope (see README →
> _Out of scope_). The in-app **Upside Plus** surface (`/plus`) is a
> non-functional teaser — no payments are collected anywhere in the codebase.

---

## 1. The core constraint: aligned incentives

Upside is a **gambling harm-reduction** product. That creates a hard rule that
shapes every revenue idea:

> **Revenue must never depend on — or encourage — gambling-like behavior.**

A harm-reduction tool that makes more money when users engage more compulsively
is a contradiction. So the usual "engagement economy" levers are off the table.
The test for any revenue stream is simple:

- ✅ **Aligned:** we earn more when users get *healthier* (stay in control, save
  money, reach out for help, recover).
- ❌ **Misaligned:** we earn more when users play more, chase losses, or stay
  hooked.

---

## 2. What we will **not** do (hard "no"s)

These are excluded on ethics and brand-integrity grounds, not just legality:

- **No real-money betting, rake, or house edge.** The premise is zero money at
  risk; a cut of wagers would invert the entire mission.
- **No gambling/sportsbook ads or affiliate links.** Sending an at-risk user to
  DraftKings/FanDuel/Polymarket for a referral fee is the exact harm we exist to
  reduce. Hard no, at any price.
- **No selling or brokering user data.** Journal entries, moods, and urge logs
  are deeply sensitive. They are never sold, and in the MVP never even leave the
  device.
- **No paywalling safety.** The urge-intervention flow, helpline resources,
  cooldown, and Money Kept tracker are **free forever**. We never charge a person
  in crisis for the tool that helps them stop.
- **No loot-box / variable-reward dark patterns** engineered to boost
  compulsive play, even on play money.

---

## 3. Recommended revenue models (in priority order)

### A. B2B / B2G licensing & white-label  ⭐ strongest fit

Sell Upside as a configurable, white-labeled harm-reduction tool to
organizations whose mission already aligns with ours:

| Buyer | Why they'd pay | Motion |
| --- | --- | --- |
| **Treatment centers & clinicians** | A structured between-sessions tool; clinician-ready progress exports | Per-seat or per-clinic SaaS |
| **State problem-gambling councils** | Public-health mandate; often funded by operator levies | Annual contract / RFP |
| **Universities & student-wellness** | Rising student sports-betting harm | Campus site license |
| **Employers / EAP & wellness vendors** | Benefits differentiation; productivity | Per-employee-per-month (PEPM) |
| **Sportsbooks' mandated "responsible gambling" budgets** | Regulators increasingly *require* RG spend; we are a credible, independent vendor (we take their RG budget, never their wagering revenue) | Vendor contract |

This is the cleanest model: incentives align (they buy *because* it reduces
harm), revenue is recurring and contractual, and it doesn't require charging
vulnerable individuals.

### B. Grants & public-health funding

Harm reduction is a funded public-health category. Targets:

- **NCPG** and state affiliate grants.
- **SAMHSA** / behavioral-health innovation funding.
- **State gambling-mitigation funds** (many states earmark a % of gaming tax for
  treatment/prevention).
- **Foundations** focused on addiction, fintech-for-good, or youth mental health.

Non-dilutive, mission-validating, and a credibility signal for B2B sales. Best
paired with an outcomes study (see §6).

### C. Consumer supporter subscription — "Upside Plus"

A **freemium** tier (`/plus` in-app) for individuals who want to support the
project and get **deeper support tooling** — never a betting advantage:

- Long-range insights, trigger/time-of-day pattern analysis.
- Opt-in accountability partner (share streak & Money Kept with a trusted person).
- Custom goals, milestone rewards, gentle check-in reminders.
- Larger guided-reflection library (CBT-informed prompts, breathing).
- Clinician/support-group-ready progress reports.
- Themed play-money market packs (variety, not edge).

**Guardrail:** Plus is *additive support*, framed as "pay to help us keep the
core free," modeled on Calm/Headspace and on donation-forward apps. It must pass
the §1 test — none of it makes anyone gamble more. Suggested price: **$4.99/mo**
or **$39/yr**, with free Plus for anyone in documented financial hardship.

### D. Donations / pay-it-forward

A lightweight "keep Upside free for someone else" one-time gift, surfaced
*after* a positive moment (e.g. hitting a savings milestone), never to someone
mid-urge. Low revenue, high mission alignment, strengthens community.

### E. Anonymized, aggregated research partnerships (carefully)

Academic/public-health researchers value real-world harm-reduction data.
**Only** with explicit opt-in, fully de-identified, aggregated, and never
commercial data brokering. Revenue is secondary to the credibility and
outcomes-evidence it produces. Requires an ethics/IRB review before any launch.

---

## 4. Why the consumer tier stays small (and that's fine)

Charging individuals who are trying to *spend less money* is inherently
constrained — and ethically we must keep all safety features free. So the
consumer subscription is a **supporter** model, not the growth engine. The
durable business is **B2B/B2G + grants** (§3A, §3B): organizations with budgets
and mandates that pay precisely because the product reduces harm.

---

## 5. Rough sizing (illustrative, not a forecast)

- **US sports-betting** is a >$10B/yr revenue market growing fast; regulators
  increasingly mandate responsible-gambling spend — a budget we can address
  *without* touching wagering revenue.
- **~2.5M US adults** meet criteria for severe gambling problems; millions more
  are at-risk — a large underserved harm-reduction audience.
- A focused wedge — e.g. **50 clinics/campuses at $5–15k/yr** plus a couple of
  state-council contracts — is a credible early-revenue path that needs no
  consumer scale and no real-money mechanics.

---

## 6. What it would take (and what stays out of scope)

The current MVP is intentionally **client-only**; most models above need
infrastructure that is *deliberately deferred*:

- **Accounts + sync** for multi-device, accountability sharing, and B2B
  admin/reporting → requires a backend, auth, and a privacy/security review.
- **Payments** (Stripe) for Plus/donations → standard, but PCI-aware; still
  **never** real-money *wagering* rails.
- **Outcomes measurement** (opt-in, de-identified) to prove harm reduction —
  the single most valuable asset for grants *and* B2B sales.
- **Compliance**: HIPAA-adjacent data handling for clinical buyers, accessibility
  (WCAG), and clear data-ownership/export (export already shipped in Settings).

None of this changes the permanent exclusions: no real-money betting, no cash
value for points, no IRA/brokerage flows, no selling user data.

---

## 7. Mission-aligned KPIs (how we'd measure success)

We track the *health* outcomes, not just revenue:

- $ **Money Kept** per active user; total redirected impulses.
- Urge flows completed; self-reported mood shift (before → after).
- Retention of healthy engagement (streaks) **without** rising play intensity.
- Referrals to real help (helpline taps) — a *good* outcome, even though it sends
  users away from us.
- Only then: ARR, B2B logos, grant funding, supporter conversions.

If a revenue line ever pushes a health KPI the wrong way, the revenue line is
wrong — not the KPI.
