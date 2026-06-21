import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'
import Reveal from '../components/ui/Reveal.jsx'

// Upside Plus — a NON-FUNCTIONAL upsell surface for an optional future
// supporter tier. There are NO payments, no checkout, and no real money here:
// the "Join the waitlist" action only records interest in local component state.
// By design, Plus never unlocks a betting advantage (no pay-to-win) — it only
// adds deeper *support, insight, and personalization*. Monetization rationale
// lives in docs/MONETIZATION.md.

const FREE_FEATURES = [
  'Play-money prediction markets',
  'Portfolio & leaderboard',
  'Money Kept savings tracker',
  'Urge-intervention flow & journal',
  'Daily play allowance',
  'Basic insights & data export',
]

const PLUS_FEATURES = [
  { icon: 'bulb', title: 'Deeper insights', detail: 'Trend lines, triggers, and time-of-day urge patterns over months.' },
  { icon: 'users', title: 'Accountability partner', detail: 'Share your streak & Money Kept with a trusted person (your choice).' },
  { icon: 'target', title: 'Custom goals & nudges', detail: 'Personal savings goals, milestone rewards, and gentle check-in reminders.' },
  { icon: 'folder', title: 'Custom market packs', detail: 'Themed play-money market packs refreshed weekly for variety.' },
  { icon: 'wind', title: 'Guided reflections', detail: 'A larger library of CBT-informed prompts and breathing exercises.' },
  { icon: 'fileText', title: 'Clinician-ready reports', detail: 'Export a shareable progress summary for a counselor or support group.' },
]

export default function Plus() {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  function joinWaitlist(e) {
    e.preventDefault()
    // No network call — this is a teaser. Interest stays on-device only.
    if (email.trim()) setJoined(true)
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card
        variant="glow"
        padding="lg"
        className="overflow-hidden bg-mesh-brand text-center"
      >
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25 shadow-glow-sm animate-breathe">
          <Icon name="sparkles" size={24} />
        </span>
        <p className="eyebrow mb-2">Coming soon</p>
        <h1 className="text-gradient-brand font-display text-display-sm font-bold tracking-display sm:text-display">
          Upside Plus
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-slate-300">
          Optional support for the journey — deeper insight, accountability, and personalization.
          The core harm-reduction tools stay <strong className="text-brand-300">free, forever</strong>.
        </p>
        <p className="mx-auto mt-4 max-w-md text-xs text-slate-500">
          Plus never buys a betting edge. No pay-to-win, no real-money wagering — just more ways to stay in control.
        </p>
      </Card>

      {/* Plans */}
      <div className="grid items-start gap-5 md:grid-cols-2">
        {/* Free — slightly de-emphasized */}
        <Reveal as="div" className="opacity-90">
          <Card className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-slate-300">Free</h2>
              <span className="text-3xl font-black text-slate-200">$0</span>
            </div>
            <p className="text-sm text-slate-400">Everything you need to substitute, redirect, and interrupt.</p>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <Icon name="check" size={15} className="shrink-0 text-brand-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Badge tone="neutral">Your current plan</Badge>
          </Card>
        </Reveal>

        {/* Plus — the recommended choice */}
        <Reveal as="div" delay={80} className="relative md:scale-[1.02]">
          <Badge
            tone="brand"
            className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 shadow-glow-sm"
          >
            <Icon name="sparkles" size={12} /> Recommended
          </Badge>
          <Card variant="glow" padding="lg" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-brand-200">Plus</h2>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-50">$4.99</span>
                <span className="text-sm text-slate-400">/mo</span>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Everything in Free, plus deeper support tools.{' '}
              <span className="text-brand-300/90">Less than a single bet.</span>
            </p>
            <ul className="space-y-3">
              {PLUS_FEATURES.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/20"
                    aria-hidden
                  >
                    <Icon name={f.icon} size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{f.title}</p>
                    <p className="text-xs text-slate-400">{f.detail}</p>
                  </div>
                </li>
              ))}
            </ul>

            {joined ? (
              <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-center text-sm text-brand-200">
                You’re on the list 💚 We’ll reach out when Plus is ready. No charge until you opt in.
              </div>
            ) : (
              <form onSubmit={joinWaitlist} className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="input flex-1"
                />
                <Button type="submit">Join the waitlist</Button>
              </form>
            )}
            <p className="text-center text-[11px] text-slate-500">
              Teaser only — no payment is collected and nothing is sent anywhere.
            </p>
          </Card>
        </Reveal>
      </div>

      {/* B2B / mission note */}
      <Card className="flex items-start gap-3 border-sky-400/20 bg-sky-500/5">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20"
          aria-hidden
        >
          <Icon name="building" size={19} />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-100">For clinics, councils &amp; employers</h2>
          <p className="text-sm text-slate-400">
            Upside can be licensed as a white-labeled harm-reduction tool for treatment programs, state
            problem-gambling councils, and employee wellness benefits. Interested in a pilot? See our
            partnership models in <span className="font-medium text-sky-300">docs/MONETIZATION.md</span>.
          </p>
        </div>
      </Card>
    </div>
  )
}
