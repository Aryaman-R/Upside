import { useEffect, useState } from 'react'

// Labeled progress bar used by the savings tracker and elsewhere. `value` is a
// 0..1 fraction. Animates its fill from 0 on mount (and on change), with a soft
// shimmer sweep and brand glow. The global reduced-motion guard tames it.
export default function ProgressBar({ value, className = '', tone = 'brand', glow = true }) {
  const pct = Math.max(0, Math.min(1, value || 0)) * 100
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])

  const fill =
    tone === 'brand'
      ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-brand-300'
      : 'bg-gradient-to-r from-sky-600 to-sky-400'

  return (
    <div
      className={['h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]', className].join(' ')}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={[
          'relative h-full rounded-full transition-[width] duration-1000 ease-out',
          fill,
          glow && pct > 0 ? 'shadow-[0_0_12px_-2px_rgba(16,185,129,0.6)]' : '',
        ].join(' ')}
        style={{ width: `${width}%` }}
      >
        {/* Moving sheen for a touch of life. */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  )
}
