// Consistent avatar chip for the emoji avatars used across leaderboard, social,
// groups and the top bar — replacing five slightly-different ad-hoc renders.
// `ring` highlights the current user; `glow` adds a soft brand halo (podium #1).

const SIZES = {
  xs: 'h-7 w-7 text-base',
  sm: 'h-9 w-9 text-lg',
  md: 'h-10 w-10 text-xl',
  lg: 'h-14 w-14 text-3xl',
  xl: 'h-20 w-20 text-5xl',
}

export default function Avatar({
  emoji,
  size = 'md',
  ring = false,
  glow = false,
  className = '',
}) {
  return (
    <span
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-full bg-white/[0.05]',
        SIZES[size] || SIZES.md,
        ring ? 'ring-2 ring-brand-400/70' : 'ring-1 ring-white/10',
        glow ? 'shadow-glow-sm' : '',
        className,
      ].join(' ')}
    >
      <span aria-hidden>{emoji}</span>
    </span>
  )
}
