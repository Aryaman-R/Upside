import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import {
  formatUSD,
  formatProbability,
  payoutDollars,
  profitDollars,
  priceToMultiplier,
  lossSplit,
  accountKindLabel,
  daysUntil,
  marketStatus,
} from '../../lib/format.js'

// Quick-stake chips in dollars — betting is one tap, like the apps this replaces.
const QUICK_STAKES = [10, 25, 50, 100]

// The signature reassurance: with Upside, a losing stake isn't gone — it's
// invested. Either outcome keeps the money yours.
function CantLoseChip({ destLabel }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/[0.06] px-3 py-1 text-xs text-brand-200/90">
      <Icon name="shield" size={13} className="text-brand-300/80" />
      Win it or invest it in your {destLabel} — either way it stays yours
    </span>
  )
}

export default function BetModal({ open, onClose, market, outcome }) {
  const { balance, defaultDest, dispatch, cooloffActive, stakeRemaining } = useApp()
  const [stake, setStake] = useState('')
  const [placed, setPlaced] = useState(false)

  useEffect(() => {
    if (open) {
      setStake('')
      setPlaced(false)
    }
  }, [open, outcome])

  if (!market || !outcome) return null

  const status = marketStatus(market.closeDate)
  const closed = status === 'closed'
  const numericStake = Number(stake) || 0
  const tooMuch = numericStake > balance
  const overLimit = numericStake > stakeRemaining
  const valid = numericStake > 0 && !tooMuch && !closed && !cooloffActive && !overLimit
  const payout = payoutDollars(numericStake, outcome.price)
  const profit = profitDollars(numericStake, outcome.price)
  const { routed, fee } = lossSplit(numericStake)
  const destLabel = defaultDest ? accountKindLabel(defaultDest.kind) : 'savings'
  // The most a single bet may stake right now (balance, capped by any daily limit).
  const maxStake = Math.max(0, Math.min(balance, stakeRemaining))

  function placeBet() {
    if (!valid) return
    dispatch({
      type: 'PLACE_BET',
      payload: {
        marketId: market.id,
        outcomeId: outcome.id,
        outcomeLabel: outcome.label,
        question: market.question,
        stake: numericStake,
        price: outcome.price,
      },
    })
    setPlaced(true)
  }

  return (
    <Modal open={open} onClose={onClose} title="Make a prediction">
      <div className="space-y-4">
        <div className="surface-muted p-4">
          <p className="text-sm text-slate-300">{market.question}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{outcome.label}</Badge>
            <span className="text-xs text-slate-400">{formatProbability(outcome.price)} implied</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">{priceToMultiplier(outcome.price).toFixed(2)}x</span>
          </div>
          {status === 'closing-soon' && !closed && (
            <p className="mt-2 text-xs text-amber-300">⏳ {daysUntil(market.closeDate)} — get in before it locks.</p>
          )}
        </div>

        {closed && (
          <div className="rounded-lg bg-white/5 p-3 text-center text-sm text-slate-400">
            This market has closed and is no longer accepting predictions.
          </div>
        )}

        {cooloffActive && !closed && (
          <div className="rounded-lg border border-amber-400/25 bg-amber-500/[0.08] p-3 text-center text-sm text-amber-200">
            You’re on a self-imposed break — predicting is paused. You can end it early in Settings.
          </div>
        )}

        {placed ? (
          <div className="animate-pop space-y-4">
            <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-5 text-center">
              <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25">
                <Icon name="check" size={22} strokeWidth={2.5} />
              </span>
              <p className="text-brand-100">
                Prediction placed: <strong className="tabular-nums">{formatUSD(numericStake)}</strong> on{' '}
                <strong>{outcome.label}</strong>.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Win → <span className="font-semibold text-emerald-300">{formatUSD(payout)}</span> back. Lose →{' '}
                <span className="font-semibold text-brand-300">{formatUSD(routed)}</span> into your {destLabel}.
              </p>
            </div>
            <div className="flex justify-center">
              <CantLoseChip destLabel={destLabel} />
            </div>
            <div className="space-y-2">
              <Link
                to="/portfolio"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow-sm transition-all duration-150 ease-out hover:-translate-y-px hover:bg-brand-400 active:translate-y-0"
              >
                <Icon name="portfolio" size={16} />
                Track it in your Portfolio
              </Link>
              <Button variant="ghost" fullWidth onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200">Stake</label>
                <span className="text-xs text-slate-400">Balance: {formatUSD(balance)}</span>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="decimal"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  placeholder="Enter an amount"
                  className="input pl-7"
                />
              </div>
              {tooMuch && (
                <p className="mt-1 text-xs text-rose-300">
                  Your balance is {formatUSD(balance)}. <Link to="/connect" className="underline">Add funds</Link>.
                </p>
              )}
              {!tooMuch && overLimit && (
                <p className="mt-1 text-xs text-amber-300">
                  Daily stake limit reached — {formatUSD(Math.max(0, stakeRemaining))} left today.
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_STAKES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setStake(String(q))}
                    disabled={q > maxStake}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/15 disabled:opacity-40"
                  >
                    {formatUSD(q)}
                  </button>
                ))}
                <button
                  onClick={() => setStake(String(maxStake))}
                  disabled={maxStake <= 0}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/15 disabled:opacity-40"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Both-outcomes receipt — the heart of "you can't really lose". */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-3">
                <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <Icon name="trendingUp" size={13} /> If you win
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-emerald-200">{formatUSD(payout)}</p>
                <p className="text-xs text-slate-500">+{formatUSD(profit)} to balance</p>
              </div>
              <div className="rounded-xl border border-brand-500/20 bg-brand-500/[0.06] px-3 py-3">
                <p className="flex items-center gap-1.5 text-xs text-brand-300">
                  <Icon name="savings" size={13} /> If you lose
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-brand-200">{formatUSD(routed)}</p>
                <p className="text-xs text-slate-500">to your {destLabel} · {formatUSD(fee)} fee</p>
              </div>
            </div>

            <Button fullWidth onClick={placeBet} disabled={!valid}>
              Place prediction
            </Button>
            <div className="flex justify-center">
              <CantLoseChip destLabel={destLabel} />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
