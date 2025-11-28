import { useMemo, useState } from 'react'
import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import type { CompletedGame, PlayerId } from '../types/match'
import { formatDuration, formatRelativeTime } from '../utils/match'
import type { Translations } from '../i18n/translations'

interface GameHistoryCardProps {
  cardBg: string
  mutedText: string
  games: CompletedGame[]
  onClearHistory: () => void
  onShowStats: () => void
  t: Translations
}

export const GameHistoryCard = ({
  cardBg,
  mutedText,
  games,
  onClearHistory,
  onShowStats,
  t,
}: GameHistoryCardProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const summaryText = useMemo(() => {
    if (games.length === 0) {
      return t.history.summaryEmpty
    }
    return t.history.summaryCount(games.length)
  }, [games, t])

  const collapsedMessage = useMemo(() => {
    if (collapsed) {
      return t.history.collapsedHidden
    }
    if (games.length === 0) {
      return t.history.collapsedEmpty
    }
    return null
  }, [collapsed, games, t])

  return (
    <Card mt="lg" withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={5}>{t.history.title}</Title>
            <Text size="sm" c={mutedText}>
              {summaryText}
            </Text>
          </div>
          <Group gap="xs">
            <Button size="xs" variant="light" onClick={onShowStats}>
              {t.history.statsButton}
            </Button>
            <Button size="xs" variant="subtle" onClick={() => setCollapsed((value) => !value)}>
              {collapsed ? t.history.showHistory : t.history.closeHistory}
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              disabled={games.length === 0}
              onClick={onClearHistory}
            >
              {t.history.eraseHistory}
            </Button>
          </Group>
        </Group>
        {collapsedMessage ? (
          <Text size="sm" c={mutedText}>
            {collapsedMessage}
          </Text>
        ) : collapsed ? null : games.length === 0 ? null : (
          <Stack gap="sm">
            {games.map((game, index) => {
              const lineup: PlayerId[] = ['playerA', 'playerB']
              // Display game number as position in list (newest first, so reverse the numbering)
              const displayNumber = games.length - index
              return (
                <Card key={game.id} withBorder radius="md" p="md" shadow="sm">
                  <Stack gap={4}>
                    <Group justify="space-between" wrap="wrap" gap="xs">
                      <Text size="sm" fw={600}>
                        {t.history.gameLabel(displayNumber)}
                      </Text>
                      <Text size="xs" c={mutedText}>
                        {formatRelativeTime(game.timestamp, t.relativeTime)}
                      </Text>
                    </Group>
                    <Group gap="xs" wrap="wrap">
                      <Badge color="teal" variant="light">
                        {t.history.winnerBadge(game.winnerName)}
                      </Badge>
                      <Badge color="gray" variant="light">
                        {formatDuration(game.durationMs)}
                      </Badge>
                      {lineup.map((playerId, index) => {
                        const score = game.scores[playerId]
                        if (!score) {
                          return null
                        }
                        const badgeColor = index === 0 ? 'blue' : 'grape'
                        return (
                          <Badge key={playerId} color={badgeColor} variant="light">
                            {score.name}: {score.points}
                          </Badge>
                        )
                      })}
                    </Group>
                  </Stack>
                </Card>
              )
            })}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
