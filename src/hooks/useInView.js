import { useLayoutEffect, useRef, useState } from 'react'

// Returns [ref, inView]. Flips inView true the first time the element is in the
// viewport (then disconnects). Used to drive on-scroll reveals and chart draw-ins.
//
// Uses useLayoutEffect + a synchronous bounding-box check so content that is
// ALREADY on screen at mount is marked visible BEFORE the browser paints — no
// one-frame "flash of hidden content" for above-the-fold sections. Off-screen
// content waits for IntersectionObserver. Falls back to always-visible when
// IntersectionObserver is unavailable so content never gets stuck hidden.
export default function useInView({ rootMargin = '0px 0px -10% 0px', threshold = 0.1 } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    // Already in (or above) the viewport at mount → show immediately, pre-paint.
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < vh && rect.bottom > 0) {
      setInView(true)
      return undefined
    }

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          obs.disconnect()
        }
      },
      { rootMargin, threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [rootMargin, threshold])

  return [ref, inView]
}
