// Compact KPI tile: an icon chip, a label, a big value, and an optional sub-line.
// `icon` is an Icon name (see ui/Icon.jsx), not an emoji.
//
// Optional polish:
//   tone     — 'default' | 'brand' | 'positive' | 'negative' colors the value + chip
//   animate  — when the value is numeric, count it up via AnimatedNumber
//   format   — formatter used with animate (e.g. formatUSD / formatPoints)
//   delta    — { value: '+$12', dir: 'up' | 'down' } small change pill
import Icon from './Icon.jsx'
import AnimatedNumber from './AnimatedNumber.jsx'

const VALUE_TONES = {
  default: 'text-slate-50',
  brand: 'text-brand-200',
  positive: 'text-emerald-300',
  negative: 'text-rose-300',
}
const CHIP_TONES = {
  default: 'bg-white/[0.05] text-slate-400',
  brand: 'bg-brand-500/12 text-brand-300',
  positive: 'bg-emerald-500/12 text-emerald-300',
  negative: 'bg-rose-500/12 text-rose-300',
}

export default function StatTile({
  label,
  value,
  sub,
  icon,
  accent = false,
  tone = 'default',
  animate = false,
  format,
  delta,
  className = '',
}) {
  const valueTone = VALUE_TONES[tone] || VALUE_TONES.default
  const chipTone = CHIP_TONES[tone] || CHIP_TONES.default
  const numeric = typeof value === 'number'

  return (
    <div
      className={[
        'group surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.1]',
        accent ? 'ring-1 ring-brand-500/30 bg-gradient-to-br from-brand-700/[0.08] to-ink-850' : '',
        className,
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon ? (
            <span className={['flex h-7 w-7 items-center justify-center rounded-lg', chipTone].join(' ')}>
              <Icon name={icon} size={15} />
            </span>
          ) : null}
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
        </div>
        {delta ? (
          <span
            className={[
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
              delta.dir === 'down' ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300',
            ].join(' ')}
          >
            <Icon name={delta.dir === 'down' ? 'trendingDown' : 'trendingUp'} size={11} strokeWidth={2.5} />
            {delta.value}
          </span>
        ) : null}
      </div>
      {animate && numeric ? (
        <AnimatedNumber
          value={value}
          format={format}
          className={['mt-3 block text-[28px] font-bold leading-none', valueTone].join(' ')}
        />
      ) : (
        <p className={['mt-3 text-[28px] font-bold leading-none tabular-nums', valueTone].join(' ')}>{value}</p>
      )}
      {sub ? <p className="mt-1.5 text-xs text-slate-500">{sub}</p> : null}
    </div>
  )
}
