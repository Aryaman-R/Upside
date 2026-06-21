import { useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import ChallengeModal from '../components/social/ChallengeModal.jsx'
import CreateGroupModal from '../components/social/CreateGroupModal.jsx'
import { useApp } from '../context/AppContext.jsx'
import { SUGGESTED_FRIENDS, findPerson } from '../data/social.js'
import { formatPoints, formatDate, formatProbability } from '../lib/format.js'

export default function Social() {
  const { user, points, social, dispatch } = useApp()
  const [challengeFriend, setChallengeFriend] = useState(null)
  const [groupOpen, setGroupOpen] = useState(false)

  const friendIds = useMemo(() => new Set(social.friends.map((f) => f.id)), [social.friends])
  const suggestions = SUGGESTED_FRIENDS.filter((p) => !friendIds.has(p.id))

  const openChallenges = social.challenges.filter((c) => c.status === 'open')
  const settledChallenges = social.challenges.filter((c) => c.status !== 'open')

  // Settle a challenge: you win with probability ≈ your pick's implied odds.
  function settle(c) {
    const won = Math.random() < c.price
    dispatch({ type: 'RESOLVE_CHALLENGE', payload: { id: c.id, won } })
  }

  // Resolve a group's members (you + friends) into a ranked standings list.
  function groupStandings(group) {
    const me = { id: 'me', name: user.name, avatar: user.avatar, points, isMe: true }
    const members = group.memberIds
      .map((id) => social.friends.find((f) => f.id === id) || findPerson(id))
      .filter(Boolean)
    return [me, ...members].sort((a, b) => b.points - a.points)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tightish text-slate-50">Friends</h1>
          <p className="text-sm text-slate-400">
            Play with friends, form groups, and run friendly challenges — all in play points.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setGroupOpen(true)}>
          <Icon name="users" size={15} /> New group
        </Button>
      </header>

      {/* Active challenges -------------------------------------------------- */}
      {openChallenges.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Active challenges</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {openChallenges.map((c) => (
              <Card key={c.id} className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon name="swords" size={16} className="text-slate-500" />
                    <span className="text-sm font-semibold text-slate-100">vs {c.friendName}</span>
                    <span className="text-lg" aria-hidden>{c.friendAvatar}</span>
                  </div>
                  <Badge tone="open">{formatPoints(c.stake * 2)} pot</Badge>
                </div>
                <p className="text-sm text-slate-300">{c.question}</p>
                <p className="text-xs text-slate-500">
                  Your pick: <span className="text-slate-300">{c.outcomeLabel}</span> · {formatProbability(c.price)} ·{' '}
                  staked {formatPoints(c.stake)} pts
                </p>
                <Button size="sm" variant="outline" onClick={() => settle(c)}>
                  Simulate result
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Friends ------------------------------------------------------------ */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your friends {social.friends.length > 0 && <span className="text-slate-600">· {social.friends.length}</span>}
        </h2>
        {social.friends.length === 0 ? (
          <Card className="text-center text-sm text-slate-400">
            No friends yet — add a few below to start challenging.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {social.friends.map((f) => (
              <Card key={f.id} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] text-xl">
                    <span aria-hidden>{f.avatar}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">{f.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatPoints(f.points)} pts{f.streak > 0 ? ` · ${f.streak}d streak` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => setChallengeFriend(f)}>
                    <Icon name="swords" size={14} /> Challenge
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dispatch({ type: 'REMOVE_FRIEND', payload: { id: f.id } })}
                    aria-label={`Remove ${f.name}`}
                  >
                    <Icon name="x" size={15} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Suggestions -------------------------------------------------------- */}
      {suggestions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Add friends</h2>
          <Card className="divide-y divide-white/[0.06] p-0">
            {suggestions.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xl" aria-hidden>{p.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{p.name}</p>
                  <p className="text-xs text-slate-500">{formatPoints(p.points)} pts</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => dispatch({ type: 'ADD_FRIEND', payload: { friend: p } })}
                >
                  Add
                </Button>
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* Groups ------------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Groups</h2>
          <button onClick={() => setGroupOpen(true)} className="text-sm text-brand-300 hover:underline">
            + New group
          </button>
        </div>
        {social.groups.length === 0 ? (
          <Card className="text-center text-sm text-slate-400">
            No groups yet. Create one to track a shared play-money leaderboard with friends.
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {social.groups.map((g) => {
              const standings = groupStandings(g)
              return (
                <Card key={g.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05] text-xl">
                        <span aria-hidden>{g.emoji}</span>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{g.name}</p>
                        <p className="text-xs text-slate-500">{standings.length} members</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dispatch({ type: 'LEAVE_GROUP', payload: { id: g.id } })}
                    >
                      Leave
                    </Button>
                  </div>
                  <div className="surface-muted divide-y divide-white/[0.05]">
                    {standings.map((m, i) => (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2">
                        <span className="w-4 text-center text-xs font-bold text-slate-500">{i + 1}</span>
                        <span className="text-base" aria-hidden>{m.avatar}</span>
                        <span className={['flex-1 truncate text-sm', m.isMe ? 'font-semibold text-brand-200' : 'text-slate-200'].join(' ')}>
                          {m.name}{m.isMe && ' (you)'}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-slate-300">{formatPoints(m.points)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600">Created {formatDate(g.createdAt)}</p>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Settled challenge history ----------------------------------------- */}
      {settledChallenges.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Challenge history</h2>
          <Card className="divide-y divide-white/[0.06] p-0">
            {settledChallenges.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">vs {c.friendName} · {c.outcomeLabel}</p>
                  <p className="truncate text-xs text-slate-500">{c.question}</p>
                </div>
                {c.status === 'won' ? (
                  <Badge tone="win">+{formatPoints(c.payout)} pts</Badge>
                ) : (
                  <Badge tone="loss">−{formatPoints(c.stake)} pts</Badge>
                )}
              </div>
            ))}
          </Card>
        </section>
      )}

      <p className="text-center text-xs text-slate-600">
        Friends, groups, and challenges are play-money only and stored on your device. Nothing is wagered.
      </p>

      <ChallengeModal open={Boolean(challengeFriend)} friend={challengeFriend} onClose={() => setChallengeFriend(null)} />
      <CreateGroupModal open={groupOpen} onClose={() => setGroupOpen(false)} />
    </div>
  )
}
