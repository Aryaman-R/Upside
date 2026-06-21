// Reusable button with a few visual variants. Keeps styling consistent and
// keyboard/disabled behavior accessible across the app.

const VARIANTS = {
  primary:
    'bg-brand-500 hover:bg-brand-400 text-ink-950 font-semibold shadow-sm shadow-brand-500/20',
  secondary: 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-100 border border-white/10',
  ghost: 'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-slate-100',
  danger: 'bg-rose-500 hover:bg-rose-400 text-white font-semibold',
  outline:
    'bg-transparent border border-white/15 text-slate-200 hover:border-brand-400/60 hover:text-brand-200 hover:bg-brand-500/[0.06]',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-[13px] rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-[15px] rounded-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 transition-colors duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    />
  )
}
