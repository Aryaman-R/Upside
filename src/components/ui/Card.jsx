// Generic surface container. `as` lets callers render it as a section/article.
// `variant` adds polish without changing the DOM (so existing space-y-* utility
// classes on the Card keep applying directly to its children):
//   flat        — the default restrained surface
//   interactive — lifts + brightens on hover (use for clickable cards)
//   glow        — a softly-lit, ring-accented surface for the moments that matter
const VARIANTS = {
  flat: 'surface',
  interactive:
    'surface transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-ink-800 hover:shadow-pop',
  glow: 'surface ring-1 ring-brand-500/20 shadow-glow-sm',
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export default function Card({
  as: Tag = 'div',
  variant = 'flat',
  padding = 'md',
  className = '',
  children,
  ...props
}) {
  // If the caller passes its own padding utility (e.g. className="p-0"), don't
  // emit a default that would win on stylesheet order and override it.
  const hasOwnPadding = /(?:^|\s)p-(?:\d|px)(?:\s|$)/.test(className)
  const pad = hasOwnPadding ? '' : PADDING[padding] ?? PADDING.md
  return (
    <Tag className={[VARIANTS[variant] || VARIANTS.flat, pad, className].join(' ')} {...props}>
      {children}
    </Tag>
  )
}
