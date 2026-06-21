import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Icon from '../ui/Icon.jsx'
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

// A small, persistent reassurance chip that play points are never real money.
function PlayMoneyChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
      <Icon name="shield" size={13} className="text-brand-300/80" />
      Play points · no real money at stake
    </span>
  )
}

export default function BetModal({ open, onClose, market, outcome }) {
  const { points, dispatch, cooloffActive, stakeRemaining } = useApp()
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
  // Points are whole numbers — floor any typed value so the balance never drifts.
  const numericStake = Math.floor(Number(stake) || 0)
  const tooMuch = numericStake > points
  const overLimit = numericStake > stakeRemaining
  const valid = numericStake > 0 && !tooMuch && !closed && !cooloffActive && !overLimit
  const payout = potentialPayout(numericStake, outcome.price)
  // The most a single bet may stake right now (balance, capped by any daily limit).
  const maxStake = Math.max(0, Math.min(points, stakeRemaining))

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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{outcome.label}</Badge>
            <span className="text-xs text-slate-400">
              {formatProbability(outcome.price)} implied
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">
              {priceToMultiplier(outcome.price).toFixed(2)}x
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

        {cooloffActive && !closed && (
          <div className="rounded-lg border border-amber-400/25 bg-amber-500/[0.08] p-3 text-center text-sm text-amber-200">
            You’re on a self-imposed break — betting is paused. You can end it early in Settings.
          </div>
        )}

        {placed ? (
          <div className="animate-pop space-y-4">
            <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-5 text-center">
              <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25">
                <Icon name="check" size={22} strokeWidth={2.5} />
              </span>
              <p className="text-brand-100">
                Bet placed: <strong className="tabular-nums">{formatPoints(numericStake)}</strong> points on{' '}
                <strong>{outcome.label}</strong>.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                If this resolves your way, you’ll have{' '}
                <span className="tabular-nums font-semibold text-slate-200">{formatPoints(payout)}</span> points.
              </p>
            </div>
            <div className="flex justify-center">
              <PlayMoneyChip />
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
                <label className="text-sm font-medium text-slate-200">Stake (points)</label>
                <span className="text-xs text-slate-400">
                  Balance: {formatPoints(points)}
                </span>
              </div>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="Enter points to stake"
                className="input"
              />
              {tooMuch && (
                <p className="mt-1 text-xs text-rose-300">
                  You only have {formatPoints(points)} points.
                </p>
              )}
              {!tooMuch && overLimit && (
                <p className="mt-1 text-xs text-amber-300">
                  Daily stake limit reached — {formatPoints(Math.max(0, stakeRemaining))} pts left today.
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
                    {formatPoints(q)}
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

            {/* Calm receipt — not a jackpot. */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-ink-900/60 px-4 py-3">
              <span className="text-sm text-slate-400">If this resolves your way</span>
              <span className="tabular-nums font-semibold text-slate-100">
                {formatPoints(payout)} pts
              </span>
            </div>

            <Button fullWidth onClick={placeBet} disabled={!valid}>
              Confirm play-money bet
            </Button>
            <div className="flex justify-center">
              <PlayMoneyChip />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
