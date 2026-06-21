// Minimal SVG donut for a single 0..1 ratio (e.g. win rate). Calm, no library.

export default function Donut({
  value = 0, // 0..1
  size = 120,
  thickness = 12,
  tone = 'brand',
  label,
  sublabel,
}) {
  const pct = Math.max(0, Math.min(1, value))
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const dash = c * pct

  const TONES = { brand: '#34d399', sky: '#38bdf8', rose: '#fb7185', amber: '#fbbf24' }
  const stroke = TONES[tone] ?? TONES.brand

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label && <span className="text-xl font-extrabold text-slate-50">{label}</span>}
          {sublabel && <span className="text-[10px] uppercase tracking-wide text-slate-400">{sublabel}</span>}
        </div>
      )}
    </div>
  )
}
