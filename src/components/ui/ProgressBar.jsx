// Simple labeled progress bar used by the savings tracker and elsewhere.
// `value` is a 0..1 fraction.

export default function ProgressBar({ value, className = '', tone = 'brand' }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const fill =
    tone === 'brand'
      ? 'bg-gradient-to-r from-brand-500 to-brand-300'
      : 'bg-gradient-to-r from-sky-500 to-sky-300'

  return (
    <div
      className={['h-3 w-full overflow-hidden rounded-full bg-white/10', className].join(' ')}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={['h-full rounded-full transition-all duration-700 ease-out', fill].join(' ')}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
