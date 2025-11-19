const fallbackId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId()

export const createGameId = () => randomId()

export const createMatchId = () => randomId()

export const createProfileId = () => randomId()
