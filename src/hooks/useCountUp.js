import { useEffect, useRef, useState } from 'react'

// Smoothly counts from the previously-rendered value to `target` using
// requestAnimationFrame and an ease-out curve. Calm (~700ms), never a
// slot-machine spin. Respects prefers-reduced-motion by snapping to the final
// value. Returns the current animated number for the caller to format.
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

export default function useCountUp(target, { duration = 700 } = {}) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef(0)
  const startRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const to = Number(target) || 0
    if (from === to) return undefined

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      fromRef.current = to
      setValue(to)
      return undefined
    }

    startRef.current = 0
    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const p = Math.min(1, elapsed / duration)
      const next = from + (to - from) * easeOut(p)
      setValue(next)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
        setValue(to)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}
