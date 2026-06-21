// Mock prediction markets. Everything here is PLAY MONEY ("points") only —
// there is no real currency, no wagering, and no payout of anything of value.
//
// Market shape:
//   id          unique string
//   category    'Sports' | 'Crypto' | 'News' | 'Pop Culture' | 'Science'
//   question    the yes/no or multi-outcome question
//   closeDate   ISO date the market stops accepting bets
//   volume      cosmetic "points traded" figure for flavor
//   outcomes    array of { id, label, price }  where price is a 0..1 probability
//               (prices across a market's outcomes are designed to sum ~1.0)
//
// `price` doubles as the implied probability AND the inverse of the payout
// multiplier shown to the user (a 25% outcome pays 4x play-points if it hits).

export const MARKET_CATEGORIES = [
  'All',
  'Sports',
  'Crypto',
  'News',
  'Pop Culture',
  'Science',
]

export const MARKETS = [
  {
    id: 'mkt-lakers-playoffs',
    category: 'Sports',
    question: 'Will the Lakers make the playoffs this season?',
    closeDate: '2026-08-15',
    volume: 184200,
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.63 },
      { id: 'no', label: 'No', price: 0.37 },
    ],
  },
  {
    id: 'mkt-btc-100k',
    category: 'Crypto',
    question: 'Will Bitcoin close above $100,000 by the end of the quarter?',
    closeDate: '2026-09-30',
    volume: 421900,
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.48 },
      { id: 'no', label: 'No', price: 0.52 },
    ],
  },
  {
    id: 'mkt-fed-rate-cut',
    category: 'News',
    question: 'Will the Fed cut interest rates at the next meeting?',
    closeDate: '2026-07-29',
    volume: 312050,
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.71 },
      { id: 'no', label: 'No', price: 0.29 },
    ],
  },
  {
    id: 'mkt-oscars-bestpic',
    category: 'Pop Culture',
    question: 'Which film wins Best Picture at the next Academy Awards?',
    closeDate: '2026-12-01',
    volume: 98700,
    outcomes: [
      { id: 'horizon', label: 'The Long Horizon', price: 0.34 },
      { id: 'salt', label: 'Salt & Static', price: 0.27 },
      { id: 'mother', label: 'Mother Tongue', price: 0.22 },
      { id: 'field', label: 'A Field in Winter', price: 0.17 },
    ],
  },
  {
    id: 'mkt-worldcup-final',
    category: 'Sports',
    question: 'Will the home nation reach the World Cup final?',
    closeDate: '2026-07-10',
    volume: 530400,
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.41 },
      { id: 'no', label: 'No', price: 0.59 },
    ],
  },
  {
    id: 'mkt-eth-flip',
    category: 'Crypto',
    question: 'Will Ethereum outperform Bitcoin this month?',
    closeDate: '2026-07-01',
    volume: 215800,
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.45 },
      { id: 'no', label: 'No', price: 0.55 },
    ],
  },
  {
    id: 'mkt-spacex-launch',
    category: 'Science',
    question: 'Will the next crewed Starship test launch succeed on the first attempt?',
    closeDate: '2026-10-20',
    volume: 142300,
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.57 },
      { id: 'no', label: 'No', price: 0.43 },
    ],
  },
  {
    id: 'mkt-album-number-one',
    category: 'Pop Culture',
    question: 'Will the surprise-released album debut at #1 on the charts?',
    closeDate: '2026-06-28',
    volume: 76100,
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.68 },
      { id: 'no', label: 'No', price: 0.32 },
    ],
  },
  {
    id: 'mkt-heatwave-record',
    category: 'Science',
    question: 'Will this summer set a new global average-temperature record?',
    closeDate: '2026-09-22',
    volume: 119500,
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.74 },
      { id: 'no', label: 'No', price: 0.26 },
    ],
  },
  {
    id: 'mkt-election-turnout',
    category: 'News',
    question: 'Will voter turnout exceed 60% in the upcoming local election?',
    closeDate: '2026-11-03',
    volume: 88400,
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.39 },
      { id: 'no', label: 'No', price: 0.61 },
    ],
  },
]

/**
 * Look up a market by id. Returns undefined if not found.
 */
export function getMarketById(id) {
  return MARKETS.find((m) => m.id === id)
}

// ---------------------------------------------------------------------------
// Cosmetic market analytics (deterministic, derived from the market itself)
// ---------------------------------------------------------------------------
// To give cards a Polymarket-style "price chart" without inventing a backend,
// we synthesize a stable, deterministic price history for the leading outcome.
// It's seeded from the market id so it never flickers between renders and needs
// no stored data. Purely decorative — these are PLAY-money implied odds.

// Tiny deterministic string hash → 32-bit seed.
function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32 PRNG: deterministic 0..1 generator from a numeric seed.
function mulberry32(seed) {
  let a = seed
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Deterministic implied-probability history for a market's primary outcome.
 * Returns `points` values in 0..1 that drift toward the current price, so the
 * sparkline visually "lands" on today's odds. Stable across renders.
 */
export function priceHistory(market, points = 16) {
  const primary = market.outcomes[0]
  const target = primary.price
  const rand = mulberry32(hashSeed(market.id))
  // Start somewhere plausible, then mean-revert toward the current price.
  let v = clamp01(target + (rand() - 0.5) * 0.3)
  const series = []
  for (let i = 0; i < points; i += 1) {
    const pull = (target - v) * 0.18 // drift toward today's price
    const noise = (rand() - 0.5) * 0.08
    v = clamp01(v + pull + noise)
    series.push(v)
  }
  // Force the final point to exactly match the displayed price.
  series[series.length - 1] = target
  return series
}

function clamp01(n) {
  return Math.max(0.02, Math.min(0.98, n))
}

/** 7-day directional change (in points) for the primary outcome's odds. */
export function priceTrend(market) {
  const h = priceHistory(market)
  const delta = h[h.length - 1] - h[Math.max(0, h.length - 8)]
  return Math.round(delta * 100) // percentage points, signed
}

/** Cosmetic, deterministic "active traders" count for social proof on a card. */
export function marketTraders(market) {
  const rand = mulberry32(hashSeed(`${market.id}-traders`))
  return 200 + Math.round(rand() * 4800)
}
