// Small status / category pill.

const TONES = {
  neutral: 'bg-white/10 text-slate-300',
  brand: 'bg-brand-500/15 text-brand-300 border border-brand-500/30',
  win: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  loss: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
  open: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
  warn: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
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
