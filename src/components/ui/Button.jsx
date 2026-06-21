// Reusable button with a few visual variants. Keeps styling consistent and
// keyboard/disabled behavior accessible across the app.

const VARIANTS = {
  primary:
    'bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold shadow-lg shadow-brand-500/20',
  secondary:
    'bg-white/10 hover:bg-white/15 text-slate-100 border border-white/10',
  ghost: 'bg-transparent hover:bg-white/10 text-slate-200',
  danger: 'bg-rose-500/90 hover:bg-rose-500 text-white font-semibold',
  outline:
    'bg-transparent border border-brand-400/60 text-brand-300 hover:bg-brand-500/10',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-xl',
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
