import { useState } from 'react'
import {
  Card,
  Stack,
  Text,
  Group,
  NumberInput,
  Button,
  Chip,
  Divider,
  Alert,
} from '@mantine/core'
import { IconTarget, IconScaleOutline, IconInfoCircle } from '@tabler/icons-react'
import type { MatchState } from '../types/match'
import type { Translations } from '../i18n/translations'

interface CustomGameModeCardProps {
  match: MatchState
  onSetStartingPoints: (playerAPoints: number, playerBPoints: number) => void
  t: Translations
  cardBg: string
}

interface HandicapPreset {
  label: string
  playerAPoints: number
  playerBPoints: number
}

export function CustomGameModeCard({
  match,
  onSetStartingPoints,
  t,
  cardBg,
}: CustomGameModeCardProps) {
  const [playerAPoints, setPlayerAPoints] = useState<number>(0)
  const [playerBPoints, setPlayerBPoints] = useState<number>(0)

  const translations = t.customGame || {
    title: 'Custom Game Mode',
    hint: 'Configure target scores and handicaps',
    targetScore: 'Target Score',
    targetScoreHint: 'Points needed to win a game',
    handicap: 'Handicap',
    handicapHint: 'Give one player a starting advantage',
    presets: 'Quick Presets',
    applyHandicap: 'Apply Handicap',
    clearHandicap: 'Clear',
    startingPoints: 'Starting Points',
  }

  const playerA = match.players.find((p) => p.id === 'playerA')
  const playerB = match.players.find((p) => p.id === 'playerB')
  const playerAName = playerA?.name || 'Player A'
  const playerBName = playerB?.name || 'Player B'

  // Handicap presets based on typical competitive badminton scenarios
  const handicapPresets: HandicapPreset[] = [
    { label: `${playerAName} +3`, playerAPoints: 3, playerBPoints: 0 },
    { label: `${playerBName} +3`, playerAPoints: 0, playerBPoints: 3 },
    { label: `${playerAName} +5`, playerAPoints: 5, playerBPoints: 0 },
    { label: `${playerBName} +5`, playerAPoints: 0, playerBPoints: 5 },
    { label: `${playerAName} +7`, playerAPoints: 7, playerBPoints: 0 },
    { label: `${playerBName} +7`, playerAPoints: 0, playerBPoints: 7 },
  ]

  const handleApplyHandicap = () => {
    onSetStartingPoints(playerAPoints, playerBPoints)
  }

  const handlePresetClick = (preset: HandicapPreset) => {
    setPlayerAPoints(preset.playerAPoints)
    setPlayerBPoints(preset.playerBPoints)
    onSetStartingPoints(preset.playerAPoints, preset.playerBPoints)
  }

  const handleClear = () => {
    setPlayerAPoints(0)
    setPlayerBPoints(0)
    onSetStartingPoints(0, 0)
  }

  const hasHandicap = playerAPoints > 0 || playerBPoints > 0
  const currentHasPoints =
    (playerA?.points || 0) > 0 || (playerB?.points || 0) > 0

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder bg={cardBg}>
      <Stack gap="md">
        <Group gap="xs">
          <IconScaleOutline size={20} />
          <Text fw={600}>{translations.title}</Text>
        </Group>

        <Text size="sm" c="dimmed">
          {translations.hint}
        </Text>

        {currentHasPoints && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="yellow"
            variant="light"
          >
            Applying handicap will reset current game points
          </Alert>
        )}

        <Divider label={translations.presets} labelPosition="center" />

        <Group gap="xs" wrap="wrap">
          <Chip.Group>
            {handicapPresets.map((preset) => (
              <Chip
                key={preset.label}
                size="sm"
                variant="outline"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Chip>
            ))}
          </Chip.Group>
        </Group>

        <Divider label={translations.startingPoints} labelPosition="center" />

        <Group grow>
          <NumberInput
            label={playerAName}
            value={playerAPoints}
            onChange={(val) => setPlayerAPoints(typeof val === 'number' ? val : 0)}
            min={0}
            max={match.raceTo - 1}
            allowNegative={false}
            size="sm"
          />
          <NumberInput
            label={playerBName}
            value={playerBPoints}
            onChange={(val) => setPlayerBPoints(typeof val === 'number' ? val : 0)}
            min={0}
            max={match.raceTo - 1}
            allowNegative={false}
            size="sm"
          />
        </Group>

        <Group grow>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!hasHandicap}
          >
            {translations.clearHandicap}
          </Button>
          <Button
            leftSection={<IconTarget size={16} />}
            onClick={handleApplyHandicap}
          >
            {translations.applyHandicap}
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
