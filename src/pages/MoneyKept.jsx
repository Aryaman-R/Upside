import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import StatTile from '../components/ui/StatTile.jsx'
import { useApp } from '../context/AppContext.jsx'
import { formatUSD, formatDate } from '../lib/format.js'

// Suggested redirect amounts mirroring common bet sizes.
const QUICK_AMOUNTS = [10, 25, 50, 100]

// Little milestones to make the savings total feel tangible.
function milestoneFor(total) {
  if (total >= 500) return 'A month of groceries. Seriously.'
  if (total >= 250) return 'That’s a nice pair of shoes you actually keep.'
  if (total >= 100) return 'A great dinner out — on you, for you.'
  if (total >= 50) return 'A full tank of gas stayed in your pocket.'
  return 'Every dollar here is a bet you didn’t lose.'
}

export default function MoneyKept() {
  const { savings, savingsProgress, dispatch } = useApp()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [goalInput, setGoalInput] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)

  function addSavings() {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return
    dispatch({ type: 'ADD_SAVINGS', payload: { amount: value, note } })
    setAmount('')
    setNote('')
  }

  function saveGoal() {
    const value = Number(goalInput)
    if (Number.isFinite(value) && value > 0) {
      dispatch({ type: 'SET_SAVINGS_GOAL', payload: { goal: value } })
    }
    setEditingGoal(false)
    setGoalInput('')
  }

  const remaining = Math.max(0, savings.goal - savings.total)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-50">Money Kept</h1>
        <p className="text-sm text-slate-400">
          Every dollar you were tempted to gamble, redirected into real savings.
        </p>
      </header>

      {/* Hero total + progress */}
      <Card className="space-y-5 text-center">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Saved by not gambling
          </p>
          <p className="mt-1 text-5xl font-extrabold text-brand-300">
            {formatUSD(savings.total)}
          </p>
          <p className="mt-1 text-sm text-slate-400">{milestoneFor(savings.total)}</p>
        </div>

        <div className="space-y-2">
          <ProgressBar value={savingsProgress} />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{formatUSD(savings.total)}</span>
            <span>
              Goal: {formatUSD(savings.goal)}
              <button
                onClick={() => setEditingGoal((v) => !v)}
                className="ml-2 text-brand-300 hover:underline"
              >
                edit
              </button>
            </span>
          </div>
          {remaining > 0 ? (
            <p className="text-xs text-slate-500">
              {formatUSD(remaining)} to go — you’ve got this.
            </p>
          ) : (
            <Badge tone="win">Goal reached! 🎉</Badge>
          )}

          {editingGoal && (
            <div className="mt-2 flex justify-center gap-2">
              <input
                type="number"
                min="1"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder={String(savings.goal)}
                className="w-32 rounded-lg border border-white/10 bg-ink-900/60 px-3 py-1.5 text-sm text-slate-100"
              />
              <Button size="sm" onClick={saveGoal}>
                Save goal
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Total kept" value={formatUSD(savings.total)} icon="💚" accent />
        <StatTile label="Redirects logged" value={savings.entries.length} icon="🔁" />
        <StatTile
          label="Avg per redirect"
          value={formatUSD(
            savings.entries.length ? savings.total / savings.entries.length : 0,
          )}
          icon="📈"
        />
      </div>

      {/* Add a redirect */}
      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100">Redirect an impulse</h2>
        <p className="text-sm text-slate-400">
          About to put real money on a bet? Log it here instead — it stays yours.
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/15"
            >
              {formatUSD(q)}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative sm:w-40">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              $
            </span>
            <input
              type="number"
              min="1"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25"
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 py-2.5 pl-7 pr-3 text-slate-100 placeholder:text-slate-500 focus:border-brand-400"
            />
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (e.g. “skipped the Sunday parlay”)"
            className="flex-1 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-brand-400"
          />
          <Button onClick={addSavings} disabled={!(Number(amount) > 0)}>
            Keep it
          </Button>
        </div>
      </Card>

      {/* History log */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100">History</h2>
        {savings.entries.length === 0 ? (
          <Card className="text-center text-slate-400">
            No redirects yet. Your first one is the hardest — and the best.
          </Card>
        ) : (
          <Card className="divide-y divide-white/5 p-0">
            {savings.entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{e.note}</p>
                  <p className="text-xs text-slate-500">{formatDate(e.createdAt)}</p>
                </div>
                <Badge tone="win">+{formatUSD(e.amount)}</Badge>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  )
}
