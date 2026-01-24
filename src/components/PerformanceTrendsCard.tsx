import { useMemo } from 'react'
import {
  Card,
  Stack,
  Text,
  Group,
  Badge,
  Progress,
  SimpleGrid,
  useMantineTheme,
} from '@mantine/core'
import { IconTrendingUp, IconTrendingDown, IconMinus, IconChartLine } from '@tabler/icons-react'
import type { CompletedMatchSummary } from '../types/match'
import type { Translations } from '../i18n/translations'

interface PerformanceTrendsCardProps {
  completedMatches: CompletedMatchSummary[]
  currentPlayerIds: { playerA: string; playerB: string }
  t: Translations
  cardBg: string
}

interface TrendData {
  winRate: number
  winRateTrend: 'up' | 'down' | 'stable'
  avgPointsScored: number
  avgPointsConceded: number
  avgDuration: number
  recentResults: ('W' | 'L')[]
  totalMatches: number
}

const MIN_MATCHES_FOR_TRENDS = 3

export function PerformanceTrendsCard({
  completedMatches,
  currentPlayerIds,
  t,
  cardBg,
}: PerformanceTrendsCardProps) {
  const theme = useMantineTheme()

  const translations = t.trends || {
    title: 'Performance Trends',
    noData: 'Not enough match data',
    minMatches: (count: number) => `Play at least ${count} matches to see trends`,
    winRate: 'Win Rate',
    avgScore: 'Avg. Score',
    avgDuration: 'Avg. Duration',
    recentMatches: 'Recent Matches',
    performance: 'Performance',
    improving: 'Improving',
    declining: 'Declining',
    stable: 'Stable',
  }

  // Calculate trends for the current player A (primary player)
  const trendData = useMemo<TrendData | null>(() => {
    if (completedMatches.length < MIN_MATCHES_FOR_TRENDS) {
      return null
    }

    // Get matches where current player A was involved
    const playerMatches = completedMatches
      .filter(
        (m) =>
          m.players.some((p) => p.name.toLowerCase() === currentPlayerIds.playerA.toLowerCase())
      )
      .slice(0, 10) // Limit to last 10 matches

    if (playerMatches.length < MIN_MATCHES_FOR_TRENDS) {
      return null
    }

    let wins = 0
    let totalPointsScored = 0
    let totalPointsConceded = 0
    let totalDuration = 0
    const recentResults: ('W' | 'L')[] = []

    // First half and second half for trend calculation
    const halfIndex = Math.floor(playerMatches.length / 2)
    let firstHalfWins = 0
    let secondHalfWins = 0

    playerMatches.forEach((match, index) => {
      const isPlayerASlot = match.players[0]?.name.toLowerCase() === currentPlayerIds.playerA.toLowerCase()
      
      const isWin = match.winnerId === (isPlayerASlot ? 'playerA' : 'playerB')
      if (isWin) {
        wins++
        if (index < halfIndex) firstHalfWins++
        else secondHalfWins++
      }

      recentResults.push(isWin ? 'W' : 'L')

      // Get points from player summary - divide by games to get per-game average
      const playerSummary = isPlayerASlot ? match.players[0] : match.players[1]
      const opponentSummary = isPlayerASlot ? match.players[1] : match.players[0]
      const gamesPlayed = match.gamesPlayed || 1

      totalPointsScored += (playerSummary?.pointsScored || 0) / gamesPlayed
      totalPointsConceded += (opponentSummary?.pointsScored || 0) / gamesPlayed
      totalDuration += match.durationMs || 0
    })

    const matchCount = playerMatches.length

    // Determine trend
    let winRateTrend: 'up' | 'down' | 'stable' = 'stable'
    if (playerMatches.length >= 4) {
      const firstHalfRate = firstHalfWins / halfIndex
      const secondHalfRate = secondHalfWins / (matchCount - halfIndex)
      const diff = secondHalfRate - firstHalfRate
      if (diff > 0.15) winRateTrend = 'up'
      else if (diff < -0.15) winRateTrend = 'down'
    }

    return {
      winRate: (wins / matchCount) * 100,
      winRateTrend,
      avgPointsScored: totalPointsScored / matchCount,
      avgPointsConceded: totalPointsConceded / matchCount,
      avgDuration: totalDuration / matchCount,
      recentResults: recentResults.slice(0, 5),
      totalMatches: matchCount,
    }
  }, [completedMatches, currentPlayerIds])

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    return `${minutes}m`
  }

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up')
      return <IconTrendingUp size={16} style={{ color: theme.colors.green[5] }} />
    if (trend === 'down')
      return <IconTrendingDown size={16} style={{ color: theme.colors.red[5] }} />
    return <IconMinus size={16} style={{ color: theme.colors.gray[5] }} />
  }

  const getTrendLabel = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return translations.improving
    if (trend === 'down') return translations.declining
    return translations.stable
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'green'
    if (trend === 'down') return 'red'
    return 'gray'
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder bg={cardBg}>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconChartLine size={20} />
            <Text fw={600}>{translations.title}</Text>
          </Group>
          {trendData && (
            <Badge
              variant="light"
              color={getTrendColor(trendData.winRateTrend)}
              leftSection={<TrendIcon trend={trendData.winRateTrend} />}
            >
              {getTrendLabel(trendData.winRateTrend)}
            </Badge>
          )}
        </Group>

        {!trendData ? (
          <Stack gap="xs" py="lg" align="center">
            <Text size="sm" c="dimmed" ta="center">
              {translations.noData}
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              {translations.minMatches(MIN_MATCHES_FOR_TRENDS)}
            </Text>
          </Stack>
        ) : (
          <>
            {/* Win Rate */}
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">{translations.winRate}</Text>
                <Group gap="xs">
                  <Text size="sm" fw={600}>
                    {trendData.winRate.toFixed(0)}%
                  </Text>
                  <TrendIcon trend={trendData.winRateTrend} />
                </Group>
              </Group>
              <Progress
                value={trendData.winRate}
                color={trendData.winRate >= 50 ? 'green' : 'red'}
                size="md"
                radius="xl"
              />
            </Stack>

            {/* Stats Grid */}
            <SimpleGrid cols={2} spacing="sm">
              <Card padding="xs" radius="sm" withBorder>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    {translations.avgScore}
                  </Text>
                  <Text size="sm" fw={600}>
                    {trendData.avgPointsScored.toFixed(1)} - {trendData.avgPointsConceded.toFixed(1)}
                  </Text>
                </Stack>
              </Card>
              <Card padding="xs" radius="sm" withBorder>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    {translations.avgDuration}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatDuration(trendData.avgDuration)}
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>

            {/* Recent Form */}
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                {translations.recentMatches} ({trendData.totalMatches} total)
              </Text>
              <Group gap="xs">
                {trendData.recentResults.map((result, idx) => (
                  <Badge
                    key={idx}
                    variant="filled"
                    color={result === 'W' ? 'green' : 'red'}
                    size="lg"
                  >
                    {result}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </>
        )}
      </Stack>
    </Card>
  )
}
