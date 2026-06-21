import Icon from './Icon.jsx'

// Warm, consistent empty state: a brand-tinted icon chip, a confident title,
// a supporting line, and an optional call-to-action. Replaces the bare grey
// one-liners scattered across pages. `action` is any node (e.g. a <Link>/<Button>).
export default function EmptyState({ icon = 'savings', title, body, action, className = '' }) {
  return (
    <div className={['flex flex-col items-center px-6 py-10 text-center', className].join(' ')}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
        <Icon name={icon} size={22} />
      </span>
      {title && <p className="text-base font-semibold text-slate-200">{title}</p>}
      {body && <p className="mt-1 max-w-sm text-sm text-slate-400">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
