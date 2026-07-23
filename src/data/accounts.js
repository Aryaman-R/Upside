// Institution catalogue for the (SIMULATED) account-connection mockups.
//
// IMPORTANT: none of this connects to anything. Picking an "institution" runs a
// short fake "connecting…" animation and stores a name + a random-looking masked
// number so the demo screens look real. No credentials are ever requested, sent,
// or stored, and no real financial account is ever reached. See ConnectAccountModal.

// The funding source that tops up your Upside balance (bank / debit).
export const FUNDING_INSTITUTIONS = [
  { id: 'chase', name: 'Chase', logo: '🏦' },
  { id: 'bofa', name: 'Bank of America', logo: '🏦' },
  { id: 'wells', name: 'Wells Fargo', logo: '🏦' },
  { id: 'citi', name: 'Citibank', logo: '🏦' },
  { id: 'capitalone', name: 'Capital One', logo: '🏦' },
  { id: 'usbank', name: 'U.S. Bank', logo: '🏦' },
]

// Destination account types a lost stake can be routed into. Each lists a few
// representative providers. `kind` matches ACCOUNT_KINDS in lib/format.js.
export const DESTINATION_TYPES = [
  {
    kind: 'roth_ira',
    label: 'Roth IRA',
    blurb: 'Tax-free growth for retirement — the recommended home for redirected losses.',
    icon: 'building',
    recommended: true,
    providers: [
      { id: 'fidelity', name: 'Fidelity' },
      { id: 'vanguard', name: 'Vanguard' },
      { id: 'schwab', name: 'Charles Schwab' },
      { id: 'robinhood', name: 'Robinhood' },
    ],
  },
  {
    kind: 'hysa',
    label: 'High-yield savings',
    blurb: 'Flexible, higher-interest savings you can reach anytime.',
    icon: 'savings',
    providers: [
      { id: 'ally', name: 'Ally Bank' },
      { id: 'marcus', name: 'Marcus by Goldman Sachs' },
      { id: 'sofi', name: 'SoFi' },
      { id: 'amex', name: 'American Express' },
    ],
  },
  {
    kind: 'traditional_ira',
    label: 'Traditional IRA',
    blurb: 'Tax-deferred retirement savings.',
    icon: 'building',
    providers: [
      { id: 'fidelity-t', name: 'Fidelity' },
      { id: 'vanguard-t', name: 'Vanguard' },
      { id: 'schwab-t', name: 'Charles Schwab' },
    ],
  },
  {
    kind: '401k',
    label: '401(k)',
    blurb: 'Roll redirected losses toward your employer retirement plan.',
    icon: 'building',
    providers: [
      { id: 'fidelity-4', name: 'Fidelity NetBenefits' },
      { id: 'empower', name: 'Empower' },
      { id: 'principal', name: 'Principal' },
    ],
  },
  {
    kind: '529',
    label: '529 college plan',
    blurb: 'Tax-advantaged education savings for you or a loved one.',
    icon: 'building',
    providers: [
      { id: 'my529', name: 'my529' },
      { id: 'bright', name: 'Bright Start' },
      { id: 'nysaves', name: "NY's 529" },
    ],
  },
]

// Find a destination type descriptor by its `kind`.
export function destinationType(kind) {
  return DESTINATION_TYPES.find((d) => d.kind === kind) || null
}

// A believable-looking 4-digit account mask, deterministic from a seed string so
// it stays stable without Math.random (which is unavailable in some contexts).
export function maskFrom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 10000
  return String(h).padStart(4, '0')
}
