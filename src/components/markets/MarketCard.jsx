import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { formatPoints, formatProbability, daysUntil } from '../../lib/format.js'

// One market in the markets grid. Clicking an outcome opens the bet flow via
// the `onPick(market, outcome)` callback supplied by the page.
export default function MarketCard({ market, onPick }) {
  const { isMarketResolved, resolvedMarkets } = useApp()
  const resolved = isMarketResolved(market.id)
  const winningId = resolvedMarkets[market.id]

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <Badge tone="neutral">{market.category}</Badge>
        <span className="text-xs text-slate-400">{daysUntil(market.closeDate)}</span>
      </div>

      <h3 className="text-base font-semibold leading-snug text-slate-50">
        {market.question}
      </h3>

      <div className="mt-auto space-y-2">
        {market.outcomes.map((o) => {
          const isWinner = resolved && o.id === winningId
          const isLoser = resolved && o.id !== winningId
          return (
            <button
              key={o.id}
              disabled={resolved}
              onClick={() => onPick(market, o)}
              className={[
                'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors',
                resolved
                  ? isWinner
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-white/5 bg-white/5 text-slate-500'
                  : 'border-white/10 bg-white/5 text-slate-100 hover:border-brand-400/50 hover:bg-brand-500/10',
              ].join(' ')}
            >
              <span className="font-medium">
                {o.label}
                {isWinner && ' ✓'}
                {isLoser && ' ✕'}
              </span>
              <span className="tabular-nums text-slate-300">
                {formatProbability(o.price)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{formatPoints(market.volume)} pts traded</span>
        {resolved ? (
          <Badge tone="neutral">Resolved</Badge>
        ) : (
          <span className="text-slate-400">Tap an outcome to bet</span>
        )}
      </div>
    </Card>
  )
}
