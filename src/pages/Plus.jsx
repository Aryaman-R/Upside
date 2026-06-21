import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'

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
  { icon: '🧠', title: 'Deeper insights', detail: 'Trend lines, triggers, and time-of-day urge patterns over months.' },
  { icon: '🤝', title: 'Accountability partner', detail: 'Share your streak & Money Kept with a trusted person (your choice).' },
  { icon: '🎯', title: 'Custom goals & nudges', detail: 'Personal savings goals, milestone rewards, and gentle check-in reminders.' },
  { icon: '🗂️', title: 'Custom market packs', detail: 'Themed play-money market packs refreshed weekly for variety.' },
  { icon: '🧘', title: 'Guided reflections', detail: 'A larger library of CBT-informed prompts and breathing exercises.' },
  { icon: '📤', title: 'Clinician-ready reports', detail: 'Export a shareable progress summary for a counselor or support group.' },
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
    <div className="space-y-6">
      {/* Hero */}
      <Card className="bg-gradient-to-br from-brand-700/30 to-ink-850 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
          <Icon name="plus" size={22} />
        </span>
        <Badge tone="brand">Coming soon</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tightish text-slate-50">Upside Plus</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          Optional support for the journey — deeper insight, accountability, and personalization.
          The core harm-reduction tools stay <strong className="text-brand-300">free, forever</strong>.
        </p>
        <p className="mx-auto mt-3 max-w-md text-xs text-slate-500">
          Plus never buys a betting edge. No pay-to-win, no real-money wagering — just more ways to stay in control.
        </p>
      </Card>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-slate-100">Free</h2>
            <span className="text-2xl font-extrabold text-slate-50">$0</span>
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

        <Card className="space-y-4 ring-1 ring-brand-500/40">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-brand-200">Plus</h2>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-slate-50">$4.99</span>
              <span className="text-sm text-slate-400">/mo</span>
            </div>
          </div>
          <p className="text-sm text-slate-400">Everything in Free, plus deeper support tools.</p>
          <ul className="space-y-3">
            {PLUS_FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="text-lg" aria-hidden>{f.icon}</span>
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
                className="flex-1 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-brand-400"
              />
              <Button type="submit">Join the waitlist</Button>
            </form>
          )}
          <p className="text-center text-[11px] text-slate-500">
            Teaser only — no payment is collected and nothing is sent anywhere.
          </p>
        </Card>
      </div>

      {/* B2B / mission note */}
      <Card className="space-y-2 border-sky-400/20 bg-sky-500/5">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>🏥</span>
          <h2 className="text-lg font-bold text-slate-100">For clinics, councils & employers</h2>
        </div>
        <p className="text-sm text-slate-400">
          Upside can be licensed as a white-labeled harm-reduction tool for treatment programs, state
          problem-gambling councils, and employee wellness benefits. Interested in a pilot? See our
          partnership models in <span className="font-medium text-sky-300">docs/MONETIZATION.md</span>.
        </p>
      </Card>
    </div>
  )
}
