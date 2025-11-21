import { Button, Card, Divider, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { CompletedMatchSummary } from '../types/match'
import { formatDuration, formatRelativeTime } from '../utils/match'
import type { Translations } from '../i18n/translations'

interface MatchStatsPanelProps {
  cardBg: string
  mutedText: string
  matchHistory: CompletedMatchSummary[]
  onExit: () => void
  t: Translations
}

const REQUIRED_MATCH_COUNT = 3

const formatSeconds = (milliseconds: number) => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return '—'
  }

  const seconds = milliseconds / 1000
  return `${seconds.toFixed(1)}s`
}

const formatNumber = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '0'
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
    useGrouping: false,
  }).format(value)
}

const formatInteger = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '0'
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
    useGrouping: false,
  }).format(Math.round(value))
}

export const MatchStatsPanel = ({
  cardBg,
  mutedText,
  matchHistory,
  onExit,
  t,
}: MatchStatsPanelProps) => {
  const hasEnoughHistory = matchHistory.length >= REQUIRED_MATCH_COUNT
  const referenceMatch = hasEnoughHistory ? matchHistory[0] : null

  if (!referenceMatch) {
    return (
      <Card mt="lg" withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={4}>{t.statsPanel.title}</Title>
            <Text size="sm" c={mutedText}>
              {t.statsPanel.description}
            </Text>
          </Stack>
          <Stack gap={4}>
            <Title order={5}>{t.statsPanel.requirementTitle}</Title>
            <Text size="sm" c={mutedText}>
              {t.statsPanel.requirementBody(REQUIRED_MATCH_COUNT)}
            </Text>
          </Stack>
          <Button variant="light" onClick={onExit} style={{ alignSelf: 'flex-start' }}>
            {t.statsPanel.backButton}
          </Button>
        </Stack>
      </Card>
    )
  }

  const { durationMs, totalRallies, gamesPlayed } = referenceMatch
  const averageRallyDuration = totalRallies > 0 ? durationMs / totalRallies : 0
  const pointsPerMinute = durationMs > 0 ? totalRallies / (durationMs / 60000) : 0
  const averageGameDuration = gamesPlayed > 0 ? durationMs / gamesPlayed : 0
  const completedAgo = formatRelativeTime(referenceMatch.completedAt, t.relativeTime)

  const metrics = [
    {
      label: t.statsPanel.matchDurationLabel,
      value: formatDuration(durationMs),
      hint: t.statsPanel.matchDurationHint,
    },
    {
      label: t.statsPanel.averageRallyLabel,
      value: formatSeconds(averageRallyDuration),
      hint: t.statsPanel.averageRallyHint,
    },
    {
      label: t.statsPanel.totalRalliesLabel,
      value: formatNumber(totalRallies),
      hint: t.statsPanel.totalRalliesHint,
    },
    {
      label: t.statsPanel.pointsPerMinuteLabel,
      value: formatInteger(pointsPerMinute),
      hint: t.statsPanel.pointsPerMinuteHint,
    },
    {
      label: t.statsPanel.averageGameLabel,
      value: averageGameDuration > 0 ? formatDuration(averageGameDuration) : t.statsPanel.noGamesYet,
      hint: t.statsPanel.averageGameHint,
    },
  ]

  return (
    <Card mt="lg" withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={4}>{t.statsPanel.title}</Title>
          <Text size="sm" c={mutedText}>
            {t.statsPanel.description}
          </Text>
          <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
              <Text size="xs" c={mutedText}>
                {t.statsPanel.previousMatchLabel(completedAgo)}
              </Text>
              <Text size="xs" c={mutedText}>
                {t.statsPanel.configLabel(referenceMatch.raceTo, referenceMatch.bestOf)}
              </Text>
            </Stack>
            <Text size="xs" c={mutedText}>
              {referenceMatch.winnerName}
            </Text>
          </Group>
        </Stack>
        <Button variant="light" onClick={onExit} style={{ alignSelf: 'flex-start' }}>
          {t.statsPanel.backButton}
        </Button>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {metrics.map((metric) => (
            <Stack key={metric.label} gap={4}>
              <Text size="sm" c={mutedText}>
                {metric.label}
              </Text>
              <Title order={3}>{metric.value}</Title>
              <Text size="xs" c={mutedText}>
                {metric.hint}
              </Text>
            </Stack>
          ))}
        </SimpleGrid>

        <Divider />

        <Stack gap="sm">
          <Title order={5}>{t.statsPanel.profileHeading}</Title>
          {matchHistory.length === 0 ? (
            <Text size="sm" c={mutedText}>
              {t.statsPanel.profileEmpty}
            </Text>
          ) : (
            <Stack gap="sm">
              {buildProfileStats(matchHistory).map((profile) => (
                <Card key={profile.id} withBorder radius="md" p="md">
                  <Stack gap={6}>
                    <Group justify="space-between" align="center">
                      <Text fw={600}>{profile.name}</Text>
                      <Text size="xs" c={mutedText}>
                        {t.statsPanel.profileMatchesLabel(profile.matchesPlayed)}
                      </Text>
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                      <Stack gap={2}>
                        <Text size="xs" c={mutedText}>
                          {t.statsPanel.profileWinRateLabel}
                        </Text>
                        <Text>{profile.winRate}</Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c={mutedText}>
                          {t.statsPanel.profilePointsLabel}
                        </Text>
                        <Text>{profile.averagePoints}</Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c={mutedText}>
                          {t.statsPanel.profileAvgDurationLabel}
                        </Text>
                        <Text>{profile.averageDuration}</Text>
                      </Stack>
                    </SimpleGrid>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}

const buildProfileStats = (history: CompletedMatchSummary[]) => {
  const aggregates = new Map<
    string,
    {
      key: string
      profileId: string | null
      displayName: string
      matchesPlayed: number
      matchesWon: number
      totalDuration: number
      totalPoints: number
      totalGames: number
      totalRaceTo: number
    }
  >()

  history.forEach((match) => {
    const gamesInMatch = Math.max(1, match.gamesPlayed)
    const targetPoints = Math.max(1, match.raceTo)
    match.players.forEach((player) => {
      const key = player.profileId ?? `name:${player.name.toLowerCase()}`
      const current = aggregates.get(key) ?? {
        key,
        profileId: player.profileId ?? null,
        displayName: player.name,
        matchesPlayed: 0,
        matchesWon: 0,
        totalDuration: 0,
        totalPoints: 0,
        totalGames: 0,
        totalRaceTo: 0,
      }

      current.matchesPlayed += 1
      if (player.wonMatch) {
        current.matchesWon += 1
      }
      current.totalDuration += match.durationMs
      current.totalPoints += player.pointsScored
      current.totalGames += gamesInMatch
      current.totalRaceTo += targetPoints
      aggregates.set(key, current)
    })
  })

  const formatPercent = (value: number) => `${Math.round(value * 100)}%`

  return Array.from(aggregates.values())
    .map((aggregate) => {
      const winRate =
        aggregate.matchesPlayed === 0
          ? 0
          : aggregate.matchesWon / aggregate.matchesPlayed
      const averagePointsPerGame =
        aggregate.totalGames === 0
          ? 0
          : aggregate.totalPoints / aggregate.totalGames
      const averageRaceTo =
        aggregate.matchesPlayed === 0
          ? 0
          : aggregate.totalRaceTo / aggregate.matchesPlayed
      const cappedAveragePoints =
        averageRaceTo > 0
          ? Math.min(averagePointsPerGame, averageRaceTo)
          : averagePointsPerGame
      return {
        id: aggregate.profileId ?? aggregate.key,
        name: aggregate.displayName,
        matchesPlayed: aggregate.matchesPlayed,
        winRate: formatPercent(winRate),
        averagePoints: formatNumber(cappedAveragePoints),
        averageDuration: formatDuration(
          aggregate.matchesPlayed === 0
            ? 0
            : aggregate.totalDuration / aggregate.matchesPlayed,
        ),
      }
    })
    .sort((a, b) => b.matchesPlayed - a.matchesPlayed)
}
