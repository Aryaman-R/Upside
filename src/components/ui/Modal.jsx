import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

// Accessible modal: closes on Escape and backdrop click, locks scroll, traps
// keyboard focus inside the panel, and restores focus to the trigger on close.
// Dependency-free.

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export default function Modal({ open, onClose, title, ariaLabel, children, maxWidth = 'max-w-lg' }) {
  const panelRef = useRef(null)
  // Read onClose through a ref so the focus/scroll effect can key on [open] only
  // and never re-run (re-stealing focus) when a parent passes a fresh closure.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    const previouslyFocused = document.activeElement
    const panel = panelRef.current

    // Move focus into the dialog (first focusable, else the panel itself).
    const focusables = () => Array.from(panel?.querySelectorAll(FOCUSABLE) ?? [])
    const initial = focusables()[0] ?? panel
    initial?.focus?.()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      // Restore focus to whatever opened the modal.
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  const label = title || ariaLabel

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      {...(label ? { 'aria-label': label } : {})}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          'relative w-full surface p-6 shadow-pop ring-1 ring-brand-500/10 animate-pop outline-none',
          maxWidth,
          'max-h-[90vh] overflow-y-auto',
        ].join(' ')}
      >
        {title ? (
          <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/[0.07] pb-4">
            <h2 className="font-display text-lg font-bold tracking-tightish text-slate-50">{title}</h2>
            <button
              onClick={onClose}
              className="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
              aria-label="Close"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}
