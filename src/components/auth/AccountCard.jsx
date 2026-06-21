import { useState } from 'react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Icon from '../ui/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApp } from '../../context/AppContext.jsx'

// Maps the app's sync status to a badge.
function SyncBadge({ status }) {
  const MAP = {
    synced: { tone: 'win', label: 'Synced' },
    syncing: { tone: 'neutral', label: 'Syncing…' },
    error: { tone: 'loss', label: 'Sync error' },
    local: { tone: 'neutral', label: 'Local only' },
  }
  const m = MAP[status] ?? MAP.local
  return <Badge tone={m.tone}>{m.label}</Badge>
}

export default function AccountCard() {
  const { configured, user, signIn, signUp, signOut } = useAuth()
  const { syncStatus } = useApp()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  // Cloud sync not set up → app is fully local. Explain how to enable it.
  if (!configured) {
    return (
      <Card className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon name="cloud" size={18} className="text-slate-500" />
          <h2 className="text-lg font-bold text-slate-100">Account &amp; sync</h2>
          <Badge tone="neutral">Offline</Badge>
        </div>
        <p className="text-sm text-slate-400">
          Cloud sync isn’t configured, so everything is saved locally on this device. To enable
          accounts and multi-device sync, add Supabase keys — see{' '}
          <span className="font-medium text-slate-300">supabase/README.md</span>.
        </p>
      </Card>
    )
  }

  // Signed in.
  if (user) {
    return (
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon name="cloud" size={18} className="text-brand-400" />
            <h2 className="text-lg font-bold text-slate-100">Account &amp; sync</h2>
          </div>
          <SyncBadge status={syncStatus} />
        </div>
        <p className="text-sm text-slate-400">
          Signed in as <span className="font-medium text-slate-200">{user.email}</span>. Your
          progress syncs to the cloud and follows you across devices.
        </p>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          <Icon name="logout" size={15} /> Sign out
        </Button>
      </Card>
    )
  }

  // Signed out → email/password form.
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const fn = mode === 'signup' ? signUp : signIn
    const { data, error: err } = await fn(email.trim(), password)
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    if (mode === 'signup' && data?.user && !data?.session) {
      setNotice('Check your email to confirm your account, then sign in.')
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="cloud" size={18} className="text-slate-400" />
        <h2 className="text-lg font-bold text-slate-100">Account &amp; sync</h2>
      </div>
      <p className="text-sm text-slate-400">
        {mode === 'signup' ? 'Create an account' : 'Sign in'} to back up your progress and sync across
        devices. On first sign-in, your current local progress is uploaded.
      </p>
      <form onSubmit={submit} className="space-y-2">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="input max-w-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          className="input max-w-sm"
        />
        {error && <p className="text-xs text-rose-300">{error}</p>}
        {notice && <p className="text-xs text-brand-300">{notice}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={busy} disabled={busy}>
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </Button>
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'signup' ? 'signin' : 'signup'))
              setError('')
              setNotice('')
            }}
            className="text-sm text-brand-300 hover:underline"
          >
            {mode === 'signup' ? 'Have an account? Sign in' : 'New here? Create an account'}
          </button>
        </div>
      </form>
    </Card>
  )
}
