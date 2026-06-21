// Standard page header so every screen shares one bold, display-scale title
// treatment instead of ad-hoc text-2xl/font-bold vs font-extrabold variations.
// `eyebrow` is a small uppercase kicker; `action` renders on the right.
export default function PageHeader({ eyebrow, title, subtitle, action, className = '' }) {
  return (
    <header className={['flex flex-wrap items-end justify-between gap-3', className].join(' ')}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold tracking-display text-slate-50 sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
