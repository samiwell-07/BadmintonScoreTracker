import type { MatchSettings } from './matchSettings'
import type { SideId } from './scoreboard.types'

export function getGameWinner(
  leftScore: number,
  rightScore: number,
  settings: MatchSettings,
): SideId | null {
  if (leftScore === rightScore) {
    return null
  }

  const leader: SideId = leftScore > rightScore ? 'left' : 'right'
  const leadingScore = Math.max(leftScore, rightScore)
  const trailingScore = Math.min(leftScore, rightScore)

  if (leadingScore < settings.pointsToWin) {
    return null
  }

  if (leadingScore >= settings.maximumScore) {
    return leader
  }

  if (!settings.winByTwo || leadingScore - trailingScore >= 2) {
    return leader
  }

  return null
}