// Reusable button with a few visual variants. Keeps styling consistent and
// keyboard/disabled behavior accessible across the app.

const VARIANTS = {
  primary:
    'bg-brand-500 hover:bg-brand-400 text-ink-950 font-semibold shadow-glow-sm hover:-translate-y-px active:translate-y-0',
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
  xl: 'px-6 py-3 text-base rounded-xl',
  icon: 'h-9 w-9 p-0 rounded-lg',
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 transition-all duration-150 ease-out',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0',
        fullWidth ? 'w-full' : '',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
