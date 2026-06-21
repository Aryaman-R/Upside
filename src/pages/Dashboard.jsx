import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import StatTile from '../components/ui/StatTile.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Icon from '../components/ui/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { MOCK_PLAYERS } from '../data/leaderboard.js'
import {
  formatPoints,
  formatUSD,
  formatProbability,
  potentialPayout,
} from '../lib/format.js'

export default function Dashboard() {
  const {
    user,
    points,
    streak,
    stats,
    winRate,
    openPositions,
    pointsAtStake,
    savings,
    savingsProgress,
    canClaimDaily,
    settings,
    dispatch,
  } = useApp()

  // Current standing vs. the mock field.
  const rank = useMemo(() => {
    const all = [...MOCK_PLAYERS.map((p) => p.points), points].sort((a, b) => b - a)
    return all.indexOf(points) + 1
  }, [points])

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="bg-gradient-to-br from-ink-700/80 to-ink-800/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Welcome back</p>
            <h1 className="text-2xl font-extrabold text-slate-50">
              {user.avatar} Hey, {user.name === 'You' ? 'there' : user.name}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Chase the forecast, not the loss. Bet play points on real events, and turn
              every real-money urge into money you actually keep.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/markets">
              <Button>Find a market</Button>
            </Link>
            <Link to="/money-kept">
              <Button variant="outline">View savings</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Daily allowance nudge */}
      {canClaimDaily && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-500/25 bg-brand-500/[0.06]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
              <Icon name="gift" size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Your daily {formatPoints(settings.dailyAllowance)} play points are ready.
              </p>
              <p className="text-xs text-slate-400">A fresh, self-paced allowance — claim it and play on.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => dispatch({ type: 'CLAIM_DAILY' })}>
            Claim {formatPoints(settings.dailyAllowance)} points
          </Button>
        </Card>
      )}

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Points balance"
          value={formatPoints(points)}
          sub={`${formatPoints(pointsAtStake)} pts at stake`}
          icon="coins"
        />
        <StatTile
          label="Money kept"
          value={formatUSD(savings.total)}
          sub={`Goal ${formatUSD(savings.goal)}`}
          icon="savings"
          accent
        />
        <StatTile
          label="Open positions"
          value={openPositions.length}
          sub={`${stats.wins}W · ${stats.losses}L all-time`}
          icon="portfolio"
        />
        <StatTile
          label="Standing"
          value={`#${rank}`}
          sub={`${streak}-day streak`}
          icon="trophy"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Savings progress */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Money Kept</h2>
            <Link to="/money-kept" className="text-sm text-brand-300 hover:underline">
              Details →
            </Link>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-brand-300">
              {formatUSD(savings.total)}
            </p>
            <p className="text-sm text-slate-400">
              saved instead of gambled across {savings.entries.length} redirects
            </p>
          </div>
          <ProgressBar value={savingsProgress} />
          <p className="text-xs text-slate-500">
            {Math.round(savingsProgress * 100)}% of your {formatUSD(savings.goal)} goal
          </p>
        </Card>

        {/* Open positions snapshot */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Open positions</h2>
            <Link to="/portfolio" className="text-sm text-brand-300 hover:underline">
              Portfolio →
            </Link>
          </div>
          {openPositions.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              <p>No open bets right now.</p>
              <Link to="/markets" className="mt-1 inline-block text-brand-300 hover:underline">
                Explore markets →
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {openPositions.slice(0, 4).map((pos) => (
                <li
                  key={pos.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-200">{pos.question}</p>
                    <p className="text-xs text-slate-500">
                      {pos.outcomeLabel} · {formatProbability(pos.price)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-100">
                      {formatPoints(pos.stake)} pts
                    </p>
                    <p className="text-xs text-brand-300">
                      →{formatPoints(potentialPayout(pos.stake, pos.price))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Reassurance / safety strip */}
      <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-400/20 bg-amber-500/[0.05]">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
            <Icon name="shield" size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-100">
              No real money is ever at risk here.
            </p>
            <p className="text-xs text-slate-400">
              Points are play-only. If gambling stops being fun, help is free & 24/7.
            </p>
          </div>
        </div>
        <Badge tone="warn">1-800-GAMBLER</Badge>
      </Card>

      <p className="text-center text-xs text-slate-500">
        Win rate on settled bets: {Math.round(winRate * 100)}% ·{' '}
        <Link to="/insights" className="text-brand-300 hover:underline">
          See your insights →
        </Link>
      </p>
    </div>
  )
}
