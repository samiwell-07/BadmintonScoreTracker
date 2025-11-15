export type PlayerId = 'playerA' | 'playerB'

export interface PlayerState {
  id: PlayerId
  name: string
  points: number
  games: number
}

export interface MatchState {
  players: PlayerState[]
  raceTo: number
  maxPoint: number
  winByTwo: boolean
  bestOf: (typeof BEST_OF_OPTIONS)[number]
  server: PlayerId
  lastUpdated: number
  matchWinner: PlayerId | null
}

export const STORAGE_KEY = 'bst-score-state'
export const HISTORY_LIMIT = 25
export const BEST_OF_OPTIONS = [1, 3, 5] as const

export const getDefaultName = (playerId: PlayerId) =>
  playerId === 'playerA' ? 'Player A' : 'Player B'

export const DEFAULT_STATE: MatchState = {
  players: [
    { id: 'playerA', name: 'Player A', points: 0, games: 0 },
    { id: 'playerB', name: 'Player B', points: 0, games: 0 },
  ],
  raceTo: 21,
  maxPoint: 30,
  winByTwo: true,
  bestOf: 3,
  server: 'playerA',
  lastUpdated: Date.now(),
  matchWinner: null,
}
