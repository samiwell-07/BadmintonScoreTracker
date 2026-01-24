import { useCallback, useMemo, useState } from 'react'
import { ActionIcon, Badge, Button, Card, Chip, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { IconShare, IconNote } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import type { CompletedGame, PlayerId, MatchTag, MatchNote } from '../types/match'
import { formatDuration, formatRelativeTime } from '../utils/match'
import type { Translations } from '../i18n/translations'

const getTagColor = (tag: MatchTag): string => {
  switch (tag) {
    case 'training':
      return 'cyan'
    case 'league':
      return 'red'
    case 'friendly':
      return 'green'
    case 'tournament':
      return 'yellow'
    default:
      return 'gray'
  }
}

const getTagLabel = (tag: MatchTag, t: Translations): string => {
  switch (tag) {
    case 'training':
      return t.matchTags?.training ?? 'Training'
    case 'league':
      return t.matchTags?.league ?? 'League'
    case 'friendly':
      return t.matchTags?.friendly ?? 'Friendly'
    case 'tournament':
      return t.matchTags?.tournament ?? 'Tournament'
    default:
      return tag
  }
}

interface GameHistoryCardProps {
  cardBg: string
  mutedText: string
  games: CompletedGame[]
  tags: MatchTag[]
  notes: MatchNote[]
  onClearHistory: () => void
  onShowStats: () => void
  t: Translations
}

export const GameHistoryCard = ({
  cardBg,
  mutedText,
  games,
  tags,
  notes,
  onClearHistory,
  onShowStats,
  t,
}: GameHistoryCardProps) => {
  const [collapsed, setCollapsed] = useState(false)

  const handleShareGame = useCallback(async (game: CompletedGame) => {
    const lineup: PlayerId[] = ['playerA', 'playerB']
    const player1 = game.scores[lineup[0]]
    const player2 = game.scores[lineup[1]]
    
    if (!player1 || !player2) return
    
    const date = new Date(game.timestamp).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    
    const shareText = t.history.shareText(
      player1.name,
      player1.points,
      player2.name,
      player2.points,
      formatDuration(game.durationMs),
      date
    )
    
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText })
      } else {
        await navigator.clipboard.writeText(shareText)
        notifications.show({
          title: '✓',
          message: t.history.shareCopied,
          color: 'teal',
        })
      }
    } catch (error) {
      // User cancelled share or error occurred
      if ((error as Error).name !== 'AbortError') {
        notifications.show({
          title: '✗',
          message: t.history.shareError,
          color: 'red',
        })
      }
    }
  }, [t])

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
                      <Group gap="xs">
                        <Text size="xs" c={mutedText}>
                          {formatRelativeTime(game.timestamp, t.relativeTime)}
                        </Text>
                        <Tooltip label={t.history.shareResult}>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={() => handleShareGame(game)}
                          >
                            <IconShare size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                    <Group gap="xs" wrap="wrap">
                      <Badge color="teal" variant="light">
                        {t.history.winnerBadge(game.winnerName)}
                      </Badge>
                      {tags && tags.length > 0 && tags.map((tag) => (
                        <Chip
                          key={tag}
                          checked={false}
                          color={getTagColor(tag)}
                          variant="light"
                          size="xs"
                          styles={{ label: { cursor: 'default' } }}
                        >
                          {getTagLabel(tag, t)}
                        </Chip>
                      ))}
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
                    {/* Notes for this game */}
                    {notes && notes.filter(n => n.gameNumber === displayNumber).length > 0 && (
                      <Stack gap={4} mt="xs">
                        {notes.filter(n => n.gameNumber === displayNumber).map((note) => (
                          <Group key={note.id} gap="xs" align="flex-start">
                            <IconNote size={14} style={{ color: 'var(--mantine-color-yellow-6)', flexShrink: 0, marginTop: 2 }} />
                            <Text size="xs" c={mutedText} style={{ flex: 1 }}>
                              {note.text}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    )}
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
