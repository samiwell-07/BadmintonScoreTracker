import { Card, Stack, Text, Title, Group, Badge, useMantineTheme } from '@mantine/core'
import { useMemo } from 'react'
import type { PointEvent, PlayerId, CompletedMatchSummary } from '../types/match'
import type { Translations } from '../i18n/translations'

interface MomentumChartProps {
  pointHistory: PointEvent[]
  playerAName: string
  playerBName: string
  cardBg: string
  mutedText: string
  t: Translations
}

interface ChartPoint {
  index: number
  momentum: number // Positive = playerA ahead, negative = playerB ahead
  gameNumber: number
}

export const MomentumChart = ({
  pointHistory,
  playerAName,
  playerBName,
  cardBg,
  mutedText,
  t,
}: MomentumChartProps) => {
  const theme = useMantineTheme()

  const chartData = useMemo<ChartPoint[]>(() => {
    if (pointHistory.length === 0) return []

    return pointHistory.map((point, index) => ({
      index,
      momentum: point.scoreSnapshot.playerA - point.scoreSnapshot.playerB,
      gameNumber: point.gameNumber,
    }))
  }, [pointHistory])

  const stats = useMemo(() => {
    if (chartData.length === 0) return null

    // Find biggest lead for each player
    let maxPlayerALead = 0
    let maxPlayerBLead = 0
    let leadChanges = 0
    let previousLeader: 'playerA' | 'playerB' | 'tie' | null = null

    chartData.forEach((point) => {
      if (point.momentum > 0) {
        maxPlayerALead = Math.max(maxPlayerALead, point.momentum)
        const currentLeader = 'playerA'
        if (previousLeader && previousLeader !== 'tie' && previousLeader !== currentLeader) {
          leadChanges++
        }
        previousLeader = currentLeader
      } else if (point.momentum < 0) {
        maxPlayerBLead = Math.max(maxPlayerBLead, Math.abs(point.momentum))
        const currentLeader = 'playerB'
        if (previousLeader && previousLeader !== 'tie' && previousLeader !== currentLeader) {
          leadChanges++
        }
        previousLeader = currentLeader
      } else {
        previousLeader = 'tie'
      }
    })

    // Find longest streak for each player
    let currentStreak = { player: null as PlayerId | null, count: 0 }
    let maxStreakA = 0
    let maxStreakB = 0

    pointHistory.forEach((point) => {
      if (currentStreak.player === point.scorerId) {
        currentStreak.count++
      } else {
        currentStreak = { player: point.scorerId, count: 1 }
      }

      if (point.scorerId === 'playerA') {
        maxStreakA = Math.max(maxStreakA, currentStreak.count)
      } else {
        maxStreakB = Math.max(maxStreakB, currentStreak.count)
      }
    })

    return {
      maxPlayerALead,
      maxPlayerBLead,
      leadChanges,
      maxStreakA,
      maxStreakB,
    }
  }, [chartData, pointHistory])

  if (pointHistory.length < 2) {
    return (
      <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
        <Stack gap="md">
          <Title order={5}>{t.momentum?.title ?? 'Momentum'}</Title>
          <Text size="sm" c={mutedText}>
            {t.momentum?.notEnoughData ?? 'Score some points to see the momentum chart'}
          </Text>
        </Stack>
      </Card>
    )
  }

  // SVG dimensions
  const width = 320
  const height = 120
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate scales
  const maxAbsMomentum = Math.max(
    ...chartData.map((d) => Math.abs(d.momentum)),
    1 // Minimum to avoid division by zero
  )

  const xScale = (index: number) => padding.left + (index / (chartData.length - 1)) * chartWidth
  const yScale = (momentum: number) =>
    padding.top + chartHeight / 2 - (momentum / maxAbsMomentum) * (chartHeight / 2)

  // Build path
  const pathD = chartData
    .map((point, i) => {
      const x = xScale(i)
      const y = yScale(point.momentum)
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  // Area paths for positive/negative regions
  const areaPathPositive =
    pathD +
    ` L ${xScale(chartData.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`

  // Find game boundaries for vertical lines
  const gameBoundaries = chartData.reduce<number[]>((acc, point, index) => {
    if (index > 0 && point.gameNumber !== chartData[index - 1].gameNumber) {
      acc.push(index)
    }
    return acc
  }, [])

  const playerAColor = theme.colors.teal[6]
  const playerBColor = theme.colors.grape[6]

  return (
    <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={5}>{t.momentum?.title ?? 'Momentum'}</Title>
          <Group gap="xs">
            <Badge size="sm" color="teal" variant="light">
              {playerAName}
            </Badge>
            <Badge size="sm" color="grape" variant="light">
              {playerBName}
            </Badge>
          </Group>
        </Group>

        <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          {/* Background grid */}
          <line
            x1={padding.left}
            y1={yScale(0)}
            x2={width - padding.right}
            y2={yScale(0)}
            stroke={mutedText}
            strokeOpacity={0.3}
            strokeDasharray="4"
          />

          {/* Game boundary lines */}
          {gameBoundaries.map((boundaryIndex, i) => (
            <line
              key={i}
              x1={xScale(boundaryIndex)}
              y1={padding.top}
              x2={xScale(boundaryIndex)}
              y2={height - padding.bottom}
              stroke={mutedText}
              strokeOpacity={0.2}
              strokeWidth={2}
            />
          ))}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradientPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={playerAColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={playerAColor} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradientNegative" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={playerBColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={playerBColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {/* Filled areas */}
          <clipPath id="clipPositive">
            <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight / 2} />
          </clipPath>
          <clipPath id="clipNegative">
            <rect
              x={padding.left}
              y={padding.top + chartHeight / 2}
              width={chartWidth}
              height={chartHeight / 2}
            />
          </clipPath>

          <path d={areaPathPositive} fill="url(#gradientPositive)" clipPath="url(#clipPositive)" />
          <path d={areaPathPositive} fill="url(#gradientNegative)" clipPath="url(#clipNegative)" />

          {/* Main line */}
          <path
            d={pathD}
            fill="none"
            stroke={chartData[chartData.length - 1]?.momentum >= 0 ? playerAColor : playerBColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((point, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={yScale(point.momentum)}
              r={3}
              fill={point.momentum >= 0 ? playerAColor : playerBColor}
            />
          ))}

          {/* Y-axis labels */}
          <text x={padding.left - 8} y={padding.top + 4} fontSize={10} fill={mutedText} textAnchor="end">
            +{maxAbsMomentum}
          </text>
          <text
            x={padding.left - 8}
            y={height - padding.bottom}
            fontSize={10}
            fill={mutedText}
            textAnchor="end"
          >
            -{maxAbsMomentum}
          </text>
          <text
            x={padding.left - 8}
            y={yScale(0) + 4}
            fontSize={10}
            fill={mutedText}
            textAnchor="end"
          >
            0
          </text>

          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 5}
            fontSize={10}
            fill={mutedText}
            textAnchor="middle"
          >
            {t.momentum?.ralliesLabel ?? 'Rallies'}
          </text>
        </svg>

        {/* Stats */}
        {stats && (
          <Group gap="lg" justify="center">
            <Stack gap={2} align="center">
              <Text size="xs" c={mutedText}>
                {t.momentum?.leadChanges ?? 'Lead Changes'}
              </Text>
              <Text size="sm" fw={600}>
                {stats.leadChanges}
              </Text>
            </Stack>
            <Stack gap={2} align="center">
              <Text size="xs" c={mutedText}>
                {t.momentum?.biggestLead ?? 'Biggest Lead'}
              </Text>
              <Group gap={4}>
                <Badge size="xs" color="teal" variant="light">
                  {playerAName}: +{stats.maxPlayerALead}
                </Badge>
                <Badge size="xs" color="grape" variant="light">
                  {playerBName}: +{stats.maxPlayerBLead}
                </Badge>
              </Group>
            </Stack>
            <Stack gap={2} align="center">
              <Text size="xs" c={mutedText}>
                {t.momentum?.longestStreak ?? 'Longest Streak'}
              </Text>
              <Group gap={4}>
                <Badge size="xs" color="teal" variant="light">
                  {stats.maxStreakA}
                </Badge>
                <Badge size="xs" color="grape" variant="light">
                  {stats.maxStreakB}
                </Badge>
              </Group>
            </Stack>
          </Group>
        )}
      </Stack>
    </Card>
  )
}

// Simplified chart for completed match history
interface CompletedMatchMomentumChartProps {
  match: CompletedMatchSummary
  cardBg: string
  mutedText: string
  t: Translations
}

export const CompletedMatchMomentumChart = ({
  match,
  cardBg,
  mutedText,
  t,
}: CompletedMatchMomentumChartProps) => {
  const pointHistory = match.pointHistory ?? []

  if (pointHistory.length < 2) {
    return null
  }

  const playerAName = match.players.find((p) => p.playerId === 'playerA')?.name ?? 'Player A'
  const playerBName = match.players.find((p) => p.playerId === 'playerB')?.name ?? 'Player B'

  return (
    <MomentumChart
      pointHistory={pointHistory}
      playerAName={playerAName}
      playerBName={playerBName}
      cardBg={cardBg}
      mutedText={mutedText}
      t={t}
    />
  )
}
