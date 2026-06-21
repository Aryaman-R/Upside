// Compact KPI tile: an icon chip, a label, a big value, and an optional sub-line.
// `icon` is an Icon name (see ui/Icon.jsx), not an emoji.
import Icon from './Icon.jsx'

export default function StatTile({ label, value, sub, icon, accent = false }) {
  return (
    <div
      className={[
        'surface p-4',
        accent ? 'ring-1 ring-brand-500/30' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400">
            <Icon name={icon} size={15} />
          </span>
        ) : null}
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-50">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
    </div>
  )
}
