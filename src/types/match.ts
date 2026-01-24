export type PlayerId = 'playerA' | 'playerB'

// Match tags for categorization
export const MATCH_TAGS = ['training', 'league', 'friendly', 'tournament'] as const
export type MatchTag = (typeof MATCH_TAGS)[number]

// Point-by-point history for momentum tracking
export interface PointEvent {
  id: string
  timestamp: number
  scorerId: PlayerId
  scoreSnapshot: Record<PlayerId, number>
  gameNumber: number
}

// Match notes for coaching
export interface MatchNote {
  id: string
  timestamp: number
  gameNumber: number
  scoreSnapshot: Record<PlayerId, number>
  text: string
}

// Action types for undo history
export const HISTORY_ACTION_TYPES = [
  'point',
  'name-change',
  'server-toggle',
  'swap-ends',
  'reset-game',
  'reset-match',
  'settings-change',
  'tag-change',
  'note-add',
  'note-delete',
  'other',
] as const
export type HistoryActionType = (typeof HISTORY_ACTION_TYPES)[number]

// Head-to-head record between two players
export interface HeadToHeadRecord {
  player1Name: string
  player2Name: string
  player1Wins: number
  player2Wins: number
  lastPlayed: number
  matchIds: string[]
}

export interface TeammateState {
  id: string
  name: string
}

export const PROFILE_COLORS = [
  'teal',
  'grape',
  'blue',
  'cyan',
  'violet',
  'orange',
] as const

export type ProfileColor = (typeof PROFILE_COLORS)[number]

export interface PlayerProfile {
  id: string
  label: string
  color: ProfileColor
  icon?: string
}

export interface PlayerState {
  id: PlayerId
  name: string
  points: number
  games: number
  teammates: TeammateState[]
  profileId: string | null
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
  completedGames: CompletedGame[]
  clockRunning: boolean
  clockStartedAt: number | null
  clockElapsedMs: number
  savedNames: PlayerProfile[]
  doublesMode: boolean
  teammateServerMap: Record<PlayerId, string>
  favoritePlayerIds: PlayerId[]
  // New: point-by-point history for momentum chart
  pointHistory: PointEvent[]
  // New: match tags for categorization
  tags: MatchTag[]
  // New: match notes for coaching
  notes: MatchNote[]
}

export const STORAGE_KEY = 'bst-score-state'
export const HISTORY_LIMIT = 25
export const BEST_OF_OPTIONS = [1, 3, 5] as const
export const GAME_HISTORY_LIMIT = 50
export const SAVED_NAMES_LIMIT = 8
export const MATCH_SUMMARY_STORAGE_KEY = 'bst-completed-matches'
export const MATCH_SUMMARY_LIMIT = 50

export interface CompletedMatchPlayerSummary {
  playerId: PlayerId
  name: string
  pointsScored: number
  gamesWon: number
  wonMatch: boolean
  profileId: string | null
}

export interface CompletedGame {
  id: string
  number: number
  timestamp: number
  winnerId: PlayerId
  winnerName: string
  durationMs: number
  scores: Record<PlayerId, { name: string; points: number }>
}

export interface CompletedMatchSummary {
  id: string
  completedAt: number
  durationMs: number
  gamesPlayed: number
  totalRallies: number
  raceTo: number
  bestOf: (typeof BEST_OF_OPTIONS)[number]
  winByTwo: boolean
  doublesMode: boolean
  winnerId: PlayerId
  winnerName: string
  players: CompletedMatchPlayerSummary[]
  // New: tags for match categorization
  tags: MatchTag[]
  // New: point-by-point history for momentum chart
  pointHistory: PointEvent[]
  // New: match notes
  notes: MatchNote[]
}

export const getDefaultName = (playerId: PlayerId) =>
  playerId === 'playerA' ? 'Player A' : 'Player B'

export const getDefaultTeammates = (playerId: PlayerId): TeammateState[] => {
  const baseLabel = getDefaultName(playerId)
  return [1, 2].map((position) => ({
    id: `${playerId}-mate-${position}`,
    name: `${baseLabel} ${position}`,
  }))
}

export const createDefaultTeammateServerMap = (): Record<PlayerId, string> => ({
  playerA: getDefaultTeammates('playerA')[0].id,
  playerB: getDefaultTeammates('playerB')[0].id,
})

export const DEFAULT_STATE: MatchState = {
  players: [
    {
      id: 'playerA',
      name: 'Player A',
      points: 0,
      games: 0,
      teammates: getDefaultTeammates('playerA'),
      profileId: null,
    },
    {
      id: 'playerB',
      name: 'Player B',
      points: 0,
      games: 0,
      teammates: getDefaultTeammates('playerB'),
      profileId: null,
    },
  ],
  raceTo: 21,
  maxPoint: 30,
  winByTwo: true,
  bestOf: 3,
  server: 'playerA',
  lastUpdated: Date.now(),
  matchWinner: null,
  completedGames: [],
  clockRunning: true,
  clockStartedAt: Date.now(),
  clockElapsedMs: 0,
  savedNames: [],
  doublesMode: false,
  teammateServerMap: createDefaultTeammateServerMap(),
  favoritePlayerIds: [],
  pointHistory: [],
  tags: [],
  notes: [],
}
