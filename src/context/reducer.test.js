// Unit tests for the pure reducer. Run with `npm test` (Node's built-in
// test runner — no test framework dependency). Covers the money-affecting
// paths and the responsible-gambling guards, where correctness matters most.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  reducer,
  createInitialState,
  migrateState,
  inCooloff,
  stakeRemainingToday,
} from './reducer.js'
import { dayKey } from '../lib/format.js'

const betPayload = (over = {}) => ({
  marketId: 'mkt-x',
  outcomeId: 'yes',
  outcomeLabel: 'Yes',
  question: 'Test market?',
  stake: 100,
  price: 0.5,
  ...over,
})

test('PLACE_BET deducts stake and opens a position', () => {
  const s0 = createInitialState()
  const s1 = reducer(s0, { type: 'PLACE_BET', payload: betPayload({ stake: 200 }) })
  assert.equal(s1.points, s0.points - 200)
  assert.equal(s1.positions.length, s0.positions.length + 1)
  assert.equal(s1.positions[0].status, 'open')
  assert.equal(s1.stakedToday.amount, 200)
})

test('PLACE_BET refuses to overdraw the balance', () => {
  const s0 = createInitialState()
  const s1 = reducer(s0, { type: 'PLACE_BET', payload: betPayload({ stake: s0.points + 1 }) })
  assert.equal(s1, s0) // unchanged
})

test('PLACE_BET rejects non-positive stakes', () => {
  const s0 = createInitialState()
  assert.equal(reducer(s0, { type: 'PLACE_BET', payload: betPayload({ stake: 0 }) }), s0)
  assert.equal(reducer(s0, { type: 'PLACE_BET', payload: betPayload({ stake: -50 }) }), s0)
})

test('PLACE_BET enforces a self-imposed daily stake limit', () => {
  let s = createInitialState()
  s = reducer(s, { type: 'SET_STAKE_LIMIT', payload: { amount: 150 } })
  // Over the limit in one shot → rejected.
  assert.equal(reducer(s, { type: 'PLACE_BET', payload: betPayload({ stake: 200 }) }), s)
  // Within the limit → allowed, remaining shrinks.
  const s2 = reducer(s, { type: 'PLACE_BET', payload: betPayload({ stake: 100 }) })
  assert.equal(stakeRemainingToday(s2), 50)
  // Next bet that would exceed the remaining 50 → rejected.
  assert.equal(reducer(s2, { type: 'PLACE_BET', payload: betPayload({ stake: 100 }) }), s2)
})

test('cool-off blocks new bets until it ends', () => {
  let s = createInitialState()
  s = reducer(s, { type: 'START_COOLOFF', payload: { hours: 24 } })
  assert.equal(inCooloff(s), true)
  assert.equal(reducer(s, { type: 'PLACE_BET', payload: betPayload() }), s) // blocked
  s = reducer(s, { type: 'END_COOLOFF' })
  assert.equal(inCooloff(s), false)
  const s2 = reducer(s, { type: 'PLACE_BET', payload: betPayload() })
  assert.notEqual(s2, s) // now allowed
})

test('RESOLVE_MARKET pays winners at 1/price and records the result', () => {
  let s = createInitialState()
  s = reducer(s, { type: 'PLACE_BET', payload: betPayload({ marketId: 'mkt-x', stake: 100, price: 0.25 }) })
  const before = s.points
  const winsBefore = s.stats.wins
  const s2 = reducer(s, { type: 'RESOLVE_MARKET', payload: { marketId: 'mkt-x', winningOutcomeId: 'yes' } })
  // 0.25 price → 4× payout → 400 points returned.
  assert.equal(s2.points, before + 400)
  assert.equal(s2.stats.wins, winsBefore + 1)
  assert.equal(s2.resolvedMarkets['mkt-x'], 'yes')
  assert.equal(s2.positions[0].status, 'won')
})

test('RESOLVE_MARKET forfeits losing stakes', () => {
  let s = createInitialState()
  s = reducer(s, { type: 'PLACE_BET', payload: betPayload({ marketId: 'mkt-x', outcomeId: 'yes', stake: 100 }) })
  const before = s.points
  const lossesBefore = s.stats.losses
  const s2 = reducer(s, { type: 'RESOLVE_MARKET', payload: { marketId: 'mkt-x', winningOutcomeId: 'no' } })
  assert.equal(s2.points, before) // no refund
  assert.equal(s2.stats.losses, lossesBefore + 1)
  assert.equal(s2.positions[0].status, 'lost')
})

test('ADD_SAVINGS increments the total and logs an entry; ignores non-positive', () => {
  const s0 = createInitialState()
  const s1 = reducer(s0, { type: 'ADD_SAVINGS', payload: { amount: 40, note: 'skipped' } })
  assert.equal(s1.savings.total, s0.savings.total + 40)
  assert.equal(s1.savings.entries.length, s0.savings.entries.length + 1)
  assert.equal(reducer(s0, { type: 'ADD_SAVINGS', payload: { amount: 0 } }), s0)
})

test('SET_SAVINGS_GOAL clamps to a minimum of 1', () => {
  const s0 = createInitialState()
  assert.equal(reducer(s0, { type: 'SET_SAVINGS_GOAL', payload: { goal: 0 } }).savings.goal, 1)
  assert.equal(reducer(s0, { type: 'SET_SAVINGS_GOAL', payload: { goal: 750 } }).savings.goal, 750)
})

test('CHECK_IN advances streak on consecutive days and resets after a gap', () => {
  const s0 = createInitialState()
  const yesterday = dayKey(new Date(Date.now() - 24 * 3600 * 1000))
  const longAgo = dayKey(new Date(Date.now() - 5 * 24 * 3600 * 1000))

  // Consecutive day → +1.
  const consec = reducer({ ...s0, lastActive: yesterday, streak: 4 }, { type: 'CHECK_IN' })
  assert.equal(consec.streak, 5)
  assert.equal(consec.lastActive, dayKey())

  // Gap → reset to 1.
  const reset = reducer({ ...s0, lastActive: longAgo, streak: 9 }, { type: 'CHECK_IN' })
  assert.equal(reset.streak, 1)

  // Same day → no-op.
  const same = reducer({ ...s0, lastActive: dayKey(), streak: 3 }, { type: 'CHECK_IN' })
  assert.equal(same.streak, 3)
})

test('CLAIM_DAILY grants the allowance once per day', () => {
  let s = createInitialState()
  s = reducer(s, { type: 'SET_ALLOWANCE', payload: { amount: 500 } })
  const before = s.points
  const s1 = reducer(s, { type: 'CLAIM_DAILY' })
  assert.equal(s1.points, before + 500)
  assert.equal(s1.lastAllowanceClaim, dayKey())
  // Second claim same day → no-op.
  assert.equal(reducer(s1, { type: 'CLAIM_DAILY' }), s1)
})

test('challenges: stake is escrowed and the winner takes the 2x pot', () => {
  let s = createInitialState()
  const friend = { id: 'u-z', name: 'Zed', avatar: '🦊' }
  const before = s.points
  s = reducer(s, {
    type: 'CREATE_CHALLENGE',
    payload: { friend, marketId: 'mkt-x', question: 'Q?', outcomeId: 'yes', outcomeLabel: 'Yes', stake: 300, price: 0.5 },
  })
  assert.equal(s.points, before - 300)
  assert.equal(s.social.challenges.length, 1)
  const id = s.social.challenges[0].id
  const won = reducer(s, { type: 'RESOLVE_CHALLENGE', payload: { id, won: true } })
  assert.equal(won.points, before - 300 + 600) // net +300
  assert.equal(won.social.challenges[0].status, 'won')
})

test('ADD_FRIEND dedupes and REMOVE_FRIEND also clears group rosters', () => {
  const s0 = createInitialState()
  const friend = { id: 'u-quinn', name: 'Quinn Avila', avatar: '🦊', points: 1 }
  // Quinn is already a seeded friend → no duplicate.
  const dup = reducer(s0, { type: 'ADD_FRIEND', payload: { friend } })
  assert.equal(dup.social.friends.length, s0.social.friends.length)
  // Removing Quinn also strips them from the seeded group roster.
  const removed = reducer(s0, { type: 'REMOVE_FRIEND', payload: { id: 'u-quinn' } })
  assert.ok(!removed.social.friends.some((f) => f.id === 'u-quinn'))
  assert.ok(!removed.social.groups[0].memberIds.includes('u-quinn'))
})

test('migrateState backfills missing keys from an older blob', () => {
  // Simulate a v2 blob with no responsible-gambling fields and no social slice.
  const old = { points: 1234, settings: { dailyAllowance: 250 } }
  const migrated = migrateState(old)
  assert.equal(migrated.points, 1234)
  assert.equal(migrated.settings.dailyAllowance, 250)
  assert.equal(migrated.settings.dailyStakeLimit, 0) // backfilled
  assert.equal(migrated.settings.cooloffUntil, null) // backfilled
  assert.ok(migrated.social) // backfilled
  assert.ok(Array.isArray(migrated.journal)) // backfilled
})
