// Dependency-free SVG sparkline / area chart. Used on market cards (tiny price
// trend) and on the Insights page (larger cumulative savings curve). Pure SVG —
// no charting library, so it adds zero bundle weight.

export default function Sparkline({
  data = [],
  width = 120,
  height = 36,
  strokeWidth = 2,
  fill = true,
  tone = 'brand', // 'brand' (green) | 'sky' | 'rose'
  className = '',
}) {
  if (!data.length) return null

  const TONES = {
    brand: { stroke: '#34d399', stop: 'rgba(52,211,153,0.35)' },
    sky: { stroke: '#38bdf8', stop: 'rgba(56,189,248,0.35)' },
    rose: { stroke: '#fb7185', stop: 'rgba(251,113,133,0.35)' },
  }
  const c = TONES[tone] ?? TONES.brand

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = data.length > 1 ? width / (data.length - 1) : width
  // Inset vertically so the stroke isn't clipped at the extremes.
  const pad = strokeWidth
  const toY = (v) => height - pad - ((v - min) / span) * (height - pad * 2)

  const points = data.map((v, i) => [i * stepX, toY(v)])
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  // Unique gradient id so multiple sparklines on one page don't collide.
  const gid = `spark-${tone}-${data.length}-${Math.round(data[data.length - 1] * 1000)}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.stop} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} stroke="none" />
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke={c.stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
