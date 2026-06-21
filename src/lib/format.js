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

/** Short relative-ish label for how long until a market closes. */
export function daysUntil(iso) {
  const ms = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
  if (days < 0) return 'Closed'
  if (days === 0) return 'Closes today'
  if (days === 1) return 'Closes tomorrow'
  return `Closes in ${days} days`
}

/** Format seconds as M:SS for the urge-cooldown timer. */
export function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
