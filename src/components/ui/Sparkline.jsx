// Dependency-free SVG sparkline / area chart. Used on market cards (tiny price
// trend) and on the Insights page (larger cumulative savings curve). Pure SVG —
// no charting library, so it adds zero bundle weight.
import { useId } from 'react'

export default function Sparkline({
  data = [],
  width = 120,
  height = 36,
  strokeWidth = 2,
  fill = true,
  tone = 'brand', // 'brand' (green) | 'sky' | 'rose'
  className = '',
  detailed = false, // adds gridlines, end-point dot + halo, and start/end value labels
  animate = true, // draw-in animation on mount (reduced-motion safe via CSS)
  decorative = false, // purely cosmetic instance — hide from assistive tech
  ariaLabel,
  format = (n) => Math.round(n).toLocaleString('en-US'),
}) {
  // A unique, render-stable id so multiple sparklines on one page never collide.
  const uid = useId().replace(/[:]/g, '')
  if (!data.length) return null

  const TONES = {
    brand: { stroke: '#8a47df', stop: 'rgba(138,71,223,0.35)', dot: '#a878e9' },
    sky: { stroke: '#38bdf8', stop: 'rgba(56,189,248,0.35)', dot: '#7dd3fc' },
    rose: { stroke: '#fb7185', stop: 'rgba(251,113,133,0.35)', dot: '#fda4af' },
  }
  const c = TONES[tone] ?? TONES.brand

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = data.length > 1 ? width / (data.length - 1) : width
  // Inset vertically so the stroke (and end dot) aren't clipped at the extremes.
  const pad = detailed ? Math.max(strokeWidth, 6) : strokeWidth
  const toY = (v) => height - pad - ((v - min) / span) * (height - pad * 2)

  const points = data.map((v, i) => [i * stepX, toY(v)])
  const line = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  const gid = `spark-grad-${uid}`
  const dotId = `spark-dot-${uid}`
  const [endX, endY] = points[points.length - 1]

  // Path length estimate for the draw-in dash animation. Manhattan distance is a
  // cheap upper bound that guarantees the dash fully covers the path.
  let pathLen = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0]
    const dy = points[i][1] - points[i - 1][1]
    pathLen += Math.abs(dx) + Math.abs(dy)
  }
  pathLen = Math.ceil(pathLen) || width

  const label = ariaLabel || `Trend chart, ${data.length} points, latest ${format(data[data.length - 1])}`

  // Horizontal gridlines for the detailed variant (25% / 50% / 75%).
  const gridYs = detailed ? [0.25, 0.5, 0.75].map((t) => pad + t * (height - pad * 2)) : []

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={className}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      <defs>
        {fill && (
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.stop} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        )}
        {detailed && (
          <filter id={dotId} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {detailed &&
        gridYs.map((gy, i) => (
          <line
            key={i}
            x1="0"
            x2={width}
            y1={gy.toFixed(1)}
            y2={gy.toFixed(1)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

      {fill && <path d={area} fill={`url(#${gid})`} stroke="none" />}

      <path
        d={line}
        fill="none"
        stroke={c.stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        {...(animate
          ? {
              strokeDasharray: pathLen,
              strokeDashoffset: pathLen,
              style: { animation: `spark-draw 1100ms cubic-bezier(0.22,1,0.36,1) forwards` },
            }
          : {})}
      />

      {detailed && (
        <>
          {/* end-point dot with a soft halo */}
          <circle
            cx={endX}
            cy={endY}
            r={Math.max(strokeWidth + 1.5, 3.5)}
            fill={c.dot}
            filter={`url(#${dotId})`}
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}

      {/* Inline keyframes; the global prefers-reduced-motion guard neutralizes
          animations, and we also fall back to a fully-drawn line there. */}
      {animate && (
        <style>{`
          @keyframes spark-draw { to { stroke-dashoffset: 0; } }
          @media (prefers-reduced-motion: reduce) {
            svg path[style*="spark-draw"] { animation: none !important; stroke-dashoffset: 0 !important; }
          }
        `}</style>
      )}
    </svg>
  )
}
