// Horizontal labeled bar list (e.g. mood distribution before/after urges).
// data: [{ key, label, value }]. Bars scale to the max value in the set.

export default function BarChart({ data = [], tone = 'brand', emptyLabel = 'No data yet.' }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const total = data.reduce((sum, d) => sum + d.value, 0)
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
    <ul className="space-y-2.5">
      {data.map((d) => {
        const ratio = d.value / max
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
        // Give every non-zero bar a visible minimum so a count of 1 still reads.
        const widthPct = d.value > 0 ? Math.max(ratio * 100, 8) : 0
        return (
          <li key={d.key} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 truncate text-slate-300">{d.label}</span>
            {/* track with a faint axis cap on the right edge */}
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.07] ring-1 ring-inset ring-white/[0.04]">
              <div
                className={['h-full rounded-full transition-all duration-700 ease-out', fill].join(' ')}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="flex w-16 shrink-0 items-baseline justify-end gap-1 text-right tabular-nums">
              <span className="font-semibold text-slate-200">{d.value}</span>
              <span className="text-[11px] text-slate-500">{pct}%</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
