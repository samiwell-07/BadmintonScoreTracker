import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import type { MatchState } from '../types/match'
import { BEST_OF_OPTIONS } from '../types/match'
import type { Translations } from '../i18n/translations'

type MatchConfigSnapshot = Pick<MatchState, 'raceTo' | 'bestOf' | 'winByTwo' | 'doublesMode'>

const RECENT_CONFIG_STORAGE_KEY = 'bst-recent-match-configs'
const RECENT_CONFIG_LIMIT = 4

type QuickPresetKey = keyof Translations['settings']['quickPresets']['presets']

interface QuickPresetDefinition {
  id: QuickPresetKey
  config: MatchConfigSnapshot
}

const QUICK_PRESETS: QuickPresetDefinition[] = [
  {
    id: 'standard',
    config: { raceTo: 21, bestOf: 3, winByTwo: true, doublesMode: false },
  },
  {
    id: 'doubles',
    config: { raceTo: 21, bestOf: 3, winByTwo: true, doublesMode: true },
  },
  {
    id: 'short',
    config: { raceTo: 15, bestOf: 3, winByTwo: true, doublesMode: false },
  },
  {
    id: 'sprint',
    config: { raceTo: 11, bestOf: 1, winByTwo: false, doublesMode: false },
  },
]

const configsMatch = (a: MatchConfigSnapshot, b: MatchConfigSnapshot) =>
  a.raceTo === b.raceTo &&
  a.bestOf === b.bestOf &&
  a.winByTwo === b.winByTwo &&
  a.doublesMode === b.doublesMode

const isValidConfig = (entry: unknown): entry is MatchConfigSnapshot =>
  typeof entry === 'object' &&
  entry !== null &&
  typeof (entry as MatchConfigSnapshot).raceTo === 'number' &&
  typeof (entry as MatchConfigSnapshot).bestOf === 'number' &&
  typeof (entry as MatchConfigSnapshot).winByTwo === 'boolean' &&
  typeof (entry as MatchConfigSnapshot).doublesMode === 'boolean'

const readRecentConfigs = (): MatchConfigSnapshot[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(RECENT_CONFIG_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as MatchConfigSnapshot[]
    return Array.isArray(parsed)
      ? parsed.filter((entry) => entry && isValidConfig(entry)).slice(0, RECENT_CONFIG_LIMIT)
      : []
  } catch {
    return []
  }
}

const persistRecentConfigs = (configs: MatchConfigSnapshot[]) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(RECENT_CONFIG_STORAGE_KEY, JSON.stringify(configs))
  } catch {
    /* noop */
  }
}

interface MatchSettingsCardProps {
  cardBg: string
  mutedText: string
  match: MatchState
  onRaceToChange: (value: number) => void
  onBestOfChange: (value: MatchState['bestOf']) => void
  onWinByTwoToggle: (checked: boolean) => void
  onDoublesToggle: (checked: boolean) => void
  t: Translations
}

export const MatchSettingsCard = ({
  cardBg,
  mutedText,
  match,
  onRaceToChange,
  onBestOfChange,
  onWinByTwoToggle,
  onDoublesToggle,
  t,
}: MatchSettingsCardProps) => {
  const currentConfig = useMemo<MatchConfigSnapshot>(
    () => ({
      raceTo: match.raceTo,
      bestOf: match.bestOf,
      winByTwo: match.winByTwo,
      doublesMode: match.doublesMode,
    }),
    [match.raceTo, match.bestOf, match.winByTwo, match.doublesMode],
  )

  const [recentConfigs, setRecentConfigs] = useState<MatchConfigSnapshot[]>(() =>
    readRecentConfigs(),
  )

  useEffect(() => {
    setRecentConfigs((previous) => {
      const filtered = previous.filter((config) => !configsMatch(config, currentConfig))
      const next = [currentConfig, ...filtered].slice(0, RECENT_CONFIG_LIMIT)
      persistRecentConfigs(next)
      return next
    })
  }, [currentConfig])

  const handlePresetApply = useCallback(
    (config: MatchConfigSnapshot) => {
      if (config.raceTo !== match.raceTo) {
        onRaceToChange(config.raceTo)
      }
      if (config.bestOf !== match.bestOf) {
        onBestOfChange(config.bestOf)
      }
      if (config.winByTwo !== match.winByTwo) {
        onWinByTwoToggle(config.winByTwo)
      }
      if (config.doublesMode !== match.doublesMode) {
        onDoublesToggle(config.doublesMode)
      }
    },
    [match.bestOf, match.doublesMode, match.raceTo, match.winByTwo, onBestOfChange, onDoublesToggle, onRaceToChange, onWinByTwoToggle],
  )

  const quickPresetButtons = QUICK_PRESETS.map((preset) => {
    const isActive = configsMatch(currentConfig, preset.config)
    const { label, description } = t.settings.quickPresets.presets[preset.id]
    return (
      <Tooltip key={preset.id} label={description} withArrow withinPortal>
        <Button
          variant={isActive ? 'filled' : 'light'}
          color={isActive ? 'teal' : 'gray'}
          size="compact-md"
          onClick={() => handlePresetApply(preset.config)}
        >
          {label}
        </Button>
      </Tooltip>
    )
  })

  const recentConfigButtons = recentConfigs
    .filter((config) => !configsMatch(config, currentConfig))
    .map((config, index) => {
      const label = t.settings.recentConfigs.label(config.raceTo, config.bestOf)
      return (
        <Button
          key={`${label}-${index}`}
          variant="subtle"
          size="compact-md"
          onClick={() => handlePresetApply(config)}
          rightSection={
            <Group gap={4} wrap="nowrap">
              <Badge size="xs" variant={config.doublesMode ? 'filled' : 'outline'} color="grape">
                {config.doublesMode
                  ? t.settings.recentConfigs.doublesTag
                  : t.settings.recentConfigs.singlesTag}
              </Badge>
              <Badge size="xs" variant={config.winByTwo ? 'light' : 'outline'} color="cyan">
                {config.winByTwo
                  ? t.settings.recentConfigs.winByTwoTag
                  : t.settings.recentConfigs.suddenDeathTag}
              </Badge>
            </Group>
          }
        >
          {label}
        </Button>
      )
    })

  return (
    <Card mt="lg" withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={4}>{t.settings.title}</Title>
          <Text size="sm" c={mutedText}>
            {t.settings.quickPresets.helper}
          </Text>
        </Stack>

        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={600}>
              {t.settings.quickPresets.title}
            </Text>
            <Text size="xs" c={mutedText}>
              {t.settings.quickPresets.hint}
            </Text>
          </Group>
          <Group gap="xs" wrap="wrap">
            {quickPresetButtons}
          </Group>
        </Stack>

        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={600}>
              {t.settings.recentConfigs.title}
            </Text>
            <Text size="xs" c={mutedText}>
              {t.settings.recentConfigs.helper}
            </Text>
          </Group>
          {recentConfigButtons.length > 0 ? (
            <Stack gap={8}>{recentConfigButtons}</Stack>
          ) : (
            <Text size="sm" c={mutedText}>
              {t.settings.recentConfigs.empty}
            </Text>
          )}
        </Stack>

        <Divider />

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          <Stack gap="xs">
            <Text size="sm" c={mutedText}>
              {t.settings.raceToLabel}
            </Text>
            <NumberInput
              min={11}
              max={match.maxPoint}
              value={match.raceTo}
              allowDecimal={false}
              onChange={(value: string | number) => {
                const numeric = typeof value === 'number' ? value : Number(value)
                onRaceToChange(numeric)
              }}
            />
          </Stack>
          <Stack gap="xs">
            <Text size="sm" c={mutedText}>
              {t.settings.matchLengthLabel}
            </Text>
            <Select
              data={BEST_OF_OPTIONS.map((option) => ({
                value: option.toString(),
                label: t.settings.bestOfOption(option),
              }))}
              value={match.bestOf.toString()}
              onChange={(value: string | null) => {
                if (!value) return
                onBestOfChange(Number(value) as MatchState['bestOf'])
              }}
            />
          </Stack>
          <Stack gap="xs">
            <Text size="sm" c={mutedText}>
              {t.settings.winByTwoLabel}
            </Text>
            <Switch
              checked={match.winByTwo}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onWinByTwoToggle(event.currentTarget.checked)
              }
              label={match.winByTwo ? t.settings.winByTwoEnabled : t.settings.winByTwoDisabled}
            />
          </Stack>
          <Stack gap="xs">
            <Text size="sm" c={mutedText}>
              {t.settings.doublesLabel}
            </Text>
            <Switch
              checked={match.doublesMode}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onDoublesToggle(event.currentTarget.checked)
              }
              label={match.doublesMode ? t.settings.doublesEnabled : t.settings.doublesDisabled}
            />
          </Stack>
        </SimpleGrid>
      </Stack>
    </Card>
  )
}
