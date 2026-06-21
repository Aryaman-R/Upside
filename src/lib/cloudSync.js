// Cloud sync helpers for the per-user app-state snapshot (Phase 1).
// Thin wrappers over the `app_state` table; RLS scopes everything to the caller.

import { supabase } from './supabase.js'

/** Fetch the user's saved snapshot, or null if they have none yet. */
export async function pullState(userId) {
  const { data, error } = await supabase
    .from('app_state')
    .select('state, schema_version, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

/** Upsert the user's full app state. */
export async function pushState(userId, state) {
  const { error } = await supabase
    .from('app_state')
    .upsert(
      { user_id: userId, state, schema_version: state?.__v ?? 0 },
      { onConflict: 'user_id' },
    )
  if (error) throw error
}
