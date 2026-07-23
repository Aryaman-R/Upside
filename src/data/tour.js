// Guided-walkthrough steps for the funded "you can't really lose" model.
// Each step is pure data; GuidedTour.jsx navigates to `route`, spotlights the
// element with a matching `data-tour={anchor}` (or centers the card when null),
// and shows the copy below. Keep the copy warm and non-judgmental.

export const TOUR_STEPS = [
  {
    id: 'intro',
    route: '/',
    anchor: null,
    title: 'Win it, or invest it.',
    body: "It's a Tuesday, the game's on, and there's that familiar pull to put money on it. Upside keeps the thrill and changes the ending: predict with a funded balance, and if it doesn't go your way, the money lands in your future — not the house's pocket. Two minutes to see how?",
    cta: 'Show me',
  },
  {
    id: 'connect',
    route: '/connect',
    anchor: 'connect-funding',
    title: 'First, the engine.',
    body: 'You fund your Upside balance from your bank — that\'s what you predict with. In this demo every connection is simulated; no login is ever requested and no real money moves.',
  },
  {
    id: 'destinations',
    route: '/connect',
    anchor: 'connect-destinations',
    title: 'Where a loss goes.',
    body: "Link a Roth IRA, a high-yield savings account, or another retirement account. When a prediction loses, your stake (minus a small fee) is routed here instead of vanishing. That's the whole idea — a loss becomes money invested in you.",
  },
  {
    id: 'balances',
    route: '/',
    anchor: 'topbar-balances',
    title: 'Your three numbers.',
    body: 'Balance is what you predict with. Invested is the number that actually matters — money kept and growing. Streak is just days you showed up. These follow you on every screen.',
  },
  {
    id: 'markets',
    route: '/markets',
    anchor: 'markets-card',
    title: 'Real questions, real stakes.',
    body: 'These are live forecasts on real events — sports, crypto, the news. The big number is the crowd\'s odds; a long shot pays more if you\'re right. Tap Yes or No on any market to open a prediction.',
  },
  {
    id: 'betslip',
    route: '/markets',
    anchor: 'markets-card',
    title: 'Every ticket has two good endings.',
    body: "Open a prediction and you'll see it plainly: win, and the profit lands in your balance. Lose, and your stake goes into your Roth IRA. There's a small fee on losses — that's how Upside keeps the lights on — but either way, the money stays yours.",
  },
  {
    id: 'portfolio',
    route: '/portfolio',
    anchor: 'settle-position',
    title: 'The sweat, then the reveal.',
    body: "Your open predictions live here. Tonight you don't have to wait — “Simulate result” settles one now, at the odds it was priced. Win and your balance jumps; lose and you'll watch it invest instead. Either way, notice your net worth never really drops.",
  },
  {
    id: 'invested',
    route: '/money-kept',
    anchor: 'money-kept-form',
    title: 'Watch it compound.',
    body: 'Every routed loss and redirected urge adds up here, split across your real accounts. About to bet somewhere else? Redirect that impulse straight into savings — no fee, all yours.',
  },
  {
    id: 'pause',
    route: '/',
    anchor: 'take-a-pause',
    title: 'When the urge is too big for a button.',
    body: "“Take a pause” is always one tap away — thirty seconds to breathe, a moment to reflect, and real help lines if you need them. It never locks, not even during a break, and nothing you write leaves your device.",
  },
  {
    id: 'limits',
    route: '/settings',
    anchor: 'play-limits',
    title: 'You hold the keys.',
    body: 'Cap how much you can stake per day, or take a break that pauses all predicting — and end it early whenever you like. One thing never locks: the pause button and your invested savings. Safety doesn\'t take nights off.',
  },
  {
    id: 'outro',
    route: '/',
    anchor: null,
    title: 'One evening, two endings.',
    body: "That's the loop: predict with your balance, keep every win, and turn every loss into money invested in your future. The next urge is coming — that's just a Tuesday. Now you know exactly where to put it.",
    cta: 'Start my evening',
  },
]
