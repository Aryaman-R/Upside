// Small status / category pill.

const TONES = {
  neutral: 'bg-white/[0.06] text-slate-300 border border-white/10',
  brand: 'bg-brand-500/12 text-brand-300 border border-brand-500/25',
  // Semantic aliases — prefer these going forward. Green is reserved for
  // wins/growth, rose strictly for losses/errors (keeps the calm tone).
  positive: 'bg-emerald-500/12 text-emerald-300 border border-emerald-500/25',
  win: 'bg-emerald-500/12 text-emerald-300 border border-emerald-500/25',
  loss: 'bg-rose-500/12 text-rose-300 border border-rose-500/25',
  info: 'bg-sky-500/12 text-sky-300 border border-sky-500/25',
  open: 'bg-sky-500/12 text-sky-300 border border-sky-500/25',
  warn: 'bg-amber-500/14 text-amber-200 border border-amber-500/25',
  gold: 'bg-amber-400/15 text-amber-200 border border-amber-400/40',
  silver: 'bg-slate-300/15 text-slate-200 border border-slate-300/30',
  bronze: 'bg-orange-500/15 text-orange-200 border border-orange-400/30',
}

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone] || TONES.neutral,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
