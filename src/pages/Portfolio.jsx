import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import StatTile from '../components/ui/StatTile.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useApp } from '../context/AppContext.jsx'
import {
  formatPoints,
  formatDate,
  formatProbability,
  potentialPayout,
  isMarketClosed,
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

  // Markets whose close date has passed are "ready to settle".
  const closedMarketIds = Object.keys(openByMarket).filter((id) => {
    const m = getMarketById(id)
    return m && isMarketClosed(m.closeDate)
  })

  function settleAllClosed() {
    closedMarketIds.forEach(settleMarket)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Play points"
        title="Portfolio"
        subtitle="Your open predictions and settled history — every figure is play points, never cash."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Open bets" value={openPositions.length} icon="portfolio" animate />
        <StatTile
          label="At stake"
          value={pointsAtStake}
          sub="points in play"
          icon="clock"
          animate
          format={(n) => `${formatPoints(n)} pts`}
        />
        <StatTile label="Settled" value={settledPositions.length} icon="check" animate />
        <StatTile label="Total bets" value={positions.length} icon="insights" animate />
      </div>

      {/* Open positions ----------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-100">Open positions</h2>
          {closedMarketIds.length > 0 && (
            <Button size="sm" onClick={settleAllClosed}>
              Settle all closed ({closedMarketIds.length})
            </Button>
          )}
        </div>

        {openPositions.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon="portfolio"
              title="No open positions yet"
              body="Place a play-points prediction and it’ll show up here, ready to settle."
              action={
                <Link to="/markets">
                  <Button size="sm" variant="outline">
                    Browse markets
                  </Button>
                </Link>
              }
            />
          </Card>
        ) : (
          Object.entries(openByMarket).map(([marketId, group]) => {
            const isClosed = closedMarketIds.includes(marketId)
            return (
              <Card key={marketId} variant="interactive" className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100">{group[0].question}</p>
                    {isClosed && (
                      <span className="mt-1 inline-block">
                        <Badge tone="warn">Closed · ready to settle</Badge>
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isClosed ? 'primary' : 'outline'}
                    onClick={() => settleMarket(marketId)}
                  >
                    {isClosed ? 'Settle result' : 'Simulate result'}
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
                        <p className="font-semibold tabular-nums text-slate-100">
                          {formatPoints(pos.stake)} pts
                        </p>
                        <p className="text-xs tabular-nums text-slate-400">
                          → {formatPoints(potentialPayout(pos.stake, pos.price))} if it hits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })
        )}
      </section>

      {/* Settled history ---------------------------------------------------- */}
      {settledPositions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100">Settled history</h2>
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 text-left font-medium">Market</th>
                    <th className="px-3 py-3 text-left font-medium">Pick</th>
                    <th className="px-3 py-3 text-right font-medium">Stake</th>
                    <th className="px-5 py-3 text-right font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {settledPositions.map((pos) => {
                    const won = pos.status === 'won'
                    return (
                      <tr key={pos.id} className="transition-colors hover:bg-white/[0.03]">
                        <td className="max-w-0 px-5 py-3">
                          <p className="truncate text-slate-200">{pos.question}</p>
                          <p className="text-xs text-slate-500">{formatDate(pos.placedAt)}</p>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-slate-300">{pos.outcomeLabel}</span>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-400">
                          {formatPoints(pos.stake)} pts
                        </td>
                        {/* Net profit/loss vs. the stake — symmetric so wins
                            aren't overstated by showing gross payout. */}
                        <td className="px-5 py-3 text-right">
                          {won ? (
                            <span className="font-semibold tabular-nums text-emerald-300">
                              +{formatPoints(Math.max(0, pos.payout - pos.stake))} pts
                            </span>
                          ) : (
                            <span className="font-semibold tabular-nums text-rose-300">
                              −{formatPoints(pos.stake)} pts
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  )
}
