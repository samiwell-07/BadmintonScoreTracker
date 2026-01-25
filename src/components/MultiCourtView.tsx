import { useCallback, useEffect, useRef, useState } from 'react'
import { ActionIcon, Badge, Button, Card, Group, NumberInput, Popover, Stack, Text, TextInput } from '@mantine/core'
import { IconMinus, IconPlus, IconRefresh, IconSettings, IconSquarePlus } from '@tabler/icons-react'
import { useMultiCourt, type Court } from '../hooks/useMultiCourt'
import { SavedNamesMenu } from './SavedNamesMenu'
import type { Translations } from '../i18n/translations'
import type { PlayerProfile, CompletedMatchSummary } from '../types/match'

const SCORE_COOLDOWN_MS = 100

interface CourtCardProps {
  court: Court
  cardBg: string
  savedNames: PlayerProfile[]
  onScoreChange: (player: 'playerA' | 'playerB', delta: number) => void
  onNameChange: (player: 'playerA' | 'playerB', name: string) => void
  onCourtNameChange: (name: string) => void
  onReset: () => void
  onSaveName: (player: 'playerA' | 'playerB') => void
  onApplySavedName: (player: 'playerA' | 'playerB', profile: PlayerProfile) => void
  onRaceToChange: (raceTo: number) => void
  t: Translations
}

const CourtCard = ({
  court,
  cardBg,
  savedNames,
  onScoreChange,
  onNameChange,
  onCourtNameChange,
  onReset,
  onSaveName,
  onApplySavedName,
  onRaceToChange,
  t,
}: CourtCardProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const lastScoreChangeRef = useRef<number>(0)

  // Check if either player is at game point or won
  const playerAWon = court.playerA.score >= court.raceTo
  const playerBWon = court.playerB.score >= court.raceTo
  const matchFinished = playerAWon || playerBWon
  const playerAGamePoint = !matchFinished && court.playerA.score === court.raceTo - 1
  const playerBGamePoint = !matchFinished && court.playerB.score === court.raceTo - 1

  // Only allow score change if match is not finished and cooldown has passed
  const handleScoreChange = useCallback((player: 'playerA' | 'playerB', delta: number) => {
    const now = Date.now()
    if (now - lastScoreChangeRef.current < SCORE_COOLDOWN_MS) {
      return // Still in cooldown
    }
    if (!matchFinished || delta < 0) {
      lastScoreChangeRef.current = now
      onScoreChange(player, delta)
    }
  }, [matchFinished, onScoreChange])

  return (
    <Card withBorder radius="lg" p="sm" style={{ backgroundColor: cardBg }}>
      <Stack gap="xs">
        {/* Court Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <TextInput
              value={court.name}
              onChange={(e) => onCourtNameChange(e.currentTarget.value)}
              variant="unstyled"
              size="sm"
              fw={600}
              styles={{
                input: { fontWeight: 600, fontSize: '1rem', padding: 0, width: 'auto' },
              }}
            />
            <Text size="xs" c="dimmed">({t.multicourt?.raceTo ?? 'Race to'} {court.raceTo})</Text>
            {matchFinished && (
              <Badge color="green" variant="filled" size="sm">
                {t.multicourt?.finished ?? 'Finished'}
              </Badge>
            )}
          </Group>
          <Group gap={4}>
            <Popover opened={settingsOpen} onChange={setSettingsOpen} position="bottom-end" withArrow>
              <Popover.Target>
                <ActionIcon 
                  variant="subtle" 
                  size="sm" 
                  onClick={() => setSettingsOpen((o) => !o)} 
                  title={t.multicourt?.settings ?? 'Settings'}
                >
                  <IconSettings size={16} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="xs">
                  <Text size="sm" fw={500}>{t.multicourt?.matchSettings ?? 'Match Settings'}</Text>
                  <NumberInput
                    label={t.multicourt?.raceTo ?? 'Race to'}
                    value={court.raceTo}
                    onChange={(val) => {
                      if (typeof val === 'number' && val > 0) {
                        onRaceToChange(val)
                      }
                    }}
                    min={1}
                    max={50}
                    size="xs"
                  />
                </Stack>
              </Popover.Dropdown>
            </Popover>
            <ActionIcon variant="subtle" size="sm" onClick={onReset} title={t.multicourt?.reset ?? 'Reset'}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Players Row */}
        <Group grow gap="xs">
          {/* Player A */}
          <Card
            withBorder
            radius="md"
            p="xs"
            style={{ 
              textAlign: 'center',
              borderColor: playerAWon ? 'var(--mantine-color-green-6)' : playerAGamePoint ? 'var(--mantine-color-yellow-6)' : undefined,
              borderWidth: playerAWon || playerAGamePoint ? 2 : undefined,
            }}
          >
            <Stack gap={4} align="center">
              <Group gap={4} justify="center" wrap="nowrap">
                <TextInput
                  value={court.playerA.name}
                  onChange={(e) => onNameChange('playerA', e.currentTarget.value)}
                  variant="unstyled"
                  size="xs"
                  ta="center"
                  styles={{
                    input: { textAlign: 'center', fontWeight: 500 },
                  }}
                />
                <SavedNamesMenu
                  savedNames={savedNames}
                  onApply={(profile) => onApplySavedName('playerA', profile)}
                  onSave={() => onSaveName('playerA')}
                  actionSize="xs"
                  iconSize={14}
                  menuPosition="bottom-end"
                  t={t.savedNamesMenu}
                />
              </Group>
              <Text
                fw={700}
                c={playerAWon ? 'green' : undefined}
                style={{ fontSize: 'clamp(2rem, 10vw, 3.5rem)', lineHeight: 1 }}
              >
                {court.playerA.score}
              </Text>
              <Group gap={4} justify="center">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={() => handleScoreChange('playerA', -1)}
                >
                  <IconMinus size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="teal"
                  size="sm"
                  disabled={matchFinished}
                  onClick={() => handleScoreChange('playerA', 1)}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Group>
            </Stack>
          </Card>

          {/* Player B */}
          <Card
            withBorder
            radius="md"
            p="xs"
            style={{ 
              textAlign: 'center',
              borderColor: playerBWon ? 'var(--mantine-color-green-6)' : playerBGamePoint ? 'var(--mantine-color-yellow-6)' : undefined,
              borderWidth: playerBWon || playerBGamePoint ? 2 : undefined,
            }}
          >
            <Stack gap={4} align="center">
              <Group gap={4} justify="center" wrap="nowrap">
                <TextInput
                  value={court.playerB.name}
                  onChange={(e) => onNameChange('playerB', e.currentTarget.value)}
                  variant="unstyled"
                  size="xs"
                  ta="center"
                  styles={{
                    input: { textAlign: 'center', fontWeight: 500 },
                  }}
                />
                <SavedNamesMenu
                  savedNames={savedNames}
                  onApply={(profile) => onApplySavedName('playerB', profile)}
                  onSave={() => onSaveName('playerB')}
                  actionSize="xs"
                  iconSize={14}
                  menuPosition="bottom-end"
                  t={t.savedNamesMenu}
                />
              </Group>
              <Text
                fw={700}
                c={playerBWon ? 'green' : undefined}
                style={{ fontSize: 'clamp(2rem, 10vw, 3.5rem)', lineHeight: 1 }}
              >
                {court.playerB.score}
              </Text>
              <Group gap={4} justify="center">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={() => handleScoreChange('playerB', -1)}
                >
                  <IconMinus size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="teal"
                  size="sm"
                  disabled={matchFinished}
                  onClick={() => handleScoreChange('playerB', 1)}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Group>
            </Stack>
          </Card>
        </Group>
      </Stack>
    </Card>
  )
}

interface MultiCourtViewProps {
  cardBg: string
  t: Translations
  savedNames: PlayerProfile[]
  onSaveName?: (name: string) => void
  onApplySavedName?: (name: string) => void
  onMatchComplete?: (summary: CompletedMatchSummary) => void
}

export const MultiCourtView = ({ cardBg, t, savedNames, onSaveName, onApplySavedName, onMatchComplete }: MultiCourtViewProps) => {
  const { courts, updateScore, updatePlayerName, updateCourtName, resetCourt, resetAll, updateRaceTo, addCourt, markSavedToHistory } = useMultiCourt()

  // Track and save finished matches to history
  useEffect(() => {
    if (!onMatchComplete) return
    
    courts.forEach((court) => {
      const playerAWon = court.playerA.score >= court.raceTo
      const playerBWon = court.playerB.score >= court.raceTo
      const isFinished = playerAWon || playerBWon
      
      if (isFinished && !court.savedToHistory) {
        const winnerId = playerAWon ? 'playerA' : 'playerB'
        const winner = playerAWon ? court.playerA : court.playerB
        
        const summary: CompletedMatchSummary = {
          id: `multicourt-${court.id}-${Date.now()}`,
          completedAt: Date.now(),
          durationMs: 0, // We don't track duration in multi-court
          gamesPlayed: 1,
          totalRallies: court.playerA.score + court.playerB.score,
          raceTo: court.raceTo,
          bestOf: 1,
          winByTwo: false,
          doublesMode: false,
          winnerId: winnerId as 'playerA' | 'playerB',
          winnerName: winner.name,
          players: [
            {
              playerId: 'playerA',
              name: court.playerA.name,
              pointsScored: court.playerA.score,
              gamesWon: playerAWon ? 1 : 0,
              wonMatch: playerAWon,
              profileId: null,
            },
            {
              playerId: 'playerB',
              name: court.playerB.name,
              pointsScored: court.playerB.score,
              gamesWon: playerBWon ? 1 : 0,
              wonMatch: playerBWon,
              profileId: null,
            },
          ],
          tags: [],
          pointHistory: [],
          notes: [],
          isMultiCourt: true,
          courtName: court.name,
        }
        
        onMatchComplete(summary)
        markSavedToHistory(court.id)
      }
    })
  }, [courts, onMatchComplete, markSavedToHistory])

  const handleSaveName = useCallback((court: Court, player: 'playerA' | 'playerB') => {
    const name = court[player].name
    if (name && name !== 'Player A' && name !== 'Player B' && name !== 'Player 1' && name !== 'Player 2' && onSaveName) {
      onSaveName(name)
    }
  }, [onSaveName])

  const handleApplySavedName = useCallback((courtId: string, player: 'playerA' | 'playerB', profile: PlayerProfile) => {
    updatePlayerName(courtId, player, profile.label)
    onApplySavedName?.(profile.label)
  }, [updatePlayerName, onApplySavedName])

  return (
    <Stack gap="sm">
      {courts.map((court) => (
        <CourtCard
          key={court.id}
          court={court}
          cardBg={cardBg}
          savedNames={savedNames}
          onScoreChange={(player, delta) => updateScore(court.id, player, delta)}
          onNameChange={(player, name) => updatePlayerName(court.id, player, name)}
          onCourtNameChange={(name) => updateCourtName(court.id, name)}
          onReset={() => resetCourt(court.id)}
          onSaveName={(player) => handleSaveName(court, player)}
          onApplySavedName={(player, profile) => handleApplySavedName(court.id, player, profile)}
          onRaceToChange={(raceTo) => updateRaceTo(court.id, raceTo)}
          t={t}
        />
      ))}
      
      <Group justify="center" gap="sm">
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          leftSection={<IconRefresh size={14} />}
          onClick={resetAll}
        >
          {t.multicourt?.resetAll ?? 'Reset All Courts'}
        </Button>
        <Button
          variant="light"
          color="teal"
          size="xs"
          leftSection={<IconSquarePlus size={14} />}
          onClick={addCourt}
        >
          {t.multicourt?.addCourt ?? 'Add Court'}
        </Button>
      </Group>
    </Stack>
  )
}
