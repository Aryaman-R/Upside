import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import {
  FUNDING_INSTITUTIONS,
  DESTINATION_TYPES,
  destinationType,
  maskFrom,
} from '../../data/accounts.js'

// A SIMULATED account-connection flow. This never reaches a real institution
// and never asks for credentials — picking a provider runs a short fake
// "Connecting…" animation and stores a name + masked number so the demo looks
// real. Handles two modes:
//   mode="funding"      → link a bank/debit source (CONNECT_FUNDING)
//   mode="destination"  → link a Roth IRA / savings account (CONNECT_DESTINATION)
export default function ConnectAccountModal({ open, onClose, mode = 'destination', presetKind = null }) {
  const { dispatch } = useApp()
  // phase: 'pick-type' | 'pick-provider' | 'connecting' | 'done'
  const [phase, setPhase] = useState('pick-provider')
  const [kind, setKind] = useState(presetKind)
  const [provider, setProvider] = useState(null)

  // Reset the flow each time the modal (re)opens.
  useEffect(() => {
    if (!open) return
    if (mode === 'funding') {
      setKind(null)
      setPhase('pick-provider')
    } else {
      setKind(presetKind)
      setPhase(presetKind ? 'pick-provider' : 'pick-type')
    }
    setProvider(null)
  }, [open, mode, presetKind])

  // Run the fake connect: a brief spinner, then commit to state.
  useEffect(() => {
    if (phase !== 'connecting' || !provider) return undefined
    const t = setTimeout(() => {
      const mask = maskFrom(provider.id + (kind || 'bank'))
      if (mode === 'funding') {
        dispatch({ type: 'CONNECT_FUNDING', payload: { institution: provider.name, mask } })
      } else {
        dispatch({ type: 'CONNECT_DESTINATION', payload: { kind, institution: provider.name, mask } })
      }
      setPhase('done')
    }, 1500)
    return () => clearTimeout(t)
  }, [phase, provider, kind, mode, dispatch])

  const type = mode === 'destination' ? destinationType(kind) : null
  const providers = mode === 'funding' ? FUNDING_INSTITUTIONS : type?.providers || []
  const title =
    mode === 'funding'
      ? 'Connect a funding source'
      : type
        ? `Connect your ${type.label}`
        : 'Where should losses go?'

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-lg">
      {/* Simulation disclaimer — always visible, never buried. */}
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-white/[0.04] p-2.5 text-xs text-slate-400">
        <Icon name="shield" size={14} className="shrink-0 text-brand-300/80" />
        Demo only — no real account is connected and no login is ever requested.
      </div>

      {/* Step 1 (destination): choose the account type ---------------------- */}
      {phase === 'pick-type' && (
        <div className="space-y-2 animate-fade-in">
          <p className="mb-1 text-sm text-slate-400">
            When a prediction loses, the money lands here instead of disappearing. Pick a home for it.
          </p>
          {DESTINATION_TYPES.map((t) => (
            <button
              key={t.kind}
              onClick={() => {
                setKind(t.kind)
                setPhase('pick-provider')
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-brand-400/50 hover:bg-brand-500/[0.06]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/12 text-brand-300">
                <Icon name={t.icon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100">{t.label}</span>
                  {t.recommended && (
                    <span className="rounded-full bg-brand-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-300">
                      Recommended
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-slate-400">{t.blurb}</span>
              </span>
              <Icon name="chevronRight" size={16} className="shrink-0 text-slate-500" />
            </button>
          ))}
        </div>
      )}

      {/* Step 2: choose the provider --------------------------------------- */}
      {phase === 'pick-provider' && (
        <div className="space-y-2 animate-fade-in">
          <p className="mb-1 text-sm text-slate-400">
            {mode === 'funding'
              ? 'Choose your bank to fund your Upside balance.'
              : `Choose where your ${type?.label} lives.`}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p)
                  setPhase('connecting')
                }}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-brand-400/50 hover:bg-brand-500/[0.06]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-base">
                  {p.logo || <Icon name="building" size={16} className="text-slate-300" />}
                </span>
                <span className="truncate text-sm font-medium text-slate-100">{p.name}</span>
              </button>
            ))}
          </div>
          {mode === 'destination' && !presetKind && (
            <button
              onClick={() => setPhase('pick-type')}
              className="mt-1 text-xs text-slate-400 hover:text-slate-200"
            >
              ← Pick a different account type
            </button>
          )}
        </div>
      )}

      {/* Step 3: simulated connecting -------------------------------------- */}
      {phase === 'connecting' && (
        <div className="flex flex-col items-center gap-4 py-8 text-center animate-fade-in">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/25">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-400/30 border-t-brand-300" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-100">Securely connecting to {provider?.name}…</p>
            <p className="mt-1 text-xs text-slate-500">Simulated — no real handshake is happening.</p>
          </div>
        </div>
      )}

      {/* Step 4: done ------------------------------------------------------ */}
      {phase === 'done' && (
        <div className="space-y-4 animate-pop text-center">
          <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-6">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25">
              <Icon name="check" size={26} strokeWidth={2.5} />
            </span>
            <p className="font-semibold text-brand-100">
              {provider?.name} connected
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {mode === 'funding'
                ? 'You can now fund your Upside balance.'
                : `Redirected losses can now flow into your ${type?.label}. 💚`}
            </p>
          </div>
          <Button fullWidth onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  )
}
