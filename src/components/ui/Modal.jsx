import { useEffect } from 'react'

// Accessible-ish modal: closes on Escape and on backdrop click, locks scroll,
// and traps the visual focus with an overlay. Kept dependency-free.

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={[
          'relative w-full surface p-6 animate-pop',
          maxWidth,
          'max-h-[90vh] overflow-y-auto',
        ].join(' ')}
      >
        {title ? (
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-50">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}
