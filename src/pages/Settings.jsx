import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'
import AccountCard from '../components/auth/AccountCard.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AVATARS, ALLOWANCE_OPTIONS } from '../data/avatars.js'
import { formatPoints, formatDateTime } from '../lib/format.js'

// Self-imposed daily stake caps (0 = no limit).
const STAKE_LIMITS = [0, 500, 1000, 2500]
// "Take a break" cool-off durations.
const COOLOFF_OPTIONS = [
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '1 week', hours: 168 },
]

// Trigger a client-side file download from in-memory content.
function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Escape a value for a CSV cell.
function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Build the persistable slice of state for export (omits functions/derived).
function exportableState(ctx) {
  const {
    __v, onboarded, user, settings, lastActive, lastAllowanceClaim,
    points, positions, resolvedMarkets, savings, journal, stats, streak,
  } = ctx
  return {
    __v, onboarded, user, settings, lastActive, lastAllowanceClaim,
    points, positions, resolvedMarkets, savings, journal, stats, streak,
  }
}

export default function Settings() {
  const ctx = useApp()
  const { user, settings, dispatch, cooloffActive, stakedToday, stakeRemaining } = ctx

  const [name, setName] = useState(user.name === 'You' ? '' : user.name)
  const [avatar, setAvatar] = useState(user.avatar)
  const [allowance, setAllowance] = useState(settings.dailyAllowance)
  const [savedFlash, setSavedFlash] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  function saveProfile() {
    dispatch({ type: 'UPDATE_PROFILE', payload: { name, avatar } })
    dispatch({ type: 'SET_ALLOWANCE', payload: { amount: allowance } })
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
  }

  const today = new Date().toISOString().slice(0, 10)

  function exportData() {
    downloadBlob(`upside-data-${today}.json`, JSON.stringify(exportableState(ctx), null, 2), 'application/json')
  }

  function exportJournalCsv() {
    const header = ['date', 'prompt', 'reflection', 'mood_before', 'mood_after', 'money_kept_at_time']
    const rows = [header, ...ctx.journal.map((j) => [
      j.createdAt, j.prompt, j.reflection, j.moodBefore || '', j.moodAfter || '', j.savedSnapshot,
    ])]
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n')
    downloadBlob(`upside-journal-${today}.csv`, csv, 'text/csv')
  }

  function resetProgress() {
    dispatch({ type: 'RESET' })
    setConfirmReset(false)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-50">Settings</h1>
        <p className="text-sm text-slate-400">Your account, profile, play limits, and data.</p>
      </header>

      {/* Account & cloud sync ---------------------------------------------- */}
      <AccountCard />

      {/* Profile ------------------------------------------------------------ */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Profile</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-200">Display name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="You"
            className="w-full max-w-sm rounded-xl border border-white/10 bg-ink-900/60 p-3 text-slate-100 placeholder:text-slate-500 focus:border-brand-400"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">Avatar</p>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={[
                  'flex h-11 w-11 items-center justify-center rounded-xl text-2xl transition-colors',
                  avatar === a ? 'bg-brand-500/20 ring-2 ring-brand-400' : 'bg-white/5 hover:bg-white/10',
                ].join(' ')}
                aria-label={`Choose ${a}`}
              >
                <span aria-hidden>{a}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Daily allowance ---------------------------------------------------- */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Daily play allowance</h2>
          <p className="text-sm text-slate-400">
            How many free play points you can claim once per day. A gentle, self-set limit.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ALLOWANCE_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => setAllowance(a)}
              className={[
                'rounded-xl border px-4 py-3 text-center transition-colors',
                allowance === a
                  ? 'border-brand-400 bg-brand-500/15 text-brand-200'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
              ].join(' ')}
            >
              <span className="block text-base font-bold">{formatPoints(a)}</span>
              <span className="text-xs text-slate-400">/ day</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={saveProfile}>Save changes</Button>
          {savedFlash && <Badge tone="win">Saved ✓</Badge>}
        </div>
      </Card>

      {/* Play limits & breaks ---------------------------------------------- */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Play limits &amp; breaks</h2>
          <p className="text-sm text-slate-400">
            Stay in control. These caps are yours to set — and we enforce them across betting and challenges.
          </p>
        </div>

        {/* Daily stake limit */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-200">Daily stake limit</p>
            {settings.dailyStakeLimit > 0 && (
              <span className="text-xs text-slate-500">
                {formatPoints(stakedToday)} / {formatPoints(settings.dailyStakeLimit)} used today
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STAKE_LIMITS.map((a) => (
              <button
                key={a}
                onClick={() => dispatch({ type: 'SET_STAKE_LIMIT', payload: { amount: a } })}
                className={[
                  'rounded-lg border px-4 py-2.5 text-center text-sm transition-colors',
                  settings.dailyStakeLimit === a
                    ? 'border-brand-400 bg-brand-500/[0.12] text-brand-200'
                    : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]',
                ].join(' ')}
              >
                {a === 0 ? 'No limit' : `${formatPoints(a)} pts`}
              </button>
            ))}
          </div>
          {settings.dailyStakeLimit > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              {stakeRemaining > 0
                ? `${formatPoints(stakeRemaining)} points left to stake today.`
                : 'Daily stake limit reached — betting paused until tomorrow.'}
            </p>
          )}
        </div>

        {/* Take a break / cool-off */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">Take a break</p>
          {cooloffActive ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-400/25 bg-amber-500/[0.08] px-4 py-3">
              <p className="text-sm text-amber-200">
                You’re on a break until <strong>{formatDateTime(settings.cooloffUntil)}</strong>. Betting is paused.
              </p>
              <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'END_COOLOFF' })}>
                End break early
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {COOLOFF_OPTIONS.map((o) => (
                  <Button
                    key={o.hours}
                    size="sm"
                    variant="outline"
                    onClick={() => dispatch({ type: 'START_COOLOFF', payload: { hours: o.hours } })}
                  >
                    Pause for {o.label}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                A cool-off pauses all play-money betting and challenges. The urge tools and Money Kept stay available.
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Data controls ------------------------------------------------------ */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Your data</h2>
          <p className="text-sm text-slate-400">
            Everything lives in this browser. Export a copy or reset back to a fresh start.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}>
            <Icon name="download" size={15} /> Export my data (JSON)
          </Button>
          <Button variant="secondary" onClick={exportJournalCsv} disabled={ctx.journal.length === 0}>
            <Icon name="download" size={15} /> Export journal (CSV)
          </Button>
          {!confirmReset ? (
            <Button variant="outline" onClick={() => setConfirmReset(true)}>
              Reset progress…
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2">
              <span className="text-sm text-rose-200">Erase all progress and re-run onboarding?</span>
              <Button size="sm" variant="danger" onClick={resetProgress}>
                Yes, reset
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Reset clears your points, positions, savings log, and journal. This can’t be undone.
        </p>
      </Card>
    </div>
  )
}
