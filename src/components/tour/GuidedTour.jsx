import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { TOUR_STEPS } from '../../data/tour.js'

// Padding around the spotlighted element, in px.
const PAD = 8

// A dependency-free guided walkthrough. It navigates between routes, spotlights
// the element carrying the step's `data-tour` anchor with a single box-shadow
// cutout, and shows a card explaining each beat. Every step is skippable and the
// tour is offered (never forced) after onboarding. Replayable from Settings and
// via ?tour=1.
export default function GuidedTour() {
  const { tour, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const [rect, setRect] = useState(null) // spotlight target box, or null (centered)
  const cardRef = useRef(null)

  const active = tour?.status === 'active'
  const offering = tour?.status === 'offer'
  const step = active ? TOUR_STEPS[Math.min(tour.step, TOUR_STEPS.length - 1)] : null

  // ?tour=1 replays the walkthrough for an already-onboarded user.
  useEffect(() => {
    if (params.get('tour') === '1' && tour?.status !== 'active') {
      dispatch({ type: 'START_TOUR' })
      params.delete('tour')
      setParams(params, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  // Navigate to the step's route when it differs from where we are.
  useEffect(() => {
    if (active && step && step.route !== location.pathname) {
      navigate(step.route)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tour?.step])

  // Measure (and keep measuring) the spotlight target for the current step.
  useLayoutEffect(() => {
    if (!active || !step) return undefined
    let raf = 0
    const measure = () => {
      if (!step.anchor) {
        setRect(null)
        return
      }
      const el = document.querySelector(`[data-tour="${step.anchor}"]`)
      if (!el) {
        setRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    // Only measure once we're on the right route; give the DOM a couple of
    // frames to paint after a route change so the anchor exists and is laid out.
    const onRightRoute = step.route === location.pathname
    if (onRightRoute) {
      const el = step.anchor && document.querySelector(`[data-tour="${step.anchor}"]`)
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      raf = requestAnimationFrame(() => requestAnimationFrame(measure))
    }
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    const interval = setInterval(measure, 400) // catch late layout / animations
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(interval)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tour?.step, location.pathname])

  // Move focus to the card on each step so keyboard users follow along; Esc ends.
  useEffect(() => {
    if (!active) return undefined
    cardRef.current?.focus?.()
    const onKey = (e) => {
      if (e.key === 'Escape') dispatch({ type: 'END_TOUR', payload: { status: 'skipped' } })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, tour?.step, dispatch])

  if (!active && !offering) return null

  // ---- The one-time offer card (after onboarding) --------------------------
  if (offering) {
    return (
      <Overlay dim>
        <CenterCard>
          <Eyebrow>A quick tour</Eyebrow>
          <h2 className="mt-1 font-display text-2xl font-black tracking-display text-gradient-brand">
            Want the two-minute tour?
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            See how a funded balance and a connected Roth IRA turn every prediction into a win — even the losses.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button fullWidth onClick={() => dispatch({ type: 'START_TOUR' })}>
              Show me around
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => dispatch({ type: 'END_TOUR', payload: { status: 'skipped' } })}
            >
              I’ll find my own way
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">You can replay it anytime from Settings.</p>
        </CenterCard>
      </Overlay>
    )
  }

  // ---- Active step ---------------------------------------------------------
  const isFirst = tour.step === 0
  const isLast = tour.step === TOUR_STEPS.length - 1
  const next = () =>
    isLast
      ? dispatch({ type: 'END_TOUR', payload: { status: 'done' } })
      : dispatch({ type: 'SET_TOUR_STEP', payload: { step: tour.step + 1 } })
  const back = () => dispatch({ type: 'SET_TOUR_STEP', payload: { step: Math.max(0, tour.step - 1) } })
  const skip = () => dispatch({ type: 'END_TOUR', payload: { status: 'skipped' } })

  return (
    <>
      {/* Spotlight: a dim overlay with a hole cut around the target (or full dim). */}
      {rect ? (
        <div
          className="pointer-events-none fixed z-[60] rounded-xl ring-2 ring-brand-400/70 transition-all duration-300"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.82)',
          }}
          aria-hidden
        />
      ) : (
        <div className="fixed inset-0 z-[60] bg-ink-950/82" aria-hidden />
      )}

      {/* Step card — pinned to a screen corner so it never fights the spotlight. */}
      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-label={step.title}
        className="fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-md rounded-2xl border border-white/10 bg-ink-900/95 p-5 shadow-pop outline-none backdrop-blur-md md:inset-x-auto md:bottom-8 md:right-8 animate-pop"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {TOUR_STEPS.map((s, i) => (
              <span
                key={s.id}
                className={[
                  'h-1.5 rounded-full transition-all',
                  i === tour.step ? 'w-4 bg-brand-400' : 'w-1.5 bg-white/15',
                ].join(' ')}
              />
            ))}
          </div>
          <button onClick={skip} className="text-xs text-slate-500 hover:text-slate-300">
            Skip tour
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-50">{step.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">
            {tour.step + 1} / {TOUR_STEPS.length}
          </span>
          <div className="flex gap-2">
            {!isFirst && (
              <Button size="sm" variant="ghost" onClick={back}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={next}>
              {step.cta || (isLast ? 'Finish' : 'Next')}
              {!isLast && <Icon name="arrowRight" size={15} />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function Overlay({ children, dim }) {
  return (
    <div className={['fixed inset-0 z-[60] flex items-center justify-center p-4', dim ? 'bg-ink-950/82' : ''].join(' ')}>
      {children}
    </div>
  )
}

function CenterCard({ children }) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900/95 p-6 shadow-pop backdrop-blur-md animate-pop">
      {children}
    </div>
  )
}

function Eyebrow({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400/80">{children}</p>
}
