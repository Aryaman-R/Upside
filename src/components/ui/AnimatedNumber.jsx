import useCountUp from '../../hooks/useCountUp.js'

// Renders a number that eases up/down to its target whenever `value` changes.
// `format` lets the same component drive points (formatPoints) and dollars
// (formatUSD). Always tabular-nums so the width never jitters mid-count.
export default function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString('en-US'),
  duration = 700,
  className = '',
  as: Tag = 'span',
}) {
  const safe = Number.isFinite(value) ? value : 0
  const animated = useCountUp(safe, { duration })
  return <Tag className={['tabular-nums', className].join(' ')}>{format(animated)}</Tag>
}
