import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import Sparkline from '../ui/Sparkline.jsx'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import {
  formatPoints,
  formatProbability,
  formatCents,
  daysUntil,
  marketStatus,
} from '../../lib/format.js'
import { priceHistory, priceTrend, marketTraders } from '../../data/markets.js'

// One market in the markets grid, styled after prediction-market products
// (Polymarket/Kalshi): an implied-probability bar, a price sparkline, cents-style
// odds, and a 7-day trend — all on PLAY points. Clicking an outcome opens the
// bet flow via the `onPick(market, outcome)` callback supplied by the page.
export default function MarketCard({ market, onPick }) {
  const { isMarketResolved, resolvedMarkets, cooloffActive } = useApp()
  const resolved = isMarketResolved(market.id)
  const winningId = resolvedMarkets[market.id]
  const status = marketStatus(market.closeDate)
  const closed = status === 'closed'
  const locked = resolved || closed || cooloffActive // no new bets

  const binary = market.outcomes.length === 2
  const trend = priceTrend(market)
  const history = priceHistory(market)

  const statusLabel = resolved ? 'Settled' : closed ? 'Betting closed' : cooloffActive ? 'On a break' : null

  return (
    <Card variant={locked ? 'flat' : 'interactive'} className="flex h-full flex-col gap-4">
      {/* Top row: category + lifecycle status (kept full strength even when locked) */}
      <div className="flex items-start justify-between gap-3">
        <Badge tone="neutral">{market.category}</Badge>
        {resolved ? (
          <Badge tone="neutral">Resolved</Badge>
        ) : status === 'closing-soon' ? (
          <Badge tone="warn">{daysUntil(market.closeDate)}</Badge>
        ) : closed ? (
          <Badge tone="neutral">Closed</Badge>
        ) : (
          <span className="text-xs text-slate-400">{daysUntil(market.closeDate)}</span>
        )}
      </div>

      <h3 className="text-base font-semibold leading-snug text-slate-50">{market.question}</h3>

      {/* Data region — dimmed when no new bets can be placed, but never hidden. */}
      <div className={['flex flex-1 flex-col gap-4', locked ? 'opacity-60' : ''].join(' ')}>
        {/* Binary markets get the headline probability + sparkline treatment. */}
        {binary && (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tabular-nums text-slate-50">
                  {formatProbability(market.outcomes[0].price)}
                </span>
                <span className="text-xs text-slate-400">{market.outcomes[0].label}</span>
              </div>
              <TrendLabel trend={trend} />
            </div>
            <Sparkline
              data={history}
              tone={trend >= 0 ? 'brand' : 'rose'}
              width={104}
              height={40}
              className="shrink-0"
            />
          </div>
        )}

        {/* Implied-probability split bar (binary only) with a faint 50% tick. */}
        {binary && (
          <div
            className="relative flex h-2.5 overflow-hidden rounded-full bg-rose-500/20"
            aria-hidden
            title={`${formatProbability(market.outcomes[0].price)} ${market.outcomes[0].label}`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${market.outcomes[0].price * 100}%` }}
            />
            {/* 50% reference tick */}
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/20" />
          </div>
        )}

        {/* Outcome buttons */}
        <div
          className="mt-auto grid gap-2"
          style={{ gridTemplateColumns: binary ? '1fr 1fr' : '1fr' }}
        >
          {market.outcomes.map((o) => {
            const isWinner = resolved && o.id === winningId
            const isLoser = resolved && o.id !== winningId
            return (
              <button
                key={o.id}
                disabled={locked}
                onClick={() => onPick(market, o)}
                className={[
                  'flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors disabled:cursor-not-allowed',
                  isWinner
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : isLoser
                      ? 'border-rose-500/20 bg-rose-500/[0.06] text-rose-300/70'
                      : closed || locked
                        ? 'border-white/5 bg-white/5 text-slate-400'
                        : 'border-white/10 bg-white/5 text-slate-100 hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-brand-100',
                ].join(' ')}
              >
                <span className="truncate font-medium">
                  {o.label}
                  {isWinner && ' ✓'}
                  {isLoser && ' ✕'}
                </span>
                <span className="shrink-0 tabular-nums font-bold text-slate-300">
                  {formatCents(o.price)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer: liquidity / social proof */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Icon name="trendingUp" size={13} className="text-slate-500" />
            <span className="tabular-nums">{formatPoints(market.volume)}</span> vol
          </span>
          <span className="flex items-center gap-1">
            <Icon name="users" size={13} className="text-slate-500" />
            <span className="tabular-nums">{formatPoints(marketTraders(market))}</span> traders
          </span>
        </div>
        {!locked && <span className="text-slate-400">Tap to bet</span>}
      </div>

      {/* Calm status strip for locked markets instead of bright disabled buttons. */}
      {locked && statusLabel && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
          <Icon name="lock" size={13} className="text-slate-500" />
          {statusLabel}
        </div>
      )}
    </Card>
  )
}

// Small signed 7-day trend label with a directional arrow.
function TrendLabel({ trend }) {
  if (trend === 0) {
    return <p className="text-xs text-slate-500">Flat over 7d</p>
  }
  const up = trend > 0
  return (
    <p className={['flex items-center gap-1 text-xs font-medium', up ? 'text-brand-300' : 'text-rose-300'].join(' ')}>
      <Icon name={up ? 'trendingUp' : 'trendingDown'} size={13} strokeWidth={2.5} />
      {Math.abs(trend)} pts · 7d
    </p>
  )
}
