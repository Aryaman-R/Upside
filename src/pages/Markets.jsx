import { useMemo, useState } from 'react'
import MarketCard from '../components/markets/MarketCard.jsx'
import BetModal from '../components/markets/BetModal.jsx'
import Badge from '../components/ui/Badge.jsx'
import { MARKETS, MARKET_CATEGORIES } from '../data/markets.js'
import { useApp } from '../context/AppContext.jsx'
import { formatPoints } from '../lib/format.js'

export default function Markets() {
  const { points } = useApp()
  const [category, setCategory] = useState('All')
  const [pick, setPick] = useState({ market: null, outcome: null })

  const visible = useMemo(() => {
    if (category === 'All') return MARKETS
    return MARKETS.filter((m) => m.category === category)
  }, [category])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-50">Markets</h1>
          <p className="text-sm text-slate-400">
            Forecast real events with play points. No money, all of the thrill.
          </p>
        </div>
        <Badge tone="brand">Balance: {formatPoints(points)} pts</Badge>
      </header>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {MARKET_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={[
              'rounded-full px-3 py-1.5 text-sm transition-colors',
              category === c
                ? 'bg-brand-500 text-ink-900 font-semibold'
                : 'bg-white/10 text-slate-300 hover:bg-white/15',
            ].join(' ')}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((m) => (
          <MarketCard
            key={m.id}
            market={m}
            onPick={(market, outcome) => setPick({ market, outcome })}
          />
        ))}
      </div>

      <BetModal
        open={Boolean(pick.market)}
        market={pick.market}
        outcome={pick.outcome}
        onClose={() => setPick({ market: null, outcome: null })}
      />
    </div>
  )
}
