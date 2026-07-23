import { useMemo, useState } from 'react'
import MarketCard from '../components/markets/MarketCard.jsx'
import BetModal from '../components/markets/BetModal.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx'
import { Link } from 'react-router-dom'
import { MARKETS, MARKET_CATEGORIES } from '../data/markets.js'
import { useApp } from '../context/AppContext.jsx'
import { formatUSD, formatDateTime } from '../lib/format.js'

export default function Markets() {
  const { balance, cooloffActive, settings, dispatch, stakeRemaining } = useApp()
  const [category, setCategory] = useState('All')
  const [pick, setPick] = useState({ market: null, outcome: null })

  const visible = useMemo(() => {
    if (category === 'All') return MARKETS
    return MARKETS.filter((m) => m.category === category)
  }, [category])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Prediction markets"
        title="Markets"
        subtitle="Forecast real events. Win and it's yours; lose and it's invested — never gone."
        action={
          <div className="flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-2 shadow-glow-sm">
            <Icon name="coins" size={16} className="text-brand-300" />
            <span className="text-xs font-medium uppercase tracking-wide text-brand-300/80">Balance</span>
            <AnimatedNumber
              value={balance}
              format={formatUSD}
              as="span"
              className="text-sm font-bold text-brand-200"
            />
          </div>
        }
      />

      {/* Self-imposed break banner */}
      {cooloffActive && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-400/25 bg-amber-500/[0.07]">
          <div>
            <p className="text-sm font-semibold text-amber-200">You’re on a break — predicting is paused.</p>
            <p className="text-xs text-slate-400">
              Until {formatDateTime(settings.cooloffUntil)}. The pause tools and Invested stay open.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'END_COOLOFF' })}>
            End break early
          </Button>
        </Card>
      )}

      {/* Daily stake-limit progress */}
      {!cooloffActive && settings.dailyStakeLimit > 0 && (
        <p className="text-xs text-slate-500">
          Daily stake limit:{' '}
          {stakeRemaining > 0 ? (
            <>{formatUSD(stakeRemaining)} of {formatUSD(settings.dailyStakeLimit)} left today.</>
          ) : (
            <>reached for today — predicting resumes tomorrow. Adjust in <Link to="/settings" className="text-brand-300 hover:underline">Settings</Link>.</>
          )}
        </p>
      )}

      {/* Category filter — toggle-button group, single-line scroller on mobile */}
      <div
        role="group"
        aria-label="Filter markets by category"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {MARKET_CATEGORIES.map((c) => {
          const active = category === c
          return (
            <button
              key={c}
              aria-pressed={active}
              onClick={() => setCategory(c)}
              className={[
                'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-all duration-200',
                active
                  ? 'bg-brand-500 font-semibold text-ink-950 shadow-glow-sm'
                  : 'border border-white/10 bg-transparent text-slate-300 hover:border-brand-400/50 hover:bg-brand-500/[0.06] hover:text-brand-200',
              ].join(' ')}
            >
              {c}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon="markets"
            title={`No ${category} markets right now`}
            body="Nothing live in this category yet. Check back soon, or browse another category — new markets open all the time."
            action={
              <Button size="sm" variant="outline" onClick={() => setCategory('All')}>
                View all markets
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m, i) => (
            <Reveal key={m.id} delay={i * 60} className="h-full" {...(i === 0 ? { 'data-tour': 'markets-card' } : {})}>
              <MarketCard
                market={m}
                onPick={(market, outcome) => setPick({ market, outcome })}
              />
            </Reveal>
          ))}
        </div>
      )}

      <BetModal
        open={Boolean(pick.market)}
        market={pick.market}
        outcome={pick.outcome}
        onClose={() => setPick({ market: null, outcome: null })}
      />
    </div>
  )
}
