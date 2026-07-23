import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import StatTile from '../components/ui/StatTile.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Icon from '../components/ui/Icon.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useApp } from '../context/AppContext.jsx'
import { MOCK_PLAYERS } from '../data/leaderboard.js'
import {
  formatPoints,
  formatUSD,
  formatProbability,
  payoutDollars,
} from '../lib/format.js'

export default function Dashboard() {
  const {
    user,
    points,
    balance,
    streak,
    stats,
    winRate,
    openPositions,
    atStake,
    savings,
    savingsProgress,
    canClaimDaily,
    accountsConnected,
    settings,
    dispatch,
  } = useApp()

  // Current standing vs. the mock field (play-points leaderboard).
  const rank = useMemo(() => {
    const all = [...MOCK_PLAYERS.map((p) => p.points), points].sort((a, b) => b - a)
    return all.indexOf(points) + 1
  }, [points])

  const greet = user.name === 'You' ? null : user.name

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Reveal immediate>
        <section className="relative min-h-[260px] overflow-hidden rounded-2xl bg-mesh-brand p-7 ring-1 ring-white/[0.06] sm:p-9">
          {/* Soft brand (Upside Purple) radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl"
          />
          <div className="relative flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Avatar emoji={user.avatar} size="md" ring glow />
              {greet ? (
                <p className="eyebrow text-brand-300">Hey, {greet}</p>
              ) : (
                <p className="eyebrow text-brand-300">Welcome back</p>
              )}
            </div>
            <div>
              <h1 className="text-gradient font-display text-display-sm font-bold tracking-display md:text-display">
                Win it, or invest it.
                <br className="hidden sm:block" /> Never just lose it.
              </h1>
              <p className="mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
                Predict on real events with your funded balance. Win and it’s yours to keep — lose and
                your stake goes into your Roth IRA, not the house’s pocket.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/markets">
                <Button size="lg">Find a market</Button>
              </Link>
              <Link to="/money-kept">
                <Button size="lg" variant="outline">
                  View invested
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Connect-accounts nudge — the setup that powers the whole model. */}
      {!accountsConnected && (
        <Reveal delay={40}>
          <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-500/30 bg-brand-500/[0.07] shadow-glow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
                <Icon name="building" size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-100">Finish connecting your accounts.</p>
                <p className="text-xs text-slate-400">
                  Link a funding source and a Roth IRA so losses turn into savings. (Simulated — no real login.)
                </p>
              </div>
            </div>
            <Link to="/connect">
              <Button size="sm">Connect accounts</Button>
            </Link>
          </Card>
        </Reveal>
      )}

      {/* Daily allowance nudge (play points for friendly challenges) */}
      {canClaimDaily && (
        <Reveal delay={60}>
          <Card className="flex animate-pop flex-wrap items-center justify-between gap-3 border-brand-500/30 bg-brand-500/[0.07] shadow-glow-sm">
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
        </Reveal>
      )}

      {/* Key stats */}
      <Reveal delay={120}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Balance"
            value={balance}
            sub={`${formatUSD(atStake)} at stake`}
            icon="coins"
            animate
            format={formatUSD}
          />
          <StatTile
            label="Invested"
            value={savings.total}
            sub={`Goal ${formatUSD(savings.goal)}`}
            icon="savings"
            tone="brand"
            accent
            animate
            format={formatUSD}
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
      </Reveal>

      <Reveal delay={180}>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Invested progress — elevated */}
          <Card variant="glow" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">Invested</h2>
              <Link to="/money-kept" className="text-sm text-brand-300 hover:underline">
                Details →
              </Link>
            </div>
            <div>
              <AnimatedNumber
                value={savings.total}
                format={formatUSD}
                as="p"
                className="text-3xl font-extrabold text-brand-300 sm:text-4xl"
              />
              <p className="text-sm text-slate-400">
                invested from losses &amp; redirects across {savings.entries.length} moves
              </p>
            </div>
            <ProgressBar value={savingsProgress} tone="brand" glow />
            <p className="text-xs text-slate-500 tabular-nums">
              {Math.round(savingsProgress * 100)}% of your {formatUSD(savings.goal)} goal
            </p>
          </Card>

          {/* Open positions snapshot */}
          <Card variant="interactive" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">Open positions</h2>
              <Link to="/portfolio" className="text-sm text-brand-300 hover:underline">
                Portfolio →
              </Link>
            </div>
            {openPositions.length === 0 ? (
              <EmptyState
                icon="portfolio"
                title="No open predictions yet"
                body="Find a market you have a read on and make a prediction — win it, or invest it."
                action={
                  <Link to="/markets">
                    <Button size="sm">Explore markets</Button>
                  </Link>
                }
              />
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
                      <p className="text-sm font-semibold text-slate-100 tabular-nums">
                        {formatUSD(pos.stake)}
                      </p>
                      <p className="text-xs text-brand-300 tabular-nums">
                        →{formatUSD(payoutDollars(pos.stake, pos.price))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </Reveal>

      {/* Reassurance / safety strip */}
      <Reveal delay={240}>
        <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-400/30 bg-amber-500/[0.08]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
              <Icon name="shield" size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Built so a loss is never just a loss.
              </p>
              <p className="text-xs text-slate-300">
                This is a demo — funds are simulated. If the urge stops feeling like fun, help is free &amp; 24/7.
              </p>
            </div>
          </div>
          <a
            href="tel:1-800-426-2537"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
          >
            <Badge tone="warn">1-800-GAMBLER</Badge>
          </a>
        </Card>
      </Reveal>

      <p className="text-center text-xs text-slate-500">
        Win rate on settled bets: {Math.round(winRate * 100)}% ·{' '}
        <Link to="/insights" className="text-brand-300 hover:underline">
          See your insights →
        </Link>
      </p>
    </div>
  )
}
