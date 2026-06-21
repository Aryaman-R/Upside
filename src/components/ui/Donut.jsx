// Minimal SVG donut for a single 0..1 ratio (e.g. win rate). Calm, no library.
import { useId } from 'react'

export default function Donut({
  value = 0, // 0..1
  size = 120,
  thickness = 12,
  tone = 'brand',
  label,
  sublabel,
}) {
  const uid = useId().replace(/[:]/g, '')
  const pct = Math.max(0, Math.min(1, value))
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const dash = c * pct

  // Gradient stop pairs (bright -> light) per tone.
  const TONES = {
    brand: ['#34d399', '#6ee7b7'],
    sky: ['#38bdf8', '#7dd3fc'],
    rose: ['#fb7185', '#fda4af'],
    amber: ['#fbbf24', '#fcd34d'],
  }
  const [c0, c1] = TONES[tone] ?? TONES.brand
  // Keep the center label in step with the arc tone (no green number on a rose arc).
  const LABEL_TONES = {
    brand: 'text-brand-200',
    sky: 'text-sky-200',
    rose: 'text-rose-200',
    amber: 'text-amber-200',
  }
  const labelTone = LABEL_TONES[tone] ?? LABEL_TONES.brand
  const gid = `donut-grad-${uid}`
  const glowId = `donut-glow-${uid}`

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c0} />
            <stop offset="100%" stopColor={c1} />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
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
          stroke={`url(#${gid})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          filter={`url(#${glowId})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label && (
            <span className={['text-3xl font-extrabold tabular-nums', labelTone].join(' ')}>{label}</span>
          )}
          {sublabel && (
            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
