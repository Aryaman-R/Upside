// Small status / category pill.

const TONES = {
  neutral: 'bg-white/[0.06] text-slate-300 border border-white/10',
  brand: 'bg-brand-500/12 text-brand-300 border border-brand-500/25',
  win: 'bg-emerald-500/12 text-emerald-300 border border-emerald-500/25',
  loss: 'bg-rose-500/12 text-rose-300 border border-rose-500/25',
  open: 'bg-sky-500/12 text-sky-300 border border-sky-500/25',
  warn: 'bg-amber-500/12 text-amber-300 border border-amber-500/25',
}

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
