import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { memo, useCallback, useState, useEffect, type FocusEvent, type KeyboardEvent } from 'react'
import type { MatchConfig } from '../utils/match'
import { didWinGame } from '../utils/match'
import type { PlayerId, PlayerProfile, PlayerState } from '../types/match'
import { SavedNamesMenu } from './SavedNamesMenu'
import type { Translations } from '../i18n/translations'

interface PlayerScoreCardProps {
  player: PlayerState
  opponent: PlayerState
  cardBg: string
  mutedText: string
  isServer: boolean
  matchWinner: PlayerId | null
  gamesNeeded: number
  matchConfig: MatchConfig
  matchIsLive: boolean
  savedNames: PlayerProfile[]
  doublesMode: boolean
  winningStreak: number
  isFavorite: boolean
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

const PlayerScoreCardComponent = ({
  player,
  opponent,
  cardBg,
  mutedText,
  isServer,
  matchWinner,
  gamesNeeded,
  matchConfig,
  matchIsLive,
  savedNames,
  doublesMode,
  winningStreak,
  isFavorite,
  onNameChange,
  onPointChange,
  onApplySavedName,
  onSaveName,
  onTeammateNameChange,
  onSaveTeammateName,
  onSwapTeammates,
  onToggleFavorite,
  t,
}: PlayerScoreCardProps) => {
  const theme = useMantineTheme()
  const [scoreKey, setScoreKey] = useState(0)
  
  // Trigger pop animation when points change by changing key
  useEffect(() => {
    setScoreKey((k) => k + 1)
  }, [player.points])
  
  const isGamePoint = didWinGame(player.points + 1, opponent.points, matchConfig)
  const isMatchPoint = isGamePoint && player.games === gamesNeeded - 1
  const isWinner = matchWinner === player.id
  const serviceCourtLabel = player.points % 2 === 0 ? t.rotation.court.right : t.rotation.court.left
  
  // Compute score display class based on state
  const hasStreak = winningStreak >= 5
  const showStreakOnly = hasStreak && !isMatchPoint && !matchWinner
  const showMatchPointOnly = isMatchPoint && !hasStreak && !matchWinner
  const showCombinedEffect = hasStreak && isMatchPoint && !matchWinner
  
  const scoreClassName = [
    'score-display',
    'score-pop',
    showCombinedEffect && 'score-combined',
    showStreakOnly && 'score-streak',
    showMatchPointOnly && 'score-match-point',
  ].filter(Boolean).join(' ')

  const handleNameBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      onNameChange(player.id, event.currentTarget.value)
    },
    [onNameChange, player.id],
  )

  const handleNameKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }
  }, [])

  const handlePointDelta = useCallback(
    (delta: number) => {
      onPointChange(player.id, delta)
    },
    [onPointChange, player.id],
  )

  const handleFavoriteToggle = useCallback(() => {
    onToggleFavorite(player.id)
  }, [onToggleFavorite, player.id])

  const handleSwapTeammatesClick = useCallback(() => {
    onSwapTeammates(player.id)
  }, [onSwapTeammates, player.id])

  const handleTeammateBlur = useCallback(
    (teammateId: string, value: string) => {
      onTeammateNameChange(player.id, teammateId, value)
    },
    [onTeammateNameChange, player.id],
  )

  const handleTeammateApply = useCallback(
    (teammateId: string, name: string) => {
      onTeammateNameChange(player.id, teammateId, name)
    },
    [onTeammateNameChange, player.id],
  )

  const handleTeammateSave = useCallback(
    (teammateId: string) => {
      onSaveTeammateName(player.id, teammateId)
    },
    [onSaveTeammateName, player.id],
  )

  const handleTeammateClear = useCallback(
    (teammateId: string) => {
      onTeammateNameChange(player.id, teammateId, '')
    },
    [onTeammateNameChange, player.id],
  )

  return (
    <Card
      withBorder
      radius="lg"
      p={{ base: 'md', sm: 'xl' }}
      shadow="xl"
      style={{
        backgroundColor: cardBg,
        borderColor: isWinner ? theme.colors.green[5] : theme.colors.gray[4],
        borderWidth: isWinner ? 2 : 1,
        overflow: 'hidden',
      }}
    >
      <Stack gap="lg" style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
          <Group gap="xs" align="flex-start" style={{ flex: 1, minWidth: 0 }} wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color={isFavorite ? 'yellow' : 'gray'}
              size="lg"
              onClick={handleFavoriteToggle}
              title={isFavorite ? t.playerCard.removeFromFavorites : t.playerCard.addToFavorites}
              style={{ flexShrink: 0 }}
            >
              {isFavorite ? <IconStarFilled size={20} /> : <IconStar size={20} />}
            </ActionIcon>
            <TextInput
              key={`${player.id}-${player.name}`}
              defaultValue={player.name}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              spellCheck={false}
              maxLength={24}
              style={{ flex: 1, minWidth: 0 }}
              styles={{
                input: {
                  fontSize: 'clamp(1rem, 4vw, 1.5rem)',
                  fontWeight: 700,
                  backgroundColor: 'transparent',
                  border: 'none',
                  paddingLeft: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            />
            <SavedNamesMenu
              savedNames={savedNames}
              menuPosition="bottom-end"
              onApply={(profile) => onApplySavedName(player.id, profile)}
              onSave={() => onSaveName(player.id)}
              saveLabel={t.playerCard.savePlayerName(player.name)}
              onClear={() => onNameChange(player.id, '')}
              clearLabel={t.playerCard.resetPlayerName}
              tooltipLabel={t.playerCard.savedNamesTooltip}
              t={t.savedNamesMenu}
            />
          </Group>
          <Group gap="xs" wrap="wrap">
            {isServer && (
              <Badge color="cyan" variant="light">
                {t.playerCard.serviceBadge(serviceCourtLabel)}
              </Badge>
            )}
            {isMatchPoint && (
              <Badge color="red" variant="filled">
                {t.playerCard.matchPoint}
              </Badge>
            )}
            {!isMatchPoint && isGamePoint && (
              <Badge color="orange" variant="light">
                {t.playerCard.gamePoint}
              </Badge>
            )}
            {isWinner && (
              <Badge color="green" variant="light">
                {t.playerCard.winner}
              </Badge>
            )}
          </Group>
        </Group>
        <Stack gap="md">
          <div>
            <Group align="flex-end" gap="xl" wrap="wrap">
              <div style={{ position: 'relative' }}>
                <Text size="sm" c={mutedText}>
                  {t.playerCard.pointsLabel}
                </Text>
                <Title
                  key={scoreKey}
                  order={1}
                  className={scoreClassName}
                  style={{
                    lineHeight: 1,
                    fontSize: 'clamp(2.5rem, 10vw, 4rem)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {player.points}
                </Title>
              </div>
              <div>
                <Text size="sm" c={mutedText}>
                  {t.playerCard.gamesWonLabel}
                </Text>
                <Title order={3} style={{ lineHeight: 1 }}>
                  {player.games}
                </Title>
              </div>
            </Group>
          </div>
          {doublesMode && (
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="sm" c={mutedText}>
                  {t.playerCard.teammateLineup}
                </Text>
                {player.teammates.length > 1 && (
                  <Button
                    size="xs"
                    variant="subtle"
                    color="teal"
                    onClick={handleSwapTeammatesClick}
                  >
                    {t.playerCard.switchTeammates}
                  </Button>
                )}
              </Group>
              {player.teammates.map((teammate) => (
                <Group key={`${teammate.id}-${teammate.name}`} gap="xs" align="flex-end">
                  <TextInput
                    defaultValue={teammate.name}
                    spellCheck={false}
                    maxLength={24}
                    size="xs"
                    flex={1}
                    onBlur={(event: FocusEvent<HTMLInputElement>) =>
                      handleTeammateBlur(teammate.id, event.currentTarget.value)
                    }
                  />
                  <SavedNamesMenu
                    savedNames={savedNames}
                    actionSize="sm"
                    iconSize={14}
                    tooltipLabel={t.playerCard.savedNamesTooltip}
                    menuPosition="bottom-end"
                    onApply={(profile) => handleTeammateApply(teammate.id, profile.label)}
                    onSave={() => handleTeammateSave(teammate.id)}
                    onClear={() => handleTeammateClear(teammate.id)}
                    saveLabel={t.playerCard.saveTeammateName(teammate.name || player.name)}
                    clearLabel={t.playerCard.clearTeammateName}
                    t={t.savedNamesMenu}
                  />
                </Group>
              ))}
            </Stack>
          )}
          <Group gap="xs" grow>
            <Button
              variant="light"
              color="gray"
              size="lg"
              onClick={() => handlePointDelta(-1)}
              disabled={player.points === 0}
            >
              -1
            </Button>
            <Button
              size="lg"
              color="teal"
              onClick={() => handlePointDelta(1)}
              disabled={!matchIsLive}
            >
              +1
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Card>
  )
}

export const PlayerScoreCard = memo(PlayerScoreCardComponent)
PlayerScoreCard.displayName = 'PlayerScoreCard'
