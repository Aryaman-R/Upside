// Reflection prompts used by the urge-intervention flow. The goal is to create
// a brief pause and a moment of self-awareness between the urge and any action.
// Rotating prompts keep the exercise from feeling rote.

export const REFLECTION_PROMPTS = [
  'What just happened that made you want to place a bet right now?',
  'How are you feeling in this moment — bored, stressed, excited, low?',
  'If you skip this bet, what could that money do for you this week?',
  'What would future-you, one month from now, want you to do right now?',
  'Name one thing you’re working toward that this money could go toward instead.',
  'What usually happens after you place a bet like this — honestly?',
  'Who in your life would you want to tell about the money you kept today?',
  'On a scale of 1–10, how strong is the urge — and what number will it be in 20 minutes?',
]

// Quick mood tags the user can pick before/after the cooldown. Purely local,
// stored alongside the journal entry for the user's own reflection.
export const MOOD_TAGS = [
  { id: 'stressed', label: 'Stressed', emoji: '😰' },
  { id: 'bored', label: 'Bored', emoji: '😐' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'low', label: 'Low', emoji: '😔' },
  { id: 'angry', label: 'Frustrated', emoji: '😤' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
]

/** Deterministic-ish prompt picker so the snapshot can vary by call count. */
export function pickPrompt(seed = 0) {
  return REFLECTION_PROMPTS[seed % REFLECTION_PROMPTS.length]
}
