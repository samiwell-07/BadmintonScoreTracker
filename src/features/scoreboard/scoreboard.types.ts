import type { MatchSettings } from './matchSettings'

export type SideId = 'left' | 'right'

export interface ScoreSideState {
  id: SideId
  name: string
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
}

export type MatchPhase = 'playing' | 'gameWon' | 'matchWon'

export interface MatchState {
  sides: Record<SideId, ScoreSideState>
  servingSide: SideId | null
  completedSets: CompletedSet[]
  phase: MatchPhase
  matchWinner: SideId | null
  resultDialogOpen: boolean
  activeRules: MatchSettings | null
}