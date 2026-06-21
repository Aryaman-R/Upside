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
