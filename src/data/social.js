// Mock social graph. Like the rest of Upside, these are fictional players with
// PLAY-money point totals — there is no real network, server, or messaging.
// Friends/groups/challenges live in local state so the social UX is fully
// interactive; real multiplayer would require a backend (see HANDOFF).

export const SUGGESTED_FRIENDS = [
  { id: 'u-quinn', name: 'Quinn Avila', avatar: '🦊', points: 24850, streak: 7 },
  { id: 'u-mara', name: 'Mara Devlin', avatar: '🐬', points: 21320, streak: 3 },
  { id: 'u-theo', name: 'Theo Park', avatar: '🦉', points: 18990, streak: 12 },
  { id: 'u-nadia', name: 'Nadia Brooks', avatar: '🐝', points: 16740, streak: 0 },
  { id: 'u-leo', name: 'Leo Marchetti', avatar: '🦅', points: 14210, streak: 5 },
  { id: 'u-sasha', name: 'Sasha Kim', avatar: '🐳', points: 12080, streak: 2 },
  { id: 'u-omar', name: 'Omar Reyes', avatar: '🐢', points: 9650, streak: 1 },
  { id: 'u-priya', name: 'Priya Nair', avatar: '🦌', points: 7430, streak: 4 },
]

// Emoji a user can stamp a group with.
export const GROUP_EMOJI = ['🏈', '🎯', '🎲', '🚀', '🔥', '🏆', '🍀', '⚡']

/** Look up any known person (friend or suggestion) by id. */
export function findPerson(id) {
  return SUGGESTED_FRIENDS.find((p) => p.id === id)
}
