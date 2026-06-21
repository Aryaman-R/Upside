import { useMemo } from 'react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import StatTile from '../components/ui/StatTile.jsx'
import Sparkline from '../components/ui/Sparkline.jsx'
import Donut from '../components/ui/Donut.jsx'
import BarChart from '../components/ui/BarChart.jsx'
import Icon from '../components/ui/Icon.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import { useApp } from '../context/AppContext.jsx'
import { MOOD_TAGS } from '../data/prompts.js'
import { formatUSD, formatPoints, formatDateTime } from '../lib/format.js'

const MOOD_BY_ID = Object.fromEntries(MOOD_TAGS.map((m) => [m.id, `${m.emoji} ${m.label}`]))
const moodLabel = (id) => (id ? MOOD_BY_ID[id] || id : '—')

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
  const hasCurve = savingsSeries.length > 1

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your progress"
        title="Insights"
        subtitle="Proof the small wins add up — every number here is computed on your device."
      />

      {/* MONEY KEPT — hero */}
      <Reveal immediate>
        <Card variant="glow" padding="none" className="overflow-hidden bg-spotlight-brand">
          <div className="relative">
            {/* The savings curve bleeds toward the bottom/edges behind the figure. */}
            {hasCurve && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-70">
                <Sparkline
                  data={savingsSeries}
                  tone="brand"
                  detailed
                  decorative
                  width={900}
                  height={170}
                  strokeWidth={3}
                  className="h-44 w-full"
                />
              </div>
            )}
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow text-brand-300">Money kept</p>
                <Badge tone="brand">{savings.entries.length} redirects</Badge>
              </div>
              <AnimatedNumber
                value={savings.total}
                format={formatUSD}
                as="p"
                className="mt-2 font-display text-5xl font-bold tracking-display text-brand-200 sm:text-6xl"
              />
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Cumulative dollars you chose to keep instead of risking. This is real money that stayed
                yours — the play stays in points.
              </p>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Reveal delay={0}>
          <StatTile
            label="Money kept"
            value={savings.total}
            sub="real dollars saved"
            icon="savings"
            tone="brand"
            animate
            format={formatUSD}
          />
        </Reveal>
        <Reveal delay={60}>
          <StatTile
            label="Redirects"
            value={savings.entries.length}
            sub="impulses diverted"
            icon="refresh"
            animate
          />
        </Reveal>
        <Reveal delay={120}>
          <StatTile
            label="Urges paused"
            value={journal.length}
            sub="reflections logged"
            icon="lifebuoy"
            animate
          />
        </Reveal>
        <Reveal delay={180}>
          <StatTile
            label="Points balance"
            value={points}
            icon="coins"
            animate
            format={formatPoints}
          />
        </Reveal>
      </div>

      {/* Secondary: streak (demoted) + win rate */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0}>
          <Card className="flex h-full items-center justify-between gap-4 bg-gradient-to-br from-amber-500/[0.06] to-ink-850">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                <Icon name="flame" size={24} />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-amber-200">{streak}-day streak</p>
                <p className="text-sm text-slate-400">
                  {streak > 0
                    ? 'Days you’ve shown up and stayed in control. Keep it alive.'
                    : 'Show up tomorrow to start a streak.'}
                </p>
              </div>
            </div>
            <Badge tone="warn">Daily</Badge>
          </Card>
        </Reveal>

        {/* Win rate */}
        <Reveal delay={80}>
          <Card className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <h2 className="self-start text-lg font-bold text-slate-100">Play win rate</h2>
            {totalGames > 0 ? (
              <>
                <Donut value={winRate} label={`${Math.round(winRate * 100)}%`} sublabel="win rate" />
                <p className="text-sm text-slate-400">
                  {stats.wins}W · {stats.losses}L on settled play bets
                </p>
              </>
            ) : (
              <p className="py-8 text-sm text-slate-500">
                Settle a market in your Portfolio to see your record.
              </p>
            )}
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Mood before */}
        <Reveal delay={0}>
          <Card className="h-full space-y-3">
            <h2 className="text-lg font-bold text-slate-100">How you felt before urges</h2>
            <BarChart data={moodCounts.before} tone="amber" emptyLabel="No urge check-ins logged yet." />
          </Card>
        </Reveal>

        {/* Mood after */}
        <Reveal delay={80}>
          <Card className="h-full space-y-3">
            <h2 className="text-lg font-bold text-slate-100">How you felt after</h2>
            <BarChart data={moodCounts.after} tone="brand" emptyLabel="Complete an urge flow to see the shift." />
          </Card>
        </Reveal>
      </div>

      {/* Recent reflections (urge journal) */}
      {journal.length > 0 && (
        <Reveal>
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">Recent reflections</h2>
              <Badge tone="neutral">{journal.length} logged</Badge>
            </div>
            <ul className="space-y-3">
              {journal.slice(0, 6).map((j) => (
                <li key={j.id} className="surface-muted p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">{formatDateTime(j.createdAt)}</p>
                    {(j.moodBefore || j.moodAfter) && (
                      <p className="text-xs text-slate-400">
                        {moodLabel(j.moodBefore)} → {moodLabel(j.moodAfter)}
                      </p>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{j.prompt}</p>
                  {j.reflection && <p className="mt-1 text-sm italic text-slate-400">“{j.reflection}”</p>}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-600">Stored only on your device. Export anytime from Settings.</p>
          </Card>
        </Reveal>
      )}

      <p className="text-center text-xs text-slate-500">
        All insights are computed on your device from your own activity. For entertainment and harm-reduction only.
      </p>
    </div>
  )
}
