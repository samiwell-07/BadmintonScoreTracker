import { memo, useMemo } from 'react'
import { Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import type { PlayerId, PlayerProfile, PlayerState } from '../types/match'
import type { MatchConfig } from '../utils/match'
import { PlayerScoreCard } from './PlayerScoreCard'
import { getRotationSummary } from '../utils/doublesRotation'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import type { Translations } from '../i18n/translations'

interface PlayerGridSectionProps {
  players: PlayerState[]
  cardBg: string
  mutedText: string
  server: PlayerId
  matchWinner: PlayerId | null
  gamesNeeded: number
  matchConfig: MatchConfig
  matchIsLive: boolean
  savedNames: PlayerProfile[]
  doublesMode: boolean
  teammateServerMap: Record<PlayerId, string>
  winningStreaks: Record<PlayerId, number>
  favoritePlayerIds: PlayerId[]
  isTabletLandscape?: boolean
  onNameChange: (playerId: PlayerId, name: string) => void
  onPointChange: (playerId: PlayerId, delta: number) => void
  onApplySavedName: (playerId: PlayerId, profile: PlayerProfile) => void
  onSaveName: (playerId: PlayerId) => void
  onTeammateNameChange: (playerId: PlayerId, teammateId: string, name: string) => void
  onSaveTeammateName: (playerId: PlayerId, teammateId: string) => void
  onSwapTeammates: (playerId: PlayerId) => void
  onToggleFavorite: (playerId: PlayerId) => void
  t: Translations
}

const PlayerGridSectionComponent = ({
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
  winningStreaks,
  favoritePlayerIds,
  isTabletLandscape = false,
  onNameChange,
  onPointChange,
  onApplySavedName,
  onSaveName,
  onTeammateNameChange,
  onSaveTeammateName,
  onSwapTeammates,
  onToggleFavorite,
  t,
}: PlayerGridSectionProps) => {
  const { isLandscape, isMobile, screenSize } = useDeviceDetect()
  
  // Use landscape layout when: explicitly set, or device is in landscape and not tiny mobile
  const useLandscapeLayout = isTabletLandscape || (isLandscape && screenSize !== 'small')
  
  const rotationSummary = useMemo(
    () =>
      doublesMode && players.length >= 2
        ? getRotationSummary(players, server, teammateServerMap)
        : null,
    [doublesMode, players, server, teammateServerMap],
  )

  return (
    <Stack gap="md">
      {rotationSummary && (
        <Paper withBorder radius="lg" p="md" style={{ backgroundColor: cardBg }}>
          <Stack gap={4}>
            <Text size="sm" fw={600} c={mutedText}>
              {t.rotation.heading}
            </Text>
            <Text size="sm">
              {t.rotation.servingSentence(
                rotationSummary.servingTeamName,
                rotationSummary.courtSide,
                rotationSummary.servingPartnerName,
              )}
            </Text>
            <Text size="sm" c={mutedText}>
              {t.rotation.receivingSentence(
                rotationSummary.receivingTeamName,
                rotationSummary.receivingPartnerName,
              )}
            </Text>
          </Stack>
        </Paper>
      )}

      <SimpleGrid 
        cols={useLandscapeLayout ? 2 : { base: 1, md: 2 }} 
        spacing={useLandscapeLayout ? 'md' : 'lg'}
      >
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
              winningStreak={winningStreaks[player.id]}
              isFavorite={favoritePlayerIds.includes(player.id)}
              onNameChange={onNameChange}
              onPointChange={onPointChange}
              onApplySavedName={onApplySavedName}
              onSaveName={onSaveName}
              onTeammateNameChange={onTeammateNameChange}
              onSaveTeammateName={onSaveTeammateName}
              onSwapTeammates={onSwapTeammates}
              onToggleFavorite={onToggleFavorite}
              t={t}
            />
          )
        })}
      </SimpleGrid>
    </Stack>
  )
}

export const PlayerGridSection = memo(PlayerGridSectionComponent)
PlayerGridSection.displayName = 'PlayerGridSection'
