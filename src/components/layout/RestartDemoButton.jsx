import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'

// A one-click "restart the demo" control. Confirms, then resets all state to the
// seeded initial state — which flips `onboarded` and the tour back to their
// first-run values, so onboarding and the guided walkthrough replay from the top.
// `className` styles the trigger for its context (sidebar vs. mobile sheet);
// `onDone` lets the caller close a menu after a restart.
export default function RestartDemoButton({ className, onDone }) {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)

  function restart() {
    dispatch({ type: 'RESET' })
    setConfirm(false)
    onDone?.()
    navigate('/')
  }

  const triggerClass =
    className ||
    'flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06]'

  return (
    <>
      <button onClick={() => setConfirm(true)} className={triggerClass}>
        <Icon name="refresh" size={17} className="text-slate-400" />
        Restart demo
      </button>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Restart the demo?" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            This clears everything and starts fresh from onboarding — a clean slate to run the demo from
            the top. It’s a demo, so nothing real is lost.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={restart}>Restart demo</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
