import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { GROUP_EMOJI } from '../../data/social.js'

// Create a play-money group from your current friends. Local only.
export default function CreateGroupModal({ open, onClose }) {
  const { social, dispatch } = useApp()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(GROUP_EMOJI[0])
  const [memberIds, setMemberIds] = useState([])

  useEffect(() => {
    if (open) {
      setName('')
      setEmoji(GROUP_EMOJI[0])
      setMemberIds([])
    }
  }, [open])

  function toggleMember(id) {
    setMemberIds((ids) => (ids.includes(id) ? ids.filter((m) => m !== id) : [...ids, id]))
  }

  function create() {
    if (!name.trim()) return
    dispatch({ type: 'CREATE_GROUP', payload: { name, emoji, memberIds } })
    onClose?.()
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a group">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-200">Group name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={28}
            placeholder="e.g. Sunday Squad"
            className="w-full rounded-lg border border-white/10 bg-ink-900 p-2.5 text-slate-100 placeholder:text-slate-500 focus:border-brand-400"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">Icon</p>
          <div className="flex flex-wrap gap-2">
            {GROUP_EMOJI.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-colors',
                  emoji === e ? 'bg-brand-500/20 ring-2 ring-brand-400' : 'bg-white/[0.04] hover:bg-white/[0.08]',
                ].join(' ')}
                aria-label={`Choose ${e}`}
              >
                <span aria-hidden>{e}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">
            Add friends {memberIds.length > 0 && <span className="text-slate-500">({memberIds.length})</span>}
          </p>
          {social.friends.length === 0 ? (
            <p className="text-sm text-slate-500">Add some friends first, then group up.</p>
          ) : (
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {social.friends.map((f) => {
                const selected = memberIds.includes(f.id)
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleMember(f.id)}
                    className={[
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                      selected ? 'border-brand-400/50 bg-brand-500/[0.1]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]',
                    ].join(' ')}
                  >
                    <span className="text-xl" aria-hidden>{f.avatar}</span>
                    <span className="flex-1 text-sm text-slate-200">{f.name}</span>
                    <span
                      className={[
                        'flex h-5 w-5 items-center justify-center rounded-full border text-xs',
                        selected ? 'border-brand-400 bg-brand-400 text-ink-950' : 'border-white/20 text-transparent',
                      ].join(' ')}
                    >
                      ✓
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <Button className="w-full" onClick={create} disabled={!name.trim()}>
          Create group
        </Button>
      </div>
    </Modal>
  )
}
