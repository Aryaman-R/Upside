// Tiny localStorage wrapper. Persistence is OPTIONAL for this MVP — the app
// runs purely on in-memory React state, and this layer just lets a returning
// user keep their play-money progress. It fails gracefully (e.g. private mode,
// disabled storage) by acting as a no-op.

const STORAGE_KEY = 'upside.state.v1'

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw)
  } catch (err) {
    console.warn('[upside] Could not read saved state:', err)
    return undefined
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('[upside] Could not persist state:', err)
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('[upside] Could not clear state:', err)
  }
}
