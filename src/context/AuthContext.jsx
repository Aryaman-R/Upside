import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

/**
 * Auth state for cloud sync (Phase 1). When Supabase isn't configured this
 * provider is inert: `configured === false`, `user === null`, and the app runs
 * fully local/offline. Sign-in/up use email + password.
 */
const AuthContext = createContext(null)

const notConfigured = { error: { message: 'Cloud sync is not configured.' } }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = {
    configured: isSupabaseConfigured,
    user: session?.user ?? null,
    session,
    loading,
    async signUp(email, password) {
      if (!supabase) return notConfigured
      return supabase.auth.signUp({ email, password })
    },
    async signIn(email, password) {
      if (!supabase) return notConfigured
      return supabase.auth.signInWithPassword({ email, password })
    },
    async signOut() {
      if (!supabase) return notConfigured
      return supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
