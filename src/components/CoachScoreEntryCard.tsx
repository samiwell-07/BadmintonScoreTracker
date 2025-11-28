import { useState, useCallback } from 'react'
import { Button, Card, Group, NumberInput, Stack, Text, TextInput, Title } from '@mantine/core'
import type { PlayerState, PlayerId, PlayerProfile } from '../types/match'
import type { Translations } from '../i18n/translations'
import { SavedNamesMenu } from './SavedNamesMenu'

interface CoachScoreEntryCardProps {
  players: readonly PlayerState[]
  cardBg: string
  mutedText: string
  savedNames: PlayerProfile[]
  onSetScores: (scores: { playerId: PlayerId; points: number }[]) => void
  onNameChange: (playerId: PlayerId, name: string) => void
  onSaveName: (playerId: PlayerId) => void
  onApplySavedName: (playerId: PlayerId, profile: PlayerProfile) => void
  t: Translations
}

export function CoachScoreEntryCard({
  players,
  cardBg,
  mutedText,
  savedNames,
  onSetScores,
  onNameChange,
  onSaveName,
  onApplySavedName,
  t,
}: CoachScoreEntryCardProps) {
  const [player1Score, setPlayer1Score] = useState<number | string>(players[0]?.points ?? 0)
  const [player2Score, setPlayer2Score] = useState<number | string>(players[1]?.points ?? 0)
  const [player1Name, setPlayer1Name] = useState(players[0]?.name ?? '')
  const [player2Name, setPlayer2Name] = useState(players[1]?.name ?? '')

  const handleApply = useCallback(() => {
    const score1 = typeof player1Score === 'number' ? player1Score : parseInt(player1Score, 10) || 0
    const score2 = typeof player2Score === 'number' ? player2Score : parseInt(player2Score, 10) || 0
    
    onSetScores([
      { playerId: 'playerA', points: Math.max(0, score1) },
      { playerId: 'playerB', points: Math.max(0, score2) },
    ])
  }, [player1Score, player2Score, onSetScores])

  const handlePlayer1NameBlur = useCallback(() => {
    if (player1Name.trim() !== players[0]?.name) {
      onNameChange('playerA', player1Name)
    }
  }, [player1Name, players, onNameChange])

  const handlePlayer2NameBlur = useCallback(() => {
    if (player2Name.trim() !== players[1]?.name) {
      onNameChange('playerB', player2Name)
    }
  }, [player2Name, players, onNameChange])

  const handlePlayer1Save = useCallback(() => {
    onSaveName('playerA')
  }, [onSaveName])

  const handlePlayer2Save = useCallback(() => {
    onSaveName('playerB')
  }, [onSaveName])

  const handlePlayer1ApplySaved = useCallback((profile: PlayerProfile) => {
    onApplySavedName('playerA', profile)
    setPlayer1Name(profile.label)
  }, [onApplySavedName])

  const handlePlayer2ApplySaved = useCallback((profile: PlayerProfile) => {
    onApplySavedName('playerB', profile)
    setPlayer2Name(profile.label)
  }, [onApplySavedName])

  return (
    <Card bg={cardBg} radius="md" padding="md" shadow="sm">
      <Stack gap="md">
        <Title order={4}>{t.coach.title}</Title>
        <Text size="sm" c={mutedText}>
          {t.coach.hint}
        </Text>
        <Group grow align="flex-start">
          <Stack gap="xs">
            <Group gap="xs" align="flex-end">
              <TextInput
                label={t.coach.player1Label}
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.currentTarget.value)}
                onBlur={handlePlayer1NameBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                style={{ flex: 1 }}
              />
              <SavedNamesMenu
                savedNames={savedNames}
                onApply={handlePlayer1ApplySaved}
                onSave={handlePlayer1Save}
                saveLabel={t.playerCard.savePlayerName(player1Name)}
                t={t.savedNamesMenu}
                actionSize="sm"
                iconSize={16}
              />
            </Group>
            <NumberInput
              value={player1Score}
              onChange={setPlayer1Score}
              min={0}
              max={99}
              allowNegative={false}
              allowDecimal={false}
              size="lg"
              styles={{
                input: {
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  fontWeight: 600,
                },
              }}
            />
          </Stack>
          <Stack gap="xs">
            <Group gap="xs" align="flex-end">
              <TextInput
                label={t.coach.player2Label}
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.currentTarget.value)}
                onBlur={handlePlayer2NameBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                style={{ flex: 1 }}
              />
              <SavedNamesMenu
                savedNames={savedNames}
                onApply={handlePlayer2ApplySaved}
                onSave={handlePlayer2Save}
                saveLabel={t.playerCard.savePlayerName(player2Name)}
                t={t.savedNamesMenu}
                actionSize="sm"
                iconSize={16}
              />
            </Group>
            <NumberInput
              value={player2Score}
              onChange={setPlayer2Score}
              min={0}
              max={99}
              allowNegative={false}
              allowDecimal={false}
              size="lg"
              styles={{
                input: {
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  fontWeight: 600,
                },
              }}
            />
          </Stack>
        </Group>
        <Button onClick={handleApply} fullWidth size="md">
          {t.coach.applyScores}
        </Button>
      </Stack>
    </Card>
  )
}
