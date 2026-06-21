import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import { useApp } from '../../context/AppContext.jsx'
import {
  formatPoints,
  formatProbability,
  potentialPayout,
  priceToMultiplier,
  daysUntil,
  marketStatus,
} from '../../lib/format.js'

// Quick-stake chips so betting is one tap, like the apps this replaces — but
// the "currency" is always play points.
const QUICK_STAKES = [100, 250, 500, 1000]

export default function BetModal({ open, onClose, market, outcome }) {
  const { points, dispatch } = useApp()
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
  const tooMuch = numericStake > points
  const valid = numericStake > 0 && !tooMuch && !closed
  const payout = potentialPayout(numericStake, outcome.price)

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
    <Modal open={open} onClose={onClose} title="Place a play-money bet">
      <div className="space-y-4">
        <div className="surface-muted p-4">
          <p className="text-sm text-slate-300">{market.question}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge tone="brand">{outcome.label}</Badge>
            <span className="text-xs text-slate-400">
              {formatProbability(outcome.price)} implied ·{' '}
              {priceToMultiplier(outcome.price).toFixed(2)}x payout
            </span>
          </div>
          {status === 'closing-soon' && !closed && (
            <p className="mt-2 text-xs text-amber-300">⏳ {daysUntil(market.closeDate)} — get in before it locks.</p>
          )}
        </div>

        {closed && (
          <div className="rounded-lg bg-white/5 p-3 text-center text-sm text-slate-400">
            This market has closed and is no longer accepting bets.
          </div>
        )}

        {placed ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-center">
              <p className="text-brand-200">
                Bet placed: <strong>{formatPoints(numericStake)}</strong> points on{' '}
                <strong>{outcome.label}</strong>.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Potential return: {formatPoints(payout)} points. Track it in your Portfolio.
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-3 text-center text-xs text-amber-200">
              Reminder: these are points, not dollars. Nothing real is at stake. 🎮
            </div>
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200">Stake (points)</label>
                <span className="text-xs text-slate-400">
                  Balance: {formatPoints(points)}
                </span>
              </div>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="Enter points to stake"
                className="w-full rounded-xl border border-white/10 bg-ink-900/60 p-3 text-slate-100 placeholder:text-slate-500 focus:border-brand-400"
              />
              {tooMuch && (
                <p className="mt-1 text-xs text-rose-300">
                  You only have {formatPoints(points)} points.
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_STAKES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setStake(String(q))}
                    disabled={q > points}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/15 disabled:opacity-40"
                  >
                    {formatPoints(q)}
                  </button>
                ))}
                <button
                  onClick={() => setStake(String(points))}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/15"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-ink-900/60 px-4 py-3">
              <span className="text-sm text-slate-400">Potential payout</span>
              <span className="text-lg font-bold text-brand-300">
                {formatPoints(payout)} pts
              </span>
            </div>

            <Button className="w-full" onClick={placeBet} disabled={!valid}>
              Confirm play-money bet
            </Button>
            <p className="text-center text-[11px] text-slate-500">
              No real money is involved. Points have no cash value.
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
