import { useMemo } from 'react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import { useApp } from '../context/AppContext.jsx'
import { MOCK_PLAYERS } from '../data/leaderboard.js'
import { formatPoints } from '../lib/format.js'

export default function Leaderboard() {
  const { user, points, streak } = useApp()

  // Merge the real user into the mock field and rank everyone by points.
  const ranked = useMemo(() => {
    const me = {
      id: 'me',
      name: user.name,
      avatar: user.avatar,
      points,
      streak,
      isMe: true,
    }
    return [...MOCK_PLAYERS, me].sort((a, b) => b.points - a.points)
  }, [user, points, streak])

  const myRank = ranked.findIndex((p) => p.isMe) + 1

  const podium = ranked.slice(0, 3)
  const rest = ranked.slice(3)
  // Re-order podium for a centered bento: #2 (left), #1 (center, raised), #3 (right).
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Standings"
        title="Leaderboard"
        subtitle="Ranked by play points. Bragging rights only — nothing is wagered."
        action={
          <Badge tone="brand">
            You’re #{myRank} of {ranked.length}
          </Badge>
        }
      />

      {/* Podium — top 3 ----------------------------------------------------- */}
      <section className="grid grid-cols-3 items-end gap-3 sm:gap-4">
        {podiumOrder.map((p) => {
          const rank = ranked.indexOf(p) + 1
          const isFirst = rank === 1
          const tone = rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'
          const accentRing =
            rank === 1
              ? 'ring-amber-400/40'
              : rank === 2
                ? 'ring-slate-300/25'
                : 'ring-orange-400/25'
          return (
            <Reveal
              key={p.id}
              delay={(rank - 1) * 80}
              className={isFirst ? 'order-none' : 'pb-2'}
            >
              <Card
                variant={isFirst ? 'glow' : 'flat'}
                padding="none"
                className={[
                  'relative flex flex-col items-center overflow-hidden text-center',
                  isFirst ? 'px-3 pb-5 pt-7 sm:px-5' : 'px-2 pb-4 pt-5 sm:px-4',
                  isFirst ? '' : `ring-1 ring-inset ${accentRing}`,
                  p.isMe && !isFirst ? 'bg-brand-500/[0.08]' : '',
                ].join(' ')}
              >
                {isFirst && (
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
                )}
                {isFirst && (
                  <Icon
                    name="crown"
                    size={22}
                    className="mb-1 text-amber-300 animate-breathe"
                  />
                )}
                <Avatar
                  emoji={p.avatar}
                  size={isFirst ? 'lg' : 'md'}
                  ring={p.isMe}
                  glow={isFirst}
                />
                <Badge tone={tone} className="mt-2.5">
                  #{rank}
                </Badge>
                <p
                  className={[
                    'mt-2 max-w-full truncate text-sm font-semibold',
                    p.isMe ? 'text-brand-200' : 'text-slate-100',
                    isFirst ? 'sm:text-base' : '',
                  ].join(' ')}
                >
                  {p.name}
                  {p.isMe && <span className="ml-1 text-xs text-brand-300">(you)</span>}
                </p>
                <AnimatedNumber
                  value={p.points}
                  format={formatPoints}
                  as="p"
                  className={[
                    'mt-0.5 font-display font-bold text-slate-50',
                    isFirst ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl',
                  ].join(' ')}
                />
                <p className="text-[11px] text-slate-500">pts</p>
                {p.streak > 0 && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                    <Icon name="flame" size={11} /> {p.streak}d
                  </span>
                )}
              </Card>
            </Reveal>
          )
        })}
      </section>

      {/* Ranks 4+ — f1-style table ----------------------------------------- */}
      {rest.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-white/[0.06] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span className="text-center">#</span>
            <span>Player</span>
            <span className="text-right">Points</span>
          </div>
          <ul>
            {rest.map((p, i) => {
              const rank = i + 4
              return (
                <li
                  key={p.id}
                  className={[
                    'relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 px-5 py-3 transition-colors',
                    p.isMe
                      ? 'bg-brand-500/[0.12] ring-1 ring-inset ring-brand-500/25'
                      : 'hover:bg-white/[0.02]',
                    i > 0 ? 'border-t border-white/[0.04]' : '',
                  ].join(' ')}
                >
                  {p.isMe && (
                    <span className="absolute inset-y-0 left-0 w-1 rounded-r bg-brand-400" />
                  )}
                  <span className="text-center text-sm font-bold tabular-nums text-slate-400">
                    {rank}
                  </span>
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar emoji={p.avatar} size="sm" ring={p.isMe} />
                    <div className="min-w-0">
                      <p
                        className={[
                          'truncate text-sm font-semibold',
                          p.isMe ? 'text-brand-200' : 'text-slate-100',
                        ].join(' ')}
                      >
                        {p.name}
                        {p.isMe && <span className="ml-1.5 text-xs text-brand-300">(you)</span>}
                      </p>
                      {p.streak > 0 && (
                        <p className="flex items-center gap-1 text-[11px] text-amber-200/80">
                          <Icon name="flame" size={11} /> {p.streak}-day streak
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={[
                      'text-right font-bold tabular-nums',
                      p.isMe ? 'text-brand-100' : 'text-slate-100',
                    ].join(' ')}
                  >
                    {formatPoints(p.points)}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
