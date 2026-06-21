// Horizontal labeled bar list (e.g. mood distribution before/after urges).
// data: [{ key, label, value }]. Bars scale to the max value in the set.

export default function BarChart({ data = [], tone = 'brand', emptyLabel = 'No data yet.' }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const FILL = {
    brand: 'bg-gradient-to-r from-brand-500 to-brand-300',
    sky: 'bg-gradient-to-r from-sky-500 to-sky-300',
    amber: 'bg-gradient-to-r from-amber-500 to-amber-300',
  }
  const fill = FILL[tone] ?? FILL.brand

  if (!data.some((d) => d.value > 0)) {
    return <p className="py-4 text-center text-sm text-slate-500">{emptyLabel}</p>
  }

  return (
    <ul className="space-y-2">
      {data.map((d) => (
        <li key={d.key} className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 truncate text-slate-300">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={['h-full rounded-full transition-all duration-700 ease-out', fill].join(' ')}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right tabular-nums text-slate-400">{d.value}</span>
        </li>
      ))}
    </ul>
  )
}
