// Small formatting helpers shared across the UI. Pure functions, no state.

/** Format a points value with thousands separators, e.g. 12500 -> "12,500". */
export function formatPoints(value) {
  return Math.round(value).toLocaleString('en-US')
}

/** Format a USD amount, e.g. 42 -> "$42.00", 42.5 -> "$42.50". */
export function formatUSD(value) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

/** A market price (0..1 probability) shown as a percentage, e.g. 0.62 -> "62%". */
export function formatProbability(price) {
  return `${Math.round(price * 100)}%`
}

/**
 * Prediction-market "cents" style label for a price, e.g. 0.48 -> "48¢".
 * This mirrors how Polymarket/Kalshi show share prices — purely cosmetic on
 * PLAY points, never a real cash price.
 */
export function formatCents(price) {
  return `${Math.round(price * 100)}¢`
}

/**
 * Convert a 0..1 probability into "decimal odds" style multiplier so users see
 * the potential payout of a winning bet. price 0.5 -> 2.00x, price 0.25 -> 4.00x.
 * This is purely cosmetic dopamine math on PLAY points — never money.
 */
export function priceToMultiplier(price) {
  if (price <= 0) return 0
  return 1 / price
}

/** Potential payout (in points) for a stake at a given price. */
export function potentialPayout(stake, price) {
  return Math.round(stake * priceToMultiplier(price))
}

/** Human-friendly date, e.g. "Jul 4, 2026". */
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Whole days until an ISO date (negative once past). */
export function daysUntilCount(iso) {
  const ms = new Date(iso).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

/** Short relative-ish label for how long until a market closes. */
export function daysUntil(iso) {
  const days = daysUntilCount(iso)
  if (days < 0) return 'Closed'
  if (days === 0) return 'Closes today'
  if (days === 1) return 'Closes tomorrow'
  return `Closes in ${days} days`
}

/**
 * Lifecycle status for a market based on its close date.
 *   'open'         — more than CLOSING_SOON_DAYS away
 *   'closing-soon' — within CLOSING_SOON_DAYS but not past
 *   'closed'       — past its close date (no new bets)
 */
const CLOSING_SOON_DAYS = 3
export function marketStatus(iso) {
  const days = daysUntilCount(iso)
  if (days < 0) return 'closed'
  if (days <= CLOSING_SOON_DAYS) return 'closing-soon'
  return 'open'
}

/** Whether a market is past its close date and should reject new bets. */
export function isMarketClosed(iso) {
  return marketStatus(iso) === 'closed'
}

/** A short calendar day key in local time, e.g. "2026-06-21". Used for streaks. */
export function dayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whole-day difference between two day keys (b - a), e.g. consecutive -> 1. */
export function daysBetween(aKey, bKey) {
  if (!aKey || !bKey) return Infinity
  const a = new Date(`${aKey}T00:00:00`).getTime()
  const b = new Date(`${bKey}T00:00:00`).getTime()
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

/** Format seconds as M:SS for the urge-cooldown timer. */
export function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
