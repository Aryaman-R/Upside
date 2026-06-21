import { useMemo } from 'react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-50">Leaderboard</h1>
          <p className="text-sm text-slate-400">
            Ranked by play points. Bragging rights only — nothing is wagered.
          </p>
        </div>
        <Badge tone="brand">
          You’re #{myRank} of {ranked.length}
        </Badge>
      </header>

      <Card className="p-0">
        <ul className="divide-y divide-white/5">
          {ranked.map((p, i) => {
            const rank = i + 1
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
            return (
              <li
                key={p.id}
                className={[
                  'flex items-center gap-4 px-5 py-3',
                  p.isMe ? 'bg-brand-500/10' : '',
                ].join(' ')}
              >
                <span className="w-8 shrink-0 text-center text-sm font-bold text-slate-400">
                  {medal || rank}
                </span>
                <span className="text-2xl" aria-hidden>{p.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      'truncate font-semibold',
                      p.isMe ? 'text-brand-200' : 'text-slate-100',
                    ].join(' ')}
                  >
                    {p.name}
                    {p.isMe && <span className="ml-2 text-xs text-brand-300">(you)</span>}
                  </p>
                  {p.streak > 0 && (
                    <p className="text-xs text-slate-500">🔥 {p.streak}-day streak</p>
                  )}
                </div>
                <span className="shrink-0 font-bold tabular-nums text-slate-100">
                  {formatPoints(p.points)}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
