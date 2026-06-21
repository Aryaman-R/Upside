import { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Avatar from '../ui/Avatar.jsx'
import AnimatedNumber from '../ui/AnimatedNumber.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { MARKETS } from '../../data/markets.js'
import { formatPoints, formatCents, marketStatus } from '../../lib/format.js'

const QUICK_STAKES = [100, 250, 500, 1000]

// Stake play points on a head-to-head pick against a friend. The friend
// "matches" your stake; the winner takes the 2× pot. Pure play points.
export default function ChallengeModal({ open, onClose, friend }) {
  const { points, dispatch, cooloffActive, stakeRemaining } = useApp()
  const openMarkets = useMemo(() => MARKETS.filter((m) => marketStatus(m.closeDate) !== 'closed'), [])

  const [marketId, setMarketId] = useState(openMarkets[0]?.id ?? '')
  const [outcomeId, setOutcomeId] = useState('')
  const [stake, setStake] = useState('')
  const [placed, setPlaced] = useState(false)

  useEffect(() => {
    if (open) {
      setMarketId(openMarkets[0]?.id ?? '')
      setOutcomeId('')
      setStake('')
      setPlaced(false)
    }
  }, [open, openMarkets])

  if (!friend) return null

  const market = openMarkets.find((m) => m.id === marketId)
  const outcome = market?.outcomes.find((o) => o.id === outcomeId)
  // Points are whole — floor any typed value so the balance never drifts.
  const numericStake = Math.floor(Number(stake) || 0)
  const tooMuch = numericStake > points
  const overLimit = numericStake > stakeRemaining
  const valid = market && outcome && numericStake > 0 && !tooMuch && !cooloffActive && !overLimit
  const maxStake = Math.max(0, Math.min(points, stakeRemaining))

  function confirm() {
    if (!valid) return
    dispatch({
      type: 'CREATE_CHALLENGE',
      payload: {
        friend,
        marketId: market.id,
        question: market.question,
        outcomeId: outcome.id,
        outcomeLabel: outcome.label,
        stake: numericStake,
        price: outcome.price,
      },
    })
    setPlaced(true)
  }

  return (
    <Modal open={open} onClose={onClose} title={`Challenge ${friend.name}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 surface-muted p-3">
          <Avatar emoji={friend.avatar} size="md" />
          <div className="text-sm">
            <p className="font-semibold text-slate-100">{friend.name}</p>
            <p className="text-xs text-slate-500">Winner takes the matched pot · play points only</p>
          </div>
        </div>

        {cooloffActive && !placed && (
          <div className="rounded-lg border border-amber-400/25 bg-amber-500/[0.08] p-3 text-center text-sm text-amber-200">
            You’re on a self-imposed break — challenges are paused. End it in Settings.
          </div>
        )}

        {placed ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-500/30 bg-brand-500/[0.08] p-4 text-center text-brand-200">
              Challenge sent to {friend.name}: <strong>{formatPoints(numericStake)}</strong> pts on{' '}
              <strong>{outcome.label}</strong>. Settle it from the Friends page.
            </div>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">Market</label>
              <select
                value={marketId}
                onChange={(e) => {
                  setMarketId(e.target.value)
                  setOutcomeId('')
                }}
                className="input text-sm"
              >
                {openMarkets.map((m) => (
                  <option key={m.id} value={m.id}>{m.question}</option>
                ))}
              </select>
            </div>

            {market && (
              <div>
                <p className="mb-1 text-sm font-medium text-slate-200">Your pick</p>
                <div className="grid gap-2" style={{ gridTemplateColumns: market.outcomes.length === 2 ? '1fr 1fr' : '1fr' }}>
                  {market.outcomes.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setOutcomeId(o.id)}
                      className={[
                        'flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
                        outcomeId === o.id
                          ? 'border-brand-400 bg-brand-500/[0.12] text-brand-200'
                          : 'border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]',
                      ].join(' ')}
                    >
                      <span className="truncate font-medium">{o.label}</span>
                      <span className="tabular-nums text-slate-400">{formatCents(o.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200">Your stake (points)</label>
                <span className="text-xs text-slate-500">Balance: {formatPoints(points)}</span>
              </div>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="Points to put up"
                className="input"
              />
              {tooMuch && <p className="mt-1 text-xs text-rose-300">You only have {formatPoints(points)} points.</p>}
              {!tooMuch && overLimit && Number.isFinite(stakeRemaining) && (
                <p className="mt-1 text-xs text-amber-300">
                  That exceeds your daily limit — {formatPoints(Math.max(0, stakeRemaining))} pts left today.
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_STAKES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setStake(String(q))}
                    disabled={q > maxStake}
                    className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-sm text-slate-200 transition-transform hover:bg-white/[0.1] hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {formatPoints(q)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-ink-900 px-4 py-3 ring-1 ring-inset ring-brand-500/15">
              <span className="text-sm text-slate-400">Pot if you win</span>
              <span className="flex items-baseline gap-1.5">
                <AnimatedNumber
                  value={numericStake * 2}
                  format={formatPoints}
                  className="font-display text-xl font-bold text-brand-300"
                />
                <span className="text-xs text-slate-500">pts</span>
              </span>
            </div>

            <Button className="w-full" onClick={confirm} disabled={!valid}>
              Send challenge
            </Button>
            <p className="text-center text-[11px] text-slate-500">Play points only. No real money or wagering.</p>
          </>
        )}
      </div>
    </Modal>
  )
}
