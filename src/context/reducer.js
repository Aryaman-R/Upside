// Pure state logic for Upside, extracted from AppContext so it can be unit
// tested without React. Everything here is a pure function of (state, action)
// — no DOM, no React, no storage. See reducer.test.js for coverage.
//
// NOTE: There is intentionally NO real money anywhere in this state. "points"
// are a play currency; "savings" is a SIMULATED tracker of dollars the user
// chose NOT to gamble — the app never holds, moves, or touches real funds.

import { potentialPayout, dayKey, daysBetween } from '../lib/format.js'

// Schema version for the persisted state. Bump when the shape changes; the
// migrator (migrateState) backfills missing keys so older blobs still load.
export const SCHEMA_VERSION = 3

// A lightly pre-populated state so a brand-new user sees a living dashboard
// instead of empty screens. All values are illustrative play data.
export function createInitialState() {
  return {
    __v: SCHEMA_VERSION,
    // First-run onboarding is shown until completed; persisted thereafter.
    onboarded: false,
    user: {
      id: 'me',
      name: 'You',
      avatar: '🚀',
    },
    // User-tunable preferences.
    //  - dailyAllowance: the play-point top-up claimable once per day.
    //  - dailyStakeLimit: a self-imposed cap on points staked per day (0 = off).
    //  - cooloffUntil: ISO timestamp of a self-set "take a break" window (or null).
    settings: {
      dailyAllowance: 500,
      dailyStakeLimit: 0,
      cooloffUntil: null,
    },
    // Live-streak + daily-allowance bookkeeping (local day keys, e.g. 2026-06-21).
    lastActive: dayKey(),
    lastAllowanceClaim: null, // null = the first daily bonus is claimable now
    // Per-day staking tracker for the self-imposed limit: { day, staked }.
    stakedToday: { day: dayKey(), amount: 0 },
    points: 8550,
    // Seed positions reference real mock markets by id.
    positions: [
      {
        id: 'pos-seed-1',
        marketId: 'mkt-btc-100k',
        outcomeId: 'yes',
        outcomeLabel: 'Yes',
        question: 'Will Bitcoin close above $100,000 by the end of the quarter?',
        stake: 800,
        price: 0.48,
        status: 'open',
        payout: 0,
        placedAt: '2026-06-12T15:30:00.000Z',
      },
      {
        id: 'pos-seed-2',
        marketId: 'mkt-fed-rate-cut',
        outcomeId: 'yes',
        outcomeLabel: 'Yes',
        question: 'Will the Fed cut interest rates at the next meeting?',
        stake: 650,
        price: 0.71,
        status: 'open',
        payout: 0,
        placedAt: '2026-06-14T18:05:00.000Z',
      },
    ],
    // marketId -> winning outcomeId for markets the user has resolved.
    resolvedMarkets: {},
    savings: {
      goal: 500,
      total: 140,
      entries: [
        {
          id: 'sav-seed-1',
          amount: 60,
          note: 'Skipped the Sunday parlay',
          createdAt: '2026-06-09T20:15:00.000Z',
        },
        {
          id: 'sav-seed-2',
          amount: 80,
          note: 'Closed the betting app, moved it here instead',
          createdAt: '2026-06-15T23:40:00.000Z',
        },
      ],
    },
    journal: [
      {
        id: 'jrnl-seed-1',
        createdAt: '2026-06-15T23:38:00.000Z',
        prompt: 'What just happened that made you want to place a bet right now?',
        reflection: 'Lost a coin flip on a game and wanted it back immediately.',
        moodBefore: 'stressed',
        moodAfter: 'calm',
        savedSnapshot: 60,
      },
    ],
    stats: { wins: 3, losses: 1 },
    streak: 4, // days engaging with the tool / staying within play limits
    // Social graph — friends, groups, and friendly head-to-head challenges, all
    // on PLAY points. Seeded lightly so the Friends page looks alive.
    social: {
      friends: [
        { id: 'u-quinn', name: 'Quinn Avila', avatar: '🦊', points: 24850, streak: 7 },
        { id: 'u-theo', name: 'Theo Park', avatar: '🦉', points: 18990, streak: 12 },
      ],
      groups: [
        {
          id: 'grp-seed-1',
          name: 'Sunday Squad',
          emoji: '🏈',
          memberIds: ['u-quinn', 'u-theo'],
          createdAt: '2026-06-10T17:00:00.000Z',
        },
      ],
      challenges: [],
    },
  }
}

let idCounter = 0
// Monotonic id helper. We avoid Date.now()/Math.random() collisions by mixing a
// counter with the timestamp at call time (fine for a single-user local app).
function makeId(prefix) {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

// True while a self-imposed cool-off ("take a break") window is active.
export function inCooloff(state) {
  const until = state.settings?.cooloffUntil
  return Boolean(until) && new Date(until).getTime() > Date.now()
}

// Points already staked today, resetting the counter when the day rolls over.
export function stakedToday(state) {
  const today = dayKey()
  return state.stakedToday?.day === today ? state.stakedToday.amount : 0
}

// How many points may still be staked today under the self-imposed limit.
// Returns Infinity when no limit is set.
export function stakeRemainingToday(state) {
  const limit = state.settings?.dailyStakeLimit || 0
  if (limit <= 0) return Infinity
  return Math.max(0, limit - stakedToday(state))
}

// Record a stake against today's running total (used by bets + challenges).
function recordStake(state, amount) {
  const today = dayKey()
  const prior = state.stakedToday?.day === today ? state.stakedToday.amount : 0
  return { day: today, amount: prior + amount }
}

export function reducer(state, action) {
  switch (action.type) {
    // --- Play-money betting -------------------------------------------------
    case 'PLACE_BET': {
      const { marketId, outcomeId, outcomeLabel, price, question } = action.payload
      // Points are an integer currency — never let a fractional stake drift the balance.
      const stake = Math.floor(Number(action.payload.stake) || 0)
      if (stake <= 0 || stake > state.points) return state // guard: no overdraw
      if (inCooloff(state)) return state // self-imposed break is active
      if (stake > stakeRemainingToday(state)) return state // self-imposed daily limit

      const position = {
        id: makeId('pos'),
        marketId,
        outcomeId,
        outcomeLabel,
        question,
        stake,
        price,
        status: 'open',
        payout: 0,
        placedAt: new Date().toISOString(),
      }
      return {
        ...state,
        points: state.points - stake,
        stakedToday: recordStake(state, stake),
        positions: [position, ...state.positions],
      }
    }

    // Resolve every OPEN position on a market against a chosen winning outcome.
    case 'RESOLVE_MARKET': {
      const { marketId, winningOutcomeId } = action.payload
      let pointsDelta = 0
      let wins = 0
      let losses = 0

      const positions = state.positions.map((pos) => {
        if (pos.marketId !== marketId || pos.status !== 'open') return pos
        const won = pos.outcomeId === winningOutcomeId
        if (won) {
          const payout = potentialPayout(pos.stake, pos.price)
          pointsDelta += payout
          wins += 1
          return { ...pos, status: 'won', payout }
        }
        losses += 1
        return { ...pos, status: 'lost', payout: 0 }
      })

      return {
        ...state,
        positions,
        points: state.points + pointsDelta,
        resolvedMarkets: { ...state.resolvedMarkets, [marketId]: winningOutcomeId },
        stats: {
          wins: state.stats.wins + wins,
          losses: state.stats.losses + losses,
        },
      }
    }

    // Top up play points (e.g. a "daily play allowance"). Never real money.
    case 'ADD_POINTS': {
      return { ...state, points: state.points + action.payload.amount }
    }

    // --- Onboarding & profile ----------------------------------------------
    case 'COMPLETE_ONBOARDING': {
      const { name, avatar, dailyAllowance } = action.payload
      return {
        ...state,
        onboarded: true,
        user: {
          ...state.user,
          name: name?.trim() || state.user.name,
          avatar: avatar || state.user.avatar,
        },
        settings: {
          ...state.settings,
          dailyAllowance: dailyAllowance > 0 ? dailyAllowance : state.settings.dailyAllowance,
        },
      }
    }

    case 'UPDATE_PROFILE': {
      const { name, avatar } = action.payload
      return {
        ...state,
        user: {
          ...state.user,
          name: name?.trim() || state.user.name,
          avatar: avatar || state.user.avatar,
        },
      }
    }

    case 'SET_ALLOWANCE': {
      const amount = Math.max(0, Math.round(action.payload.amount || 0))
      return { ...state, settings: { ...state.settings, dailyAllowance: amount } }
    }

    // --- Responsible-gambling controls -------------------------------------
    // Self-imposed daily stake cap (0 disables it).
    case 'SET_STAKE_LIMIT': {
      const amount = Math.max(0, Math.round(action.payload.amount || 0))
      return { ...state, settings: { ...state.settings, dailyStakeLimit: amount } }
    }

    // Start a "take a break" cool-off for N hours (betting paused until then).
    case 'START_COOLOFF': {
      const hours = Math.max(0, Number(action.payload.hours) || 0)
      const until = hours > 0 ? new Date(Date.now() + hours * 3600 * 1000).toISOString() : null
      return { ...state, settings: { ...state.settings, cooloffUntil: until } }
    }

    // End an active cool-off early (the user is always in control of their tool).
    case 'END_COOLOFF': {
      return { ...state, settings: { ...state.settings, cooloffUntil: null } }
    }

    // --- Streak & daily allowance ------------------------------------------
    // CHECK_IN runs once per app load. It advances the streak on consecutive
    // days, resets it after a gap, and is a no-op if already counted today.
    case 'CHECK_IN': {
      const today = dayKey()
      if (state.lastActive === today) return state
      const gap = daysBetween(state.lastActive, today)
      const streak = gap === 1 ? (state.streak || 0) + 1 : 1
      return { ...state, streak, lastActive: today }
    }

    // Claim the once-daily play-point allowance. No-op if already claimed today.
    case 'CLAIM_DAILY': {
      const today = dayKey()
      if (state.lastAllowanceClaim === today) return state
      return {
        ...state,
        points: state.points + state.settings.dailyAllowance,
        lastAllowanceClaim: today,
      }
    }

    // --- Social: friends, groups, friendly challenges ----------------------
    case 'ADD_FRIEND': {
      const { friend } = action.payload
      if (state.social.friends.some((f) => f.id === friend.id)) return state
      return { ...state, social: { ...state.social, friends: [...state.social.friends, friend] } }
    }

    case 'REMOVE_FRIEND': {
      const { id } = action.payload
      return {
        ...state,
        social: {
          ...state.social,
          friends: state.social.friends.filter((f) => f.id !== id),
          // Also drop them from any group rosters.
          groups: state.social.groups.map((g) => ({
            ...g,
            memberIds: g.memberIds.filter((m) => m !== id),
          })),
        },
      }
    }

    case 'CREATE_GROUP': {
      const { name, emoji, memberIds } = action.payload
      const group = {
        id: makeId('grp'),
        name: name?.trim() || 'New group',
        emoji: emoji || '🎯',
        memberIds: memberIds || [],
        createdAt: new Date().toISOString(),
      }
      return { ...state, social: { ...state.social, groups: [group, ...state.social.groups] } }
    }

    case 'LEAVE_GROUP': {
      const { id } = action.payload
      return {
        ...state,
        social: { ...state.social, groups: state.social.groups.filter((g) => g.id !== id) },
      }
    }

    // Stake play points on a head-to-head pick against a friend (they "match").
    case 'CREATE_CHALLENGE': {
      const { friend, marketId, question, outcomeId, outcomeLabel, price } = action.payload
      const stake = Math.floor(Number(action.payload.stake) || 0)
      if (stake <= 0 || stake > state.points) return state
      if (inCooloff(state)) return state
      if (stake > stakeRemainingToday(state)) return state
      const challenge = {
        id: makeId('chal'),
        friendId: friend.id,
        friendName: friend.name,
        friendAvatar: friend.avatar,
        marketId,
        question,
        outcomeId,
        outcomeLabel,
        stake,
        price,
        status: 'open',
        payout: 0,
        createdAt: new Date().toISOString(),
      }
      return {
        ...state,
        points: state.points - stake,
        stakedToday: recordStake(state, stake),
        social: { ...state.social, challenges: [challenge, ...state.social.challenges] },
      }
    }

    // Settle a challenge. Winner takes the matched pot (2× the stake).
    case 'RESOLVE_CHALLENGE': {
      const { id, won } = action.payload
      let pointsDelta = 0
      const challenges = state.social.challenges.map((c) => {
        if (c.id !== id || c.status !== 'open') return c
        if (won) {
          const payout = c.stake * 2
          pointsDelta += payout
          return { ...c, status: 'won', payout }
        }
        return { ...c, status: 'lost', payout: 0 }
      })
      return { ...state, points: state.points + pointsDelta, social: { ...state.social, challenges } }
    }

    // --- Savings redirect ("Money Kept") -----------------------------------
    case 'ADD_SAVINGS': {
      const { amount, note } = action.payload
      if (amount <= 0) return state
      const entry = {
        id: makeId('sav'),
        amount,
        note: note?.trim() || 'Redirected a gambling impulse',
        createdAt: new Date().toISOString(),
      }
      return {
        ...state,
        savings: {
          ...state.savings,
          total: state.savings.total + amount,
          entries: [entry, ...state.savings.entries],
        },
      }
    }

    case 'SET_SAVINGS_GOAL': {
      return {
        ...state,
        savings: { ...state.savings, goal: Math.max(1, action.payload.goal) },
      }
    }

    // --- Urge intervention --------------------------------------------------
    case 'LOG_URGE': {
      const { prompt, reflection, moodBefore, moodAfter, savedSnapshot } = action.payload
      const entry = {
        id: makeId('jrnl'),
        createdAt: new Date().toISOString(),
        prompt,
        reflection: reflection?.trim() || '',
        moodBefore: moodBefore || null,
        moodAfter: moodAfter || null,
        savedSnapshot,
      }
      return { ...state, journal: [entry, ...state.journal] }
    }

    // --- Maintenance --------------------------------------------------------
    // Replace the entire state with a snapshot (e.g. pulled from cloud sync),
    // run through the migrator so an older remote blob is safely backfilled.
    case 'HYDRATE':
      return migrateState(action.payload.state)

    case 'RESET':
      return createInitialState()

    default:
      return state
  }
}

// Backfill any keys a persisted (possibly older-schema) blob is missing, so the
// app never crashes on `state.settings.x` after a shape change. Nested objects
// are merged shallowly against the current defaults.
export function migrateState(loaded) {
  const base = createInitialState()
  return {
    ...base,
    ...loaded,
    user: { ...base.user, ...loaded.user },
    savings: { ...base.savings, ...loaded.savings },
    settings: { ...base.settings, ...loaded.settings },
    stats: { ...base.stats, ...loaded.stats },
    social: { ...base.social, ...loaded.social },
    stakedToday: loaded.stakedToday || base.stakedToday,
    __v: SCHEMA_VERSION,
  }
}
