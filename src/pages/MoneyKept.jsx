import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import StatTile from '../components/ui/StatTile.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
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

// Start of the current month, for the "this month" tile.
function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime()
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
  const count = savings.entries.length
  const avg = count ? savings.total / count : 0
  const best = count ? Math.max(...savings.entries.map((e) => e.amount)) : 0
  const monthStart = startOfMonth()
  const thisMonth = savings.entries.reduce(
    (sum, e) => (new Date(e.createdAt).getTime() >= monthStart ? sum + e.amount : sum),
    0,
  )
  const isEmpty = savings.total === 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Money Kept"
        title="The money you kept"
        subtitle="Every dollar you were tempted to gamble, redirected into real savings."
      />

      {/* Hero total + progress — the centerpiece */}
      <Reveal immediate>
        <Card
          variant="glow"
          padding="lg"
          className="relative overflow-hidden bg-spotlight-brand text-center"
        >
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <p className="eyebrow mb-3 text-center">Saved by not gambling</p>
            {isEmpty ? (
              <div className="space-y-2">
                <p className="font-display text-5xl font-black tracking-tightish text-gradient-brand sm:text-6xl">
                  $0
                </p>
                <p className="mx-auto max-w-sm text-sm text-slate-300">
                  This is where it starts. Log the next impulse below and watch a real
                  number grow — money that stays yours.
                </p>
              </div>
            ) : (
              <>
                <AnimatedNumber
                  value={savings.total}
                  format={formatUSD}
                  as="p"
                  className="font-display text-5xl font-black tracking-tightish text-gradient-brand sm:text-6xl"
                />
                <p className="mt-2 text-sm text-slate-300">{milestoneFor(savings.total)}</p>
              </>
            )}
          </div>

          <div className="relative mt-7 space-y-2 text-left">
            <ProgressBar value={savingsProgress} tone="brand" glow />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="tabular-nums">{formatUSD(savings.total)}</span>
              <span className="tabular-nums">
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
              !isEmpty && <Badge tone="win">Goal reached! 🎉</Badge>
            )}

            {editingGoal && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  saveGoal()
                }}
                className="mt-2 flex justify-center gap-2"
              >
                <input
                  type="number"
                  min="1"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder={String(savings.goal)}
                  aria-label="Savings goal"
                  className="input w-32"
                />
                <Button size="sm" type="submit">
                  Save goal
                </Button>
              </form>
            )}
          </div>
        </Card>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-3">
        <Reveal delay={0}>
          <StatTile label="Redirects" value={count} icon="refresh" tone="brand" animate />
        </Reveal>
        <Reveal delay={60}>
          <StatTile
            label="Avg per redirect"
            value={avg}
            icon="trendingUp"
            tone="positive"
            animate
            format={formatUSD}
          />
        </Reveal>
        <Reveal delay={120}>
          <StatTile
            label={thisMonth > 0 ? 'This month' : 'Best redirect'}
            value={thisMonth > 0 ? thisMonth : best}
            icon={thisMonth > 0 ? 'clock' : 'trophy'}
            tone="brand"
            animate
            format={formatUSD}
            sub={thisMonth > 0 ? 'Kept since the 1st' : 'Your biggest single save'}
          />
        </Reveal>
      </div>

      {/* Add a redirect */}
      <Reveal>
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100">Redirect an impulse</h2>
          <p className="text-sm text-slate-400">
            About to put real money on a bet? Log it here instead — it stays yours.
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((q) => {
              const selected = amount !== '' && Number(amount) === q
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={[
                    'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                    selected
                      ? 'border-brand-400 bg-brand-500/15 text-brand-200'
                      : 'border-transparent bg-white/10 text-slate-200 hover:bg-white/15',
                  ].join(' ')}
                >
                  {formatUSD(q)}
                </button>
              )
            })}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addSavings()
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative sm:w-40">
              <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                min="1"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25"
                aria-label="Amount in dollars"
                className="input w-full pl-7"
              />
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (e.g. “skipped the Sunday parlay”)"
              aria-label="Optional note"
              className="input flex-1"
            />
            <Button type="submit" disabled={!(Number(amount) > 0)}>
              Keep it
            </Button>
          </form>
        </Card>
      </Reveal>

      {/* History log */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100">History</h2>
        {count === 0 ? (
          <Card padding="none">
            <EmptyState
              icon="savings"
              title="No redirects yet"
              body="Your first one is the hardest — and the best. Log an impulse above and it becomes a number you can watch grow."
            />
          </Card>
        ) : (
          <Card padding="none" className="divide-y divide-white/5">
            {savings.entries.map((e, i) => (
              <Reveal
                key={e.id}
                delay={Math.min(i, 8) * 40}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">
                    {e.note || 'Redirected impulse'}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(e.createdAt)}</p>
                </div>
                <Badge tone="win">+{formatUSD(e.amount)}</Badge>
              </Reveal>
            ))}
          </Card>
        )}
      </section>
    </div>
  )
}
