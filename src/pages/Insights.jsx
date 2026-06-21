import { useMemo } from 'react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import StatTile from '../components/ui/StatTile.jsx'
import Sparkline from '../components/ui/Sparkline.jsx'
import Donut from '../components/ui/Donut.jsx'
import BarChart from '../components/ui/BarChart.jsx'
import { useApp } from '../context/AppContext.jsx'
import { MOOD_TAGS } from '../data/prompts.js'
import { formatUSD, formatPoints } from '../lib/format.js'

// Insights ties the behavioral loop together: progress you can see reinforces
// the harm-reduction habit. All derived locally from existing state.
export default function Insights() {
  const { savings, journal, stats, winRate, streak, points } = useApp()

  // Cumulative "money kept" over time (oldest → newest) for the area chart.
  const savingsSeries = useMemo(() => {
    const chrono = [...savings.entries].reverse() // entries are newest-first
    let running = 0
    const pts = chrono.map((e) => (running += e.amount))
    // A leading 0 anchors the curve's baseline so the first redirect shows growth.
    return pts.length ? [0, ...pts] : []
  }, [savings.entries])

  // Mood distributions from journal entries (before vs after the urge flow).
  const moodCounts = useMemo(() => {
    const before = {}
    const after = {}
    for (const j of journal) {
      if (j.moodBefore) before[j.moodBefore] = (before[j.moodBefore] || 0) + 1
      if (j.moodAfter) after[j.moodAfter] = (after[j.moodAfter] || 0) + 1
    }
    const toSeries = (counts) =>
      MOOD_TAGS.map((m) => ({ key: m.id, label: `${m.emoji} ${m.label}`, value: counts[m.id] || 0 }))
    return { before: toSeries(before), after: toSeries(after) }
  }, [journal])

  const totalGames = stats.wins + stats.losses

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-50">Insights</h1>
        <p className="text-sm text-slate-400">Your progress, visualized — proof the small wins add up.</p>
      </header>

      {/* Streak hero */}
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-amber-500/10 to-ink-800/60">
        <div className="flex items-center gap-4">
          <span className="text-5xl" aria-hidden>🔥</span>
          <div>
            <p className="text-3xl font-extrabold text-amber-200">{streak}-day streak</p>
            <p className="text-sm text-slate-400">
              {streak > 0
                ? 'Days you’ve shown up and stayed in control. Keep it alive — come back tomorrow.'
                : 'Show up tomorrow to start a streak.'}
            </p>
          </div>
        </div>
        <Badge tone="warn">Updated daily</Badge>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Money kept" value={formatUSD(savings.total)} icon="💚" accent />
        <StatTile label="Redirects" value={savings.entries.length} sub="impulses diverted" icon="🔁" />
        <StatTile label="Urges paused" value={journal.length} sub="reflections logged" icon="🫧" />
        <StatTile label="Points balance" value={formatPoints(points)} icon="🎮" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Savings over time */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Money kept over time</h2>
            <Badge tone="brand">{formatUSD(savings.total)}</Badge>
          </div>
          {savingsSeries.length > 1 ? (
            <Sparkline
              data={savingsSeries}
              tone="brand"
              width={480}
              height={140}
              strokeWidth={3}
              className="h-36 w-full"
            />
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              Log a redirect on Money Kept to start your curve.
            </p>
          )}
          <p className="text-xs text-slate-500">
            Cumulative dollars you chose to keep across {savings.entries.length} redirects.
          </p>
        </Card>

        {/* Win rate */}
        <Card className="flex flex-col items-center justify-center gap-3 text-center">
          <h2 className="self-start text-lg font-bold text-slate-100">Play win rate</h2>
          {totalGames > 0 ? (
            <>
              <Donut value={winRate} label={`${Math.round(winRate * 100)}%`} sublabel="win rate" />
              <p className="text-sm text-slate-400">
                {stats.wins}W · {stats.losses}L on settled play bets
              </p>
            </>
          ) : (
            <p className="py-10 text-sm text-slate-500">Settle a market in your Portfolio to see your record.</p>
          )}
        </Card>

        {/* Mood before */}
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100">How you felt before urges</h2>
          <BarChart data={moodCounts.before} tone="amber" emptyLabel="No urge check-ins logged yet." />
        </Card>

        {/* Mood after */}
        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100">How you felt after</h2>
          <BarChart data={moodCounts.after} tone="brand" emptyLabel="Complete an urge flow to see the shift." />
        </Card>
      </div>

      <p className="text-center text-xs text-slate-500">
        All insights are computed on your device from your own activity. For entertainment and harm-reduction only.
      </p>
    </div>
  )
}
