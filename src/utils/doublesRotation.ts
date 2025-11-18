import type { PlayerId, PlayerState } from '../types/match'

type CourtSide = 'right' | 'left'

export interface RotationSummary {
  servingTeamName: string
  servingPartnerName: string
  receivingTeamName: string
  receivingPartnerName: string
  courtSide: CourtSide
}

const pickPartnerName = (team: PlayerState, teammateServerMap: Record<PlayerId, string>) => {
  if (team.teammates.length === 0) {
    return team.name
  }

  const preferredId = teammateServerMap[team.id]
  const preferredMate = team.teammates.find((mate) => mate.id === preferredId)
  const fallbackMate = preferredMate ?? team.teammates[0]
  return fallbackMate?.name?.trim().length ? fallbackMate.name : team.name
}

export const getRotationSummary = (
  players: PlayerState[],
  server: PlayerId,
  teammateServerMap: Record<PlayerId, string>,
): RotationSummary | null => {
  if (players.length < 2) {
    return null
  }

  const servingTeam = players.find((player) => player.id === server)
  const receivingTeam = players.find((player) => player.id !== server)

  if (!servingTeam || !receivingTeam) {
    return null
  }

  const servingPartnerName = pickPartnerName(servingTeam, teammateServerMap)
  const receivingPartnerName = pickPartnerName(receivingTeam, teammateServerMap)
  const courtSide: CourtSide = servingTeam.points % 2 === 0 ? 'right' : 'left'

  return {
    servingTeamName: servingTeam.name,
    servingPartnerName,
    receivingTeamName: receivingTeam.name,
    receivingPartnerName,
    courtSide,
  }
}
