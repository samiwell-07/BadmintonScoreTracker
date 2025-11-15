import type { MatchState } from '../types/match'

export type MatchConfig = Pick<MatchState, 'maxPoint' | 'raceTo' | 'winByTwo'>

export const clampPoints = (value: number, maxPoint: number) =>
  Math.min(maxPoint, Math.max(0, value))

export const didWinGame = (
  playerScore: number,
  opponentScore: number,
  state: MatchConfig,
) => {
  if (playerScore >= state.maxPoint) {
    return true
  }

  if (playerScore < state.raceTo) {
    return false
  }

  if (!state.winByTwo) {
    return true
  }

  return playerScore - opponentScore >= 2
}

export const formatRelativeTime = (timestamp: number) => {
  const elapsedMs = Date.now() - timestamp
  const seconds = Math.floor(elapsedMs / 1000)

  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
