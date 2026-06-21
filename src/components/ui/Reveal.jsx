import useInView from '../../hooks/useInView.js'

// True once if the user asks for reduced motion. Read at module scope so every
// Reveal agrees and we never flash hidden content for these users.
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Wraps children and fades+rises them in the first time they enter the viewport.
// `delay` (ms) staggers siblings; pass `index * 60` from a map.
// `immediate` renders visible from the first paint — use it for above-the-fold
// hero content so it never blinks invisible while waiting on IntersectionObserver.
// Reduced-motion users always get the plain, visible block.
export default function Reveal({
  children,
  delay = 0,
  immediate = false,
  className = '',
  as: Tag = 'div',
  ...props
}) {
  const [ref, inView] = useInView()
  const shown = immediate || prefersReducedMotion || inView

  return (
    <Tag
      ref={ref}
      className={[
        'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none',
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3.5',
        className,
      ].join(' ')}
      style={{ transitionDelay: shown && !immediate ? `${delay}ms` : '0ms' }}
      {...props}
    >
      {children}
    </Tag>
  )
}
