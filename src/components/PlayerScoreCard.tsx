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
import { memo, useCallback, type FocusEvent, type KeyboardEvent } from 'react'
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
  const isGamePoint = didWinGame(player.points + 1, opponent.points, matchConfig)
  const isMatchPoint = isGamePoint && player.games === gamesNeeded - 1
  const isWinner = matchWinner === player.id
  const serviceCourtLabel = player.points % 2 === 0 ? t.rotation.court.right : t.rotation.court.left

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
      p="xl"
      shadow="xl"
      style={{
        backgroundColor: cardBg,
        borderColor: isWinner ? theme.colors.green[5] : theme.colors.gray[4],
        borderWidth: isWinner ? 2 : 1,
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" gap="sm">
          <Group gap="xs" align="flex-start" style={{ flex: 1 }} wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color={isFavorite ? 'yellow' : 'gray'}
              size="lg"
              onClick={handleFavoriteToggle}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
              flex={1}
              styles={{
                input: {
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  backgroundColor: 'transparent',
                  border: 'none',
                  paddingLeft: 0,
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
                {(() => {
                  // Scale intensity based on streak (5 = base, 10+ = max)
                  const streakIntensity = Math.min((winningStreak - 4) / 6, 1) // 0 at 5, 1 at 10+
                  const pulseSpeed = Math.max(0.4, 1.5 - streakIntensity * 1.1) // 1.5s at 5, 0.4s at 10+
                  const flickerSpeed = Math.max(0.2, 0.8 - streakIntensity * 0.6) // 0.8s at 5, 0.2s at 10+
                  const glowSize = 15 + streakIntensity * 25 // 15px at 5, 40px at 10+
                  const fieldSize = 120 + streakIntensity * 60 // 120% at 5, 180% at 10+
                  const fieldOpacity = 0.3 + streakIntensity * 0.4 // 0.3 at 5, 0.7 at 10+
                  
                  const hasStreak = winningStreak >= 5
                  const showStreakOnly = hasStreak && !isMatchPoint && !matchWinner
                  const showMatchPointOnly = isMatchPoint && !hasStreak && !matchWinner
                  const showCombinedEffect = hasStreak && isMatchPoint && !matchWinner

                  return (
                    <>
                      <Title
                        order={1}
                        style={{
                          lineHeight: 1,
                          fontSize: '4rem',
                          position: 'relative',
                          zIndex: 1,
                          ...(showMatchPointOnly && {
                            animation: 'matchPointPulse 2s ease-in-out infinite',
                            textShadow: '0 0 20px #ffd700, 0 0 40px #ffd700',
                          }),
                          ...(showStreakOnly && {
                            animation: `energyPulse-${winningStreak} ${pulseSpeed}s ease-in-out infinite`,
                            textShadow: `0 0 ${glowSize}px #ff4500, 0 0 ${glowSize * 2}px #ff6b00, 0 0 ${glowSize * 3}px #ff8c00`,
                          }),
                          ...(showCombinedEffect && {
                            animation: `combinedPulse-${winningStreak} ${pulseSpeed * 0.8}s ease-in-out infinite`,
                            textShadow: `0 0 ${glowSize * 1.2}px #9932cc, 0 0 ${glowSize * 2.4}px #8a2be2, 0 0 ${glowSize * 3.6}px #9400d3`,
                          }),
                        }}
                      >
                        {player.points}
                      </Title>
                      {(showStreakOnly || showCombinedEffect) && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: `${fieldSize}%`,
                            height: `${fieldSize}%`,
                            background: showCombinedEffect
                              ? `radial-gradient(ellipse at center, rgba(148, 0, 211, ${fieldOpacity}) 0%, rgba(138, 43, 226, ${fieldOpacity * 0.5}) 40%, transparent 70%)`
                              : `radial-gradient(ellipse at center, rgba(255, 100, 0, ${fieldOpacity}) 0%, rgba(255, 69, 0, ${fieldOpacity * 0.5}) 40%, transparent 70%)`,
                            animation: `flameFlicker-${winningStreak} ${flickerSpeed}s ease-in-out infinite alternate`,
                            borderRadius: '50%',
                            zIndex: 0,
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                      {showMatchPointOnly && (
                        <style>{`
                          @keyframes matchPointPulse {
                            0%, 100% {
                              text-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3);
                            }
                            50% {
                              text-shadow: 0 0 25px rgba(255, 215, 0, 0.9), 0 0 50px rgba(255, 215, 0, 0.6), 0 0 75px rgba(255, 215, 0, 0.3);
                            }
                          }
                        `}</style>
                      )}
                      {showStreakOnly && (
                        <style>{`
                          @keyframes energyPulse-${winningStreak} {
                            0%, 100% {
                              text-shadow: 0 0 ${glowSize * 0.7}px rgba(255, 69, 0, 0.6), 0 0 ${glowSize * 1.3}px rgba(255, 107, 0, 0.4), 0 0 ${glowSize * 2}px rgba(255, 140, 0, 0.2);
                            }
                            50% {
                              text-shadow: 0 0 ${glowSize * 1.3}px rgba(255, 69, 0, 0.9), 0 0 ${glowSize * 2.7}px rgba(255, 107, 0, 0.6), 0 0 ${glowSize * 4}px rgba(255, 140, 0, 0.4);
                            }
                          }
                          @keyframes flameFlicker-${winningStreak} {
                            0% {
                              opacity: ${0.6 + streakIntensity * 0.2};
                              transform: translate(-50%, -50%) scale(1);
                            }
                            100% {
                              opacity: 1;
                              transform: translate(-50%, -50%) scale(${1 + streakIntensity * 0.15});
                            }
                          }
                        `}</style>
                      )}
                      {showCombinedEffect && (
                        <style>{`
                          @keyframes combinedPulse-${winningStreak} {
                            0%, 100% {
                              text-shadow: 0 0 ${glowSize * 0.8}px rgba(148, 0, 211, 0.6), 0 0 ${glowSize * 1.6}px rgba(138, 43, 226, 0.4), 0 0 ${glowSize * 2.4}px rgba(153, 50, 204, 0.2);
                            }
                            50% {
                              text-shadow: 0 0 ${glowSize * 1.5}px rgba(148, 0, 211, 0.9), 0 0 ${glowSize * 3}px rgba(138, 43, 226, 0.6), 0 0 ${glowSize * 4.5}px rgba(153, 50, 204, 0.4);
                            }
                          }
                          @keyframes flameFlicker-${winningStreak} {
                            0% {
                              opacity: ${0.6 + streakIntensity * 0.2};
                              transform: translate(-50%, -50%) scale(1);
                            }
                            100% {
                              opacity: 1;
                              transform: translate(-50%, -50%) scale(${1 + streakIntensity * 0.15});
                            }
                          }
                        `}</style>
                      )}
                    </>
                  )
                })()}
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
