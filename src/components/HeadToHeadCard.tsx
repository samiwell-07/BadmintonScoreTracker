import { Card, Stack, Text, Title, Group, Badge, Progress, SimpleGrid } from '@mantine/core'
import { useMemo } from 'react'
import type { CompletedMatchSummary } from '../types/match'
import type { Translations } from '../i18n/translations'
import { IconTrophy, IconHistory } from '@tabler/icons-react'

interface HeadToHeadCardProps {
  playerAName: string
  playerBName: string
  completedMatches: CompletedMatchSummary[]
  cardBg: string
  mutedText: string
  t: Translations
}

interface HeadToHeadStats {
  playerAWins: number
  playerBWins: number
  totalMatches: number
  winRateA: number
  winRateB: number
  lastPlayed: number | null
  avgMarginA: number
  avgMarginB: number
  recentForm: ('A' | 'B')[] // Last 5 matches
}

const normalizePlayerName = (name: string): string => {
  return name.toLowerCase().trim()
}

export const HeadToHeadCard = ({
  playerAName,
  playerBName,
  completedMatches,
  cardBg,
  mutedText,
  t,
}: HeadToHeadCardProps) => {
  const stats = useMemo<HeadToHeadStats | null>(() => {
    const normalizedA = normalizePlayerName(playerAName)
    const normalizedB = normalizePlayerName(playerBName)

    // Skip if players have default names
    if (normalizedA.startsWith('player ') || normalizedB.startsWith('player ')) {
      return null
    }

    // Find matches between these two players
    const relevantMatches = completedMatches.filter((match) => {
      const matchPlayerNames = match.players.map((p) => normalizePlayerName(p.name))
      return matchPlayerNames.includes(normalizedA) && matchPlayerNames.includes(normalizedB)
    })

    if (relevantMatches.length === 0) {
      return null
    }

    let playerAWins = 0
    let playerBWins = 0
    let totalPointsA = 0
    let totalPointsB = 0
    let totalGamesA = 0
    let totalGamesB = 0
    const recentForm: ('A' | 'B')[] = []

    relevantMatches.forEach((match) => {
      // Figure out which player in this match corresponds to current playerA/B
      const matchPlayerA = match.players.find(
        (p) => normalizePlayerName(p.name) === normalizedA
      )
      const matchPlayerB = match.players.find(
        (p) => normalizePlayerName(p.name) === normalizedB
      )

      if (!matchPlayerA || !matchPlayerB) return

      if (matchPlayerA.wonMatch) {
        playerAWins++
        if (recentForm.length < 5) recentForm.push('A')
      } else if (matchPlayerB.wonMatch) {
        playerBWins++
        if (recentForm.length < 5) recentForm.push('B')
      }

      totalPointsA += matchPlayerA.pointsScored
      totalPointsB += matchPlayerB.pointsScored
      totalGamesA += matchPlayerA.gamesWon
      totalGamesB += matchPlayerB.gamesWon
    })

    const totalMatches = playerAWins + playerBWins
    const winRateA = totalMatches > 0 ? (playerAWins / totalMatches) * 100 : 0
    const winRateB = totalMatches > 0 ? (playerBWins / totalMatches) * 100 : 0

    // Calculate average point margin per game
    const totalGames = totalGamesA + totalGamesB
    const avgMarginA = totalGames > 0 ? (totalPointsA - totalPointsB) / totalGames : 0
    const avgMarginB = totalGames > 0 ? (totalPointsB - totalPointsA) / totalGames : 0

    const lastPlayed = relevantMatches.length > 0 ? relevantMatches[0].completedAt : null

    return {
      playerAWins,
      playerBWins,
      totalMatches,
      winRateA,
      winRateB,
      lastPlayed,
      avgMarginA,
      avgMarginB,
      recentForm,
    }
  }, [playerAName, playerBName, completedMatches])

  if (!stats) {
    return (
      <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
        <Stack gap="md">
          <Title order={5}>{t.headToHead?.title ?? 'Head-to-Head'}</Title>
          <Text size="sm" c={mutedText}>
            {t.headToHead?.noMatches ?? 'No previous matches between these players'}
          </Text>
        </Stack>
      </Card>
    )
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={5}>{t.headToHead?.title ?? 'Head-to-Head'}</Title>
          <Badge size="sm" variant="light" color="gray">
            {stats.totalMatches} {stats.totalMatches === 1 ? 'match' : 'matches'}
          </Badge>
        </Group>

        {/* Main record display */}
        <Group justify="center" gap="xl" align="center">
          <Stack gap={4} align="center">
            <Text size="xl" fw={700} c="teal">
              {stats.playerAWins}
            </Text>
            <Text size="xs" c={mutedText} lineClamp={1} maw={100} ta="center">
              {playerAName}
            </Text>
          </Stack>

          <Stack gap={4} align="center">
            <IconTrophy size={20} color={mutedText} opacity={0.5} />
            <Text size="xs" c={mutedText}>
              {t.headToHead?.wins ?? 'Wins'}
            </Text>
          </Stack>

          <Stack gap={4} align="center">
            <Text size="xl" fw={700} c="grape">
              {stats.playerBWins}
            </Text>
            <Text size="xs" c={mutedText} lineClamp={1} maw={100} ta="center">
              {playerBName}
            </Text>
          </Stack>
        </Group>

        {/* Win rate progress bar */}
        <Progress.Root size="lg" radius="xl">
          <Progress.Section
            value={stats.winRateA}
            color="teal"
          >
            {stats.winRateA >= 20 && (
              <Progress.Label>{Math.round(stats.winRateA)}%</Progress.Label>
            )}
          </Progress.Section>
          <Progress.Section
            value={stats.winRateB}
            color="grape"
          >
            {stats.winRateB >= 20 && (
              <Progress.Label>{Math.round(stats.winRateB)}%</Progress.Label>
            )}
          </Progress.Section>
        </Progress.Root>

        {/* Stats grid */}
        <SimpleGrid cols={2} spacing="md">
          <Stack gap={2} align="center">
            <Text size="xs" c={mutedText}>
              {t.headToHead?.avgMargin ?? 'Avg. Point Margin'}
            </Text>
            <Group gap={4}>
              <Badge size="xs" color="teal" variant="light">
                {stats.avgMarginA > 0 ? '+' : ''}{stats.avgMarginA.toFixed(1)}
              </Badge>
              <Badge size="xs" color="grape" variant="light">
                {stats.avgMarginB > 0 ? '+' : ''}{stats.avgMarginB.toFixed(1)}
              </Badge>
            </Group>
          </Stack>

          {stats.lastPlayed && (
            <Stack gap={2} align="center">
              <Text size="xs" c={mutedText}>
                {t.headToHead?.lastPlayed ?? 'Last Played'}
              </Text>
              <Group gap={4}>
                <IconHistory size={12} color={mutedText} />
                <Text size="xs">{formatDate(stats.lastPlayed)}</Text>
              </Group>
            </Stack>
          )}
        </SimpleGrid>

        {/* Recent form */}
        {stats.recentForm.length > 0 && (
          <Stack gap={4} align="center">
            <Text size="xs" c={mutedText}>
              {t.headToHead?.recentForm ?? 'Recent Form'} ({t.headToHead?.lastPlayed ?? 'most recent'} →)
            </Text>
            <Group gap={4}>
              {stats.recentForm.map((result, index) => (
                <Badge
                  key={index}
                  size="xs"
                  color={result === 'A' ? 'teal' : 'grape'}
                  variant="filled"
                  radius="xl"
                  w={24}
                  h={24}
                  p={0}
                  styles={{ label: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
                >
                  {result === 'A' ? playerAName.charAt(0).toUpperCase() : playerBName.charAt(0).toUpperCase()}
                </Badge>
              ))}
            </Group>
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
