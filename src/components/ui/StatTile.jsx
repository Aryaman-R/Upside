// Compact KPI tile: a label, a big value, and an optional sub-line / icon.

export default function StatTile({ label, value, sub, icon, accent = false }) {
  return (
    <div
      className={[
        'surface p-4 flex flex-col gap-1',
        accent ? 'ring-1 ring-brand-500/40' : '',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
        {icon ? <span className="text-lg" aria-hidden>{icon}</span> : null}
      </div>
      <span className="text-2xl font-bold text-slate-50">{value}</span>
      {sub ? <span className="text-xs text-slate-400">{sub}</span> : null}
    </div>
  )
}
