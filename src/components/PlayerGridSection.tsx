import { Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import type { PlayerId, PlayerState } from '../types/match'
import type { MatchConfig } from '../utils/match'
import { PlayerScoreCard } from './PlayerScoreCard'
import { getRotationSummary } from '../utils/doublesRotation'

interface PlayerGridSectionProps {
  players: PlayerState[]
  cardBg: string
  mutedText: string
  server: PlayerId
  matchWinner: PlayerId | null
  gamesNeeded: number
  matchConfig: MatchConfig
  matchIsLive: boolean
  savedNames: string[]
  doublesMode: boolean
  teammateServerMap: Record<PlayerId, string>
  onNameChange: (playerId: PlayerId, name: string) => void
  onPointChange: (playerId: PlayerId, delta: number) => void
  onApplySavedName: (playerId: PlayerId, name: string) => void
  onSaveName: (playerId: PlayerId) => void
  onTeammateNameChange: (playerId: PlayerId, teammateId: string, name: string) => void
  onSaveTeammateName: (playerId: PlayerId, teammateId: string) => void
  onSwapTeammates: (playerId: PlayerId) => void
}

export const PlayerGridSection = ({
  players,
  cardBg,
  mutedText,
  server,
  matchWinner,
  gamesNeeded,
  matchConfig,
  matchIsLive,
  savedNames,
  doublesMode,
  teammateServerMap,
  onNameChange,
  onPointChange,
  onApplySavedName,
  onSaveName,
  onTeammateNameChange,
  onSaveTeammateName,
  onSwapTeammates,
}: PlayerGridSectionProps) => {
  const rotationSummary =
    doublesMode && players.length >= 2
      ? getRotationSummary(players, server, teammateServerMap)
      : null

  return (
    <Stack gap="md">
      {rotationSummary && (
        <Paper withBorder radius="lg" p="md" style={{ backgroundColor: cardBg }}>
          <Stack gap={4}>
            <Text size="sm" fw={600} c={mutedText}>
              Doubles rotation
            </Text>
            <Text size="sm">
              {`${rotationSummary.servingTeamName} serving from the ${rotationSummary.courtSide === 'right' ? 'right court' : 'left court'} with ${rotationSummary.servingPartnerName}.`}
            </Text>
            <Text size="sm" c={mutedText}>
              {`${rotationSummary.receivingTeamName} receiving with ${rotationSummary.receivingPartnerName}.`}
            </Text>
          </Stack>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {players.map((player, index) => {
          const opponent = players[(index + 1) % players.length]
          const isServer = server === player.id

          return (
            <PlayerScoreCard
              key={`${player.id}-${player.name}`}
              player={player}
              opponent={opponent}
              cardBg={cardBg}
              mutedText={mutedText}
              isServer={isServer}
              matchWinner={matchWinner}
              gamesNeeded={gamesNeeded}
              matchConfig={matchConfig}
              matchIsLive={matchIsLive}
              savedNames={savedNames}
              doublesMode={doublesMode}
              onNameChange={onNameChange}
              onPointChange={onPointChange}
              onApplySavedName={onApplySavedName}
              onSaveName={onSaveName}
              onTeammateNameChange={onTeammateNameChange}
              onSaveTeammateName={onSaveTeammateName}
              onSwapTeammates={onSwapTeammates}
            />
          )
        })}
      </SimpleGrid>
    </Stack>
  )
}
