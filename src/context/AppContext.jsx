import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadState, saveState } from '../lib/storage.js'
import { getMarketById } from '../data/markets.js'
import { dayKey } from '../lib/format.js'
import {
  reducer,
  createInitialState,
  migrateState,
  inCooloff,
  stakeRemainingToday,
  stakedToday,
  SCHEMA_VERSION,
} from './reducer.js'

/**
 * AppContext is the single source of truth for everything the user does:
 *   - their play-points balance and open/closed positions
 *   - the "Money Kept" savings tracker (redirected gambling impulses)
 *   - the urge-intervention journal
 *   - self-imposed responsible-gambling limits (stake cap, cool-off)
 *   - the social graph (friends, groups, challenges)
 *
 * All state mutation lives in ./reducer.js (a pure, unit-tested module). This
 * file is just the React glue: hydration, persistence, and derived values.
 */

export { SCHEMA_VERSION }

const AppStateContext = createContext(null)

export function AppProvider({ children }) {
  // Hydrate from localStorage if present, else use the seeded initial state.
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const loaded = loadState()
    return loaded ? migrateState(loaded) : createInitialState()
  })

  // Persist on every change (optional convenience — see lib/storage.js).
  useEffect(() => {
    saveState(state)
  }, [state])

  // Advance the engagement streak once per app load (no-op if already today).
  useEffect(() => {
    dispatch({ type: 'CHECK_IN' })
  }, [])

  // Derived values used across pages, memoized for cheap re-use.
  const derived = useMemo(() => {
    const openPositions = state.positions.filter((p) => p.status === 'open')
    const settledPositions = state.positions.filter((p) => p.status !== 'open')
    const pointsAtStake = openPositions.reduce((sum, p) => sum + p.stake, 0)
    const savingsProgress = Math.min(
      1,
      state.savings.goal ? state.savings.total / state.savings.goal : 0,
    )
    const totalGames = state.stats.wins + state.stats.losses
    const winRate = totalGames ? state.stats.wins / totalGames : 0
    const canClaimDaily = state.lastAllowanceClaim !== dayKey()

    return {
      openPositions,
      settledPositions,
      pointsAtStake,
      savingsProgress,
      winRate,
      canClaimDaily,
      cooloffActive: inCooloff(state),
      stakeRemaining: stakeRemainingToday(state),
      stakedToday: stakedToday(state),
    }
  }, [state])

  // Helper to check whether a market is resolved (so the UI can disable it).
  const isMarketResolved = (marketId) => Boolean(state.resolvedMarkets[marketId])

  const value = useMemo(
    () => ({
      ...state,
      ...derived,
      dispatch,
      isMarketResolved,
      getMarketById,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, derived],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

/** Access the global app state + dispatch. Must be used under <AppProvider>. */
export function useApp() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider>')
  return ctx
}
