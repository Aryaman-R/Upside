import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import StatTile from '../components/ui/StatTile.jsx'
import { useApp } from '../context/AppContext.jsx'
import {
  formatPoints,
  formatDate,
  formatProbability,
  potentialPayout,
} from '../lib/format.js'
import { getMarketById } from '../data/markets.js'

// Pick a winning outcome for a market, weighted by each outcome's price
// (implied probability). This is the "mock resolution" — a stand-in for a real
// event settling. Runs in the browser, so Math.random is fine here.
function simulateOutcome(market) {
  const roll = Math.random()
  let cumulative = 0
  for (const o of market.outcomes) {
    cumulative += o.price
    if (roll <= cumulative) return o.id
  }
  return market.outcomes[market.outcomes.length - 1].id
}

export default function Portfolio() {
  const { positions, openPositions, settledPositions, pointsAtStake, dispatch } = useApp()

  // Group OPEN positions by market so a single "settle" resolves them together.
  const openByMarket = useMemo(() => {
    const groups = {}
    for (const pos of openPositions) {
      ;(groups[pos.marketId] ||= []).push(pos)
    }
    return groups
  }, [openPositions])

  function settleMarket(marketId) {
    const market = getMarketById(marketId)
    if (!market) return
    dispatch({
      type: 'RESOLVE_MARKET',
      payload: { marketId, winningOutcomeId: simulateOutcome(market) },
    })
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-50">Portfolio</h1>
        <p className="text-sm text-slate-400">
          Your open predictions and settled history — all in play points.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Open bets" value={openPositions.length} icon="🎟️" />
        <StatTile label="At stake" value={`${formatPoints(pointsAtStake)} pts`} icon="⏳" />
        <StatTile label="Settled" value={settledPositions.length} icon="📜" />
        <StatTile
          label="Total bets"
          value={positions.length}
          icon="📊"
        />
      </div>

      {/* Open positions ----------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100">Open positions</h2>

        {openPositions.length === 0 ? (
          <Card className="text-center">
            <p className="text-slate-300">No open positions yet.</p>
            <Link to="/markets" className="mt-2 inline-block text-brand-300 hover:underline">
              Browse markets →
            </Link>
          </Card>
        ) : (
          Object.entries(openByMarket).map(([marketId, group]) => (
            <Card key={marketId} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-100">{group[0].question}</p>
                <Button size="sm" variant="outline" onClick={() => settleMarket(marketId)}>
                  Simulate result
                </Button>
              </div>
              <div className="space-y-2">
                {group.map((pos) => (
                  <div
                    key={pos.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge tone="open">{pos.outcomeLabel}</Badge>
                      <span className="text-slate-400">
                        {formatProbability(pos.price)} · {formatDate(pos.placedAt)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-100">
                        {formatPoints(pos.stake)} pts
                      </p>
                      <p className="text-xs text-slate-400">
                        → {formatPoints(potentialPayout(pos.stake, pos.price))} if it hits
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </section>

      {/* Settled history ---------------------------------------------------- */}
      {settledPositions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100">Settled history</h2>
          <Card className="divide-y divide-white/5 p-0">
            {settledPositions.map((pos) => (
              <div key={pos.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{pos.question}</p>
                  <p className="text-xs text-slate-500">
                    {pos.outcomeLabel} · staked {formatPoints(pos.stake)} pts ·{' '}
                    {formatDate(pos.placedAt)}
                  </p>
                </div>
                {pos.status === 'won' ? (
                  <Badge tone="win">+{formatPoints(pos.payout)} pts</Badge>
                ) : (
                  <Badge tone="loss">−{formatPoints(pos.stake)} pts</Badge>
                )}
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  )
}
