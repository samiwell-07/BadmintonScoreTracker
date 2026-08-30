import type { MatchSettings } from './matchSettings'

export type SideId = 'left' | 'right'
export type PlayerIndex = 0 | 1
export type PlayerNames = [string, string]

export interface ScoreSideState {
  id: SideId
  name: string
  playerNames: PlayerNames
  score: number
}

export interface CompletedSet {
  setNumber: number
  leftName: string
  rightName: string
  leftScore: number
  rightScore: number
  winner: SideId
  rules: MatchSettings
  previousLeftScore?: number
  previousRightScore?: number
  previousDoublesService?: DoublesServiceState | null
  previousServingSide?: SideId | null
}

export type MatchPhase = 'playing' | 'gameWon' | 'matchWon'

export interface DoublesServiceState {
  leftCourtPlayerIndexes: Record<SideId, PlayerIndex>
  servingPlayerIndex: PlayerIndex | null
}

export interface MatchState {
  sides: Record<SideId, ScoreSideState>
  servingSide: SideId | null
  completedSets: CompletedSet[]
  phase: MatchPhase
  matchWinner: SideId | null
  resultDialogOpen: boolean
  activeRules: MatchSettings | null
  doublesService: DoublesServiceState | null
}