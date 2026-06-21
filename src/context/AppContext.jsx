import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { loadState, saveState } from '../lib/storage.js'
import { getMarketById } from '../data/markets.js'
import { dayKey } from '../lib/format.js'
import { useAuth } from './AuthContext.jsx'
import { pullState, pushState } from '../lib/cloudSync.js'
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

  // --- Cloud sync (optional, offline-first) --------------------------------
  // 'local' (signed out / not configured) | 'syncing' | 'synced' | 'error'.
  const { configured, user } = useAuth()
  const [syncStatus, setSyncStatus] = useState('local')
  // Tracks which user we've started / finished the initial pull for, so the
  // debounced push never fires before the pull has reconciled state.
  const syncRef = useRef({ startedFor: null, readyFor: null })

  // On sign-in: pull the cloud snapshot if it exists, else upload the current
  // local state ("claim local progress"). Cloud wins on subsequent logins.
  useEffect(() => {
    if (!configured || !user) {
      syncRef.current = { startedFor: null, readyFor: null }
      setSyncStatus('local')
      return undefined
    }
    if (syncRef.current.startedFor === user.id) return undefined
    syncRef.current.startedFor = user.id
    let cancelled = false
    setSyncStatus('syncing')
    ;(async () => {
      try {
        const remote = await pullState(user.id)
        if (cancelled) return
        if (remote?.state && remote.state.__v != null) {
          dispatch({ type: 'HYDRATE', payload: { state: remote.state } })
        } else {
          await pushState(user.id, state) // first sign-in: claim local progress
        }
        if (!cancelled) {
          syncRef.current.readyFor = user.id
          setSyncStatus('synced')
        }
      } catch (err) {
        console.warn('[upside] cloud pull failed:', err)
        if (!cancelled) setSyncStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, user])

  // While signed in, push state changes to the cloud (debounced).
  useEffect(() => {
    if (!configured || !user || syncRef.current.readyFor !== user.id) return undefined
    const t = setTimeout(async () => {
      try {
        await pushState(user.id, state)
        setSyncStatus('synced')
      } catch (err) {
        console.warn('[upside] cloud push failed:', err)
        setSyncStatus('error')
      }
    }, 800)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, user, configured])

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
      syncStatus,
      cloudConfigured: configured,
      cloudUser: user,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, derived, syncStatus, configured, user],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

/** Access the global app state + dispatch. Must be used under <AppProvider>. */
export function useApp() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider>')
  return ctx
}
