import { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { MOOD_TAGS, pickPrompt } from '../../data/prompts.js'
import { SUPPORT_RESOURCES } from '../../data/resources.js'
import { formatUSD, formatClock } from '../../lib/format.js'

// Length of the enforced "pause" before the user can move past the cooldown.
// Short enough to be usable in a demo, long enough to break the impulse loop.
const COOLDOWN_SECONDS = 30

// The intervention is a 4-step flow:
//   1. breathe  — name the feeling + enforced cooldown timer
//   2. reflect  — answer a journaling prompt
//   3. redirect — see money saved + optionally divert the urge into savings
//   4. support  — mood-after + real help resources, then log the whole thing
const STEPS = ['breathe', 'reflect', 'redirect', 'support']

export default function UrgeModal({ open, onClose }) {
  const { savings, dispatch } = useApp()

  const [step, setStep] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS)
  const [moodBefore, setMoodBefore] = useState(null)
  const [moodAfter, setMoodAfter] = useState(null)
  const [reflection, setReflection] = useState('')
  const [redirectAmount, setRedirectAmount] = useState('')
  const [redirected, setRedirected] = useState(false)

  // A prompt that stays stable for the lifetime of one urge session.
  const prompt = useMemo(() => pickPrompt(savings.entries.length), [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset everything whenever the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setStep(0)
      setSecondsLeft(COOLDOWN_SECONDS)
      setMoodBefore(null)
      setMoodAfter(null)
      setReflection('')
      setRedirectAmount('')
      setRedirected(false)
    }
  }, [open])

  // Tick the cooldown timer while on step 1.
  useEffect(() => {
    if (!open || step !== 0 || secondsLeft <= 0) return undefined
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [open, step, secondsLeft])

  const cooldownDone = secondsLeft <= 0

  function finish() {
    dispatch({
      type: 'LOG_URGE',
      payload: {
        prompt,
        reflection,
        moodBefore,
        moodAfter,
        savedSnapshot: savings.total,
      },
    })
    onClose?.()
  }

  function handleRedirect() {
    const amount = Number(redirectAmount)
    if (!Number.isFinite(amount) || amount <= 0) return
    dispatch({ type: 'ADD_SAVINGS', payload: { amount, note: 'Diverted during an urge' } })
    setRedirected(true)
  }

  return (
    <Modal open={open} onClose={onClose} title="Feeling the urge? Let’s pause together.">
      {/* Step indicator */}
      <div className="mb-5 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={[
              'h-1.5 flex-1 rounded-full transition-colors',
              i <= step ? 'bg-brand-500' : 'bg-white/10',
            ].join(' ')}
          />
        ))}
      </div>

      {/* STEP 1 — Breathe / cooldown ---------------------------------------- */}
      {step === 0 && (
        <div className="space-y-5 animate-fade-in">
          <p className="text-slate-300">
            Urges peak and pass. Take {COOLDOWN_SECONDS} seconds before doing anything
            — the impulse will be quieter on the other side.
          </p>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">
              How are you feeling right now?
            </p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMoodBefore(m.id)}
                  className={[
                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                    moodBefore === m.id
                      ? 'bg-brand-500 text-ink-900 font-semibold'
                      : 'bg-white/10 text-slate-200 hover:bg-white/15',
                  ].join(' ')}
                >
                  <span className="mr-1" aria-hidden>{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="surface-muted flex flex-col items-center gap-3 p-6">
            <span className="text-5xl font-bold tabular-nums text-brand-300">
              {formatClock(secondsLeft)}
            </span>
            <ProgressBar value={1 - secondsLeft / COOLDOWN_SECONDS} />
            <p className="text-center text-sm text-slate-400">
              {cooldownDone
                ? 'Nicely done. The wave passed — continue when you’re ready.'
                : 'Breathe in… and out. Let the timer run.'}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              I’m good now
            </Button>
            <Button onClick={() => setStep(1)} disabled={!cooldownDone}>
              {cooldownDone ? 'Continue' : 'Please wait…'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — Reflect --------------------------------------------------- */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="surface-muted p-4">
            <p className="text-sm font-medium text-brand-300">Reflect</p>
            <p className="mt-1 text-slate-100">{prompt}</p>
          </div>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={5}
            placeholder="Write as much or as little as you want. This stays on your device."
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 p-3 text-slate-100 placeholder:text-slate-500 focus:border-brand-400"
          />
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {/* STEP 3 — Redirect into savings ------------------------------------- */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="surface-muted p-5 text-center">
            <p className="text-sm text-slate-400">You’ve already kept</p>
            <p className="text-4xl font-extrabold text-brand-300">
              {formatUSD(savings.total)}
            </p>
            <p className="mt-1 text-sm text-slate-400">out of the casino’s hands.</p>
          </div>

          <p className="text-slate-300">
            How much were you about to bet? Move it into your{' '}
            <span className="font-semibold text-brand-300">Money Kept</span> instead —
            it’s a win, not a loss.
          </p>

          {redirected ? (
            <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-center text-brand-200">
              Added to your savings. That’s real money you still have. 💚
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  inputMode="decimal"
                  value={redirectAmount}
                  onChange={(e) => setRedirectAmount(e.target.value)}
                  placeholder="25"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/60 py-2.5 pl-7 pr-3 text-slate-100 placeholder:text-slate-500 focus:border-brand-400"
                />
              </div>
              <Button onClick={handleRedirect}>Keep it</Button>
            </div>
          )}

          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {/* STEP 4 — Support + finish ------------------------------------------ */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">
              How are you feeling now?
            </p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMoodAfter(m.id)}
                  className={[
                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                    moodAfter === m.id
                      ? 'bg-brand-500 text-ink-900 font-semibold'
                      : 'bg-white/10 text-slate-200 hover:bg-white/15',
                  ].join(' ')}
                >
                  <span className="mr-1" aria-hidden>{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="surface-muted p-4">
            <p className="text-sm font-semibold text-slate-200">
              If the urge is strong or keeps coming back, real help is free and 24/7:
            </p>
            <ul className="mt-3 space-y-2">
              {SUPPORT_RESOURCES.map((r) => (
                <li key={r.id} className="text-sm">
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand-300 hover:underline"
                  >
                    {r.cta}
                  </a>
                  <span className="text-slate-400"> — {r.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={finish}>Save reflection &amp; close</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
