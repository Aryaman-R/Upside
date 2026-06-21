import { useEffect, useRef, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { AVATARS, ALLOWANCE_OPTIONS } from '../../data/avatars.js'
import { formatPoints } from '../../lib/format.js'

// First-run, non-dismissable onboarding. Three short steps:
//   1. the harm-reduction philosophy (set expectations: play money, no wagering)
//   2. personalize (name + avatar)
//   3. choose a daily play-point allowance, then start
// Completing it flips `onboarded` so it never shows again on this device.
export default function OnboardingModal({ open }) {
  const { dispatch } = useApp()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [allowance, setAllowance] = useState(500)

  // Move keyboard focus to the new step's first control on each step change so
  // keyboard / screen-reader users don't get dropped on <body>. Skips the
  // initial mount (Modal already handles focus-in on open).
  const stepRef = useRef(null)
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    stepRef.current?.querySelector('input, textarea, select, button')?.focus?.()
  }, [step])

  function finish() {
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: { name, avatar, dailyAllowance: allowance },
    })
  }

  return (
    <Modal open={open} onClose={() => {}} ariaLabel="Welcome to Upside" maxWidth="max-w-lg">
      {/* Progress dots */}
      <div className="mb-5 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={['h-1.5 flex-1 rounded-full', i <= step ? 'bg-brand-500' : 'bg-white/10'].join(' ')}
          />
        ))}
      </div>

      <div ref={stepRef}>
      {step === 0 && (
        <div className="space-y-5 animate-fade-in">
          {/* Gradient header band */}
          <div className="relative -mx-6 -mt-6 mb-1 overflow-hidden bg-mesh-brand px-6 py-8 text-center">
            <div
              className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25 shadow-glow-sm">
                <Icon name="logo" size={26} />
              </span>
              <p className="eyebrow mb-2 text-center">Welcome</p>
              <h2 className="font-display text-3xl font-black tracking-display text-gradient-brand sm:text-display-sm">
                Welcome to Upside
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Bet on yourself, not against your wallet.
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            <Principle icon="markets" title="Satisfy the itch — safely" delay={0}>
              Forecast real events, build a portfolio, climb the leaderboard. All with{' '}
              <strong className="text-slate-200">play points</strong>, never real money.
            </Principle>
            <Principle icon="heart" title="Redirect the money" delay={90}>
              When a real-money urge hits, log that amount into{' '}
              <strong className="text-slate-200">Money Kept</strong>. The loss becomes a visible win.
            </Principle>
            <Principle icon="wind" title="Stay in control" delay={180}>
              Set your own play limits, take a break anytime in Settings, and reach real help lines
              whenever you need them.
            </Principle>
          </ul>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 p-3 text-center text-xs text-amber-200">
            <Icon name="shield" size={15} className="shrink-0" />
            <span>No real money is ever wagered, held, or moved. Points have no cash value.</span>
          </div>
          <Button fullWidth onClick={() => setStep(1)}>
            Get started
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-slate-50">Make it yours</h2>
            <p className="text-sm text-slate-400">Pick a name and avatar for your leaderboard spot.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="e.g. Alex"
              aria-label="Display name"
              className="input w-full"
            />
            <p className="mt-1 text-xs text-slate-500">Optional — leave blank to stay anonymous as “You”.</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">Avatar</p>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={[
                    'flex h-11 w-11 items-center justify-center rounded-xl text-2xl transition-colors',
                    avatar === a ? 'bg-brand-500/20 ring-2 ring-brand-400' : 'bg-white/5 hover:bg-white/10',
                  ].join(' ')}
                  aria-label={`Choose ${a}`}
                >
                  <span aria-hidden>{a}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-slate-50">Set your daily allowance</h2>
            <p className="text-sm text-slate-400">
              Claim this many free play points once a day. A self-paced limit keeps it fun, not chasey.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ALLOWANCE_OPTIONS.map((a) => (
              <button
                key={a}
                onClick={() => setAllowance(a)}
                className={[
                  'rounded-xl border px-4 py-3 text-center transition-colors',
                  allowance === a
                    ? 'border-brand-400 bg-brand-500/15 text-brand-200'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
                ].join(' ')}
              >
                <span className="block text-lg font-bold">{formatPoints(a)}</span>
                <span className="text-xs text-slate-400">points / day</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500">You can change this anytime in Settings.</p>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={finish}>Start playing</Button>
          </div>
        </div>
      )}
      </div>
    </Modal>
  )
}

function Principle({ icon, title, children, delay = 0 }) {
  return (
    <li
      className="surface-muted flex gap-3 p-3 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/15"
        aria-hidden
      >
        <Icon name={icon} size={18} />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="text-sm text-slate-400">{children}</p>
      </div>
    </li>
  )
}
