import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatUSD } from '../../lib/format.js'

const QUICK_AMOUNTS = [25, 50, 100, 250]

// A SIMULATED deposit from the connected funding source into the Upside balance.
// No money actually moves — it just credits the in-app balance for the demo.
export default function FundBalanceModal({ open, onClose }) {
  const { funding, balance, dispatch } = useApp()
  const [amount, setAmount] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount('')
      setDone(false)
    }
  }, [open])

  const value = Number(amount)
  const valid = Number.isFinite(value) && value > 0

  function fund() {
    if (!valid) return
    dispatch({ type: 'FUND_BALANCE', payload: { amount: value } })
    setDone(true)
  }

  return (
    <Modal open={open} onClose={onClose} title="Add funds to your balance" maxWidth="max-w-md">
      {done ? (
        <div className="space-y-4 animate-pop text-center">
          <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-6">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25">
              <Icon name="check" size={26} strokeWidth={2.5} />
            </span>
            <p className="font-semibold text-brand-100">Added {formatUSD(value)} to your balance</p>
            <p className="mt-1 text-sm text-slate-400">Balance is now {formatUSD(balance)}.</p>
          </div>
          <Button fullWidth onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] p-2.5 text-xs text-slate-400">
            <Icon name="shield" size={14} className="shrink-0 text-brand-300/80" />
            Demo only — no real transfer happens.
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-ink-900/60 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-slate-400">
              <Icon name="building" size={15} className="text-slate-500" />
              {funding?.connected ? `${funding.institution} ••${funding.mask}` : 'No bank connected'}
            </span>
            <span className="text-slate-500">Balance {formatUSD(balance)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className={[
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  Number(amount) === q
                    ? 'border-brand-400 bg-brand-500/15 text-brand-200'
                    : 'border-transparent bg-white/10 text-slate-200 hover:bg-white/15',
                ].join(' ')}
              >
                {formatUSD(q)}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              fund()
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                min="1"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                aria-label="Amount to add in dollars"
                className="input w-full pl-7"
              />
            </div>
            <Button type="submit" disabled={!valid || !funding?.connected}>
              Add funds
            </Button>
          </form>
          {!funding?.connected && (
            <p className="text-xs text-amber-300">Connect a funding source first.</p>
          )}
        </div>
      )}
    </Modal>
  )
}
