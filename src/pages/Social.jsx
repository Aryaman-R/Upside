import { useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ChallengeModal from '../components/social/ChallengeModal.jsx'
import CreateGroupModal from '../components/social/CreateGroupModal.jsx'
import { useApp } from '../context/AppContext.jsx'
import { SUGGESTED_FRIENDS, findPerson } from '../data/social.js'
import { formatPoints, formatDate, formatProbability } from '../lib/format.js'

// Small amber flame pill reused for streaks.
function StreakPill({ days }) {
  if (!days) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-medium text-amber-200">
      <Icon name="flame" size={11} /> {days}d
    </span>
  )
}

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

  const newGroupButton = (
    <Button variant="secondary" size="sm" onClick={() => setGroupOpen(true)}>
      <Icon name="users" size={15} /> New group
    </Button>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Play together"
        title="Friends"
        subtitle="Play with friends, form groups, and run friendly challenges — all in play points."
        action={newGroupButton}
      />

      {/* Active challenges — VS cards -------------------------------------- */}
      {openChallenges.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Active challenges</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {openChallenges.map((c, i) => (
              <Reveal key={c.id} delay={i * 60}>
                <Card variant="glow" className="space-y-4">
                  {/* VS header: you vs friend */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                      <Avatar emoji={user.avatar} size="md" ring />
                      <span className="max-w-full truncate text-xs font-medium text-brand-200">You</span>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-bold uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
                      VS
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                      <Avatar emoji={c.friendAvatar} size="md" />
                      <span className="max-w-full truncate text-xs font-medium text-slate-300">{c.friendName}</span>
                    </div>
                  </div>

                  {/* Pot hero figure */}
                  <div className="rounded-xl bg-ink-900/60 py-3 text-center ring-1 ring-inset ring-white/[0.04]">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Pot if you win</p>
                    <AnimatedNumber
                      value={c.stake * 2}
                      format={formatPoints}
                      as="p"
                      className="font-display text-2xl font-bold text-brand-300"
                    />
                    <p className="text-[11px] text-slate-500">pts</p>
                  </div>

                  <p className="text-sm text-slate-300">{c.question}</p>
                  <p className="text-xs text-slate-500">
                    Your pick: <span className="text-slate-300">{c.outcomeLabel}</span> · {formatProbability(c.price)} ·{' '}
                    staked {formatPoints(c.stake)} pts
                  </p>
                  <Button variant="primary" size="sm" fullWidth onClick={() => settle(c)}>
                    Reveal result
                  </Button>
                </Card>
              </Reveal>
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
          <Card padding="none">
            <EmptyState
              icon="users"
              title="No friends yet"
              body="Add a few players below to start running friendly, play-money challenges."
            />
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {social.friends.map((f, i) => (
              <Reveal key={f.id} delay={i * 50}>
                <Card variant="interactive" className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar emoji={f.avatar} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-100">{f.name}</p>
                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatPoints(f.points)} pts</span>
                        <StreakPill days={f.streak} />
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
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Suggestions -------------------------------------------------------- */}
      {suggestions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Add friends</h2>
          <Card padding="none" className="divide-y divide-white/[0.06]">
            {suggestions.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                <Avatar emoji={p.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{p.name}</p>
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{formatPoints(p.points)} pts</span>
                    <StreakPill days={p.streak} />
                  </p>
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
        </div>
        {social.groups.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon="users"
              title="No groups yet"
              body="Create one to track a shared play-money leaderboard with friends."
              action={newGroupButton}
            />
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {social.groups.map((g) => {
              const standings = groupStandings(g)
              return (
                <Card key={g.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05] text-xl ring-1 ring-white/10">
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
                      aria-label={`Leave ${g.name}`}
                      onClick={() => dispatch({ type: 'LEAVE_GROUP', payload: { id: g.id } })}
                    >
                      Leave
                    </Button>
                  </div>
                  <div className="surface-muted divide-y divide-white/[0.05]">
                    {standings.map((m, i) => (
                      <div
                        key={m.id}
                        className={[
                          'flex items-center gap-3 px-3 py-2',
                          m.isMe ? 'bg-brand-500/[0.08]' : '',
                        ].join(' ')}
                      >
                        <span className="w-4 text-center text-xs font-bold tabular-nums text-slate-500">{i + 1}</span>
                        <Avatar emoji={m.avatar} size="xs" ring={m.isMe} />
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
          <Card padding="none" className="divide-y divide-white/[0.06]">
            {settledChallenges.map((c) => {
              const won = c.status === 'won'
              return (
                <div
                  key={c.id}
                  className={[
                    'flex items-center justify-between gap-3 px-4 py-3',
                    won ? 'animate-pop bg-brand-500/[0.06]' : '',
                  ].join(' ')}
                >
                  <div className="min-w-0">
                    <p className={['truncate text-sm', won ? 'text-slate-200' : 'text-slate-400'].join(' ')}>
                      vs {c.friendName} · {c.outcomeLabel}
                    </p>
                    <p className="truncate text-xs text-slate-500">{c.question}</p>
                  </div>
                  {won ? (
                    <Badge tone="win" className="shadow-glow-sm">+{formatPoints(c.payout)} pts</Badge>
                  ) : (
                    <Badge tone="loss">−{formatPoints(c.stake)} pts</Badge>
                  )}
                </div>
              )
            })}
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
