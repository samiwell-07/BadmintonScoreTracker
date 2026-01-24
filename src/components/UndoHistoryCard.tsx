import {
  Card,
  Stack,
  Text,
  Group,
  Button,
  ScrollArea,
  Badge,
  Timeline,
  ThemeIcon,
} from '@mantine/core'
import { IconHistory, IconArrowBackUp, IconCircleDot, IconTrophy } from '@tabler/icons-react'
import type { MatchState } from '../types/match'
import type { Translations } from '../i18n/translations'

interface UndoHistoryCardProps {
  history: MatchState[]
  currentMatch: MatchState
  onUndoToIndex: (index: number) => void
  t: Translations
  cardBg: string
}

interface HistoryEntry {
  index: number
  state: MatchState
  action: string
  description: string
}

export function UndoHistoryCard({
  history,
  currentMatch,
  onUndoToIndex,
  t,
  cardBg,
}: UndoHistoryCardProps) {
  const translations = t.undoHistory || {
    title: 'Undo History',
    empty: 'No actions to undo',
    undoTo: 'Undo to this point',
    currentState: 'Current',
    point: 'Point',
    game: 'Game',
    action: 'Action',
    actionsAgo: (count: number) => `${count} action${count === 1 ? '' : 's'} ago`,
  }

  // Analyze history to determine what changed between states
  const analyzeChanges = (): HistoryEntry[] => {
    const entries: HistoryEntry[] = []

    for (let i = history.length - 1; i >= 0; i--) {
      const current = history[i]
      const prev = i > 0 ? history[i - 1] : null

      let action = translations.action
      let description = ''

      if (prev) {
        const currentPlayerA = current.players.find((p) => p.id === 'playerA')
        const prevPlayerA = prev.players.find((p) => p.id === 'playerA')
        const currentPlayerB = current.players.find((p) => p.id === 'playerB')
        const prevPlayerB = prev.players.find((p) => p.id === 'playerB')

        const playerAName = currentPlayerA?.name || 'Player A'
        const playerBName = currentPlayerB?.name || 'Player B'

        // Check for point changes
        if (
          currentPlayerA &&
          prevPlayerA &&
          currentPlayerA.points !== prevPlayerA.points
        ) {
          action = translations.point
          const diff = currentPlayerA.points - prevPlayerA.points
          description = `${playerAName} ${diff > 0 ? '+' : ''}${diff}`
        } else if (
          currentPlayerB &&
          prevPlayerB &&
          currentPlayerB.points !== prevPlayerB.points
        ) {
          action = translations.point
          const diff = currentPlayerB.points - prevPlayerB.points
          description = `${playerBName} ${diff > 0 ? '+' : ''}${diff}`
        }

        // Check for game changes
        if (
          currentPlayerA &&
          prevPlayerA &&
          currentPlayerA.games !== prevPlayerA.games
        ) {
          action = translations.game
          description = `${playerAName} won game`
        } else if (
          currentPlayerB &&
          prevPlayerB &&
          currentPlayerB.games !== prevPlayerB.games
        ) {
          action = translations.game
          description = `${playerBName} won game`
        }
      } else {
        description = 'Match started'
      }

      entries.push({
        index: i,
        state: current,
        action,
        description,
      })
    }

    return entries.slice(0, 20) // Limit to most recent 20 entries
  }

  const historyEntries = analyzeChanges()

  const getScoreDisplay = (state: MatchState) => {
    const playerA = state.players.find((p) => p.id === 'playerA')
    const playerB = state.players.find((p) => p.id === 'playerB')
    return `${playerA?.points || 0}-${playerB?.points || 0}`
  }

  const getGamesDisplay = (state: MatchState) => {
    const playerA = state.players.find((p) => p.id === 'playerA')
    const playerB = state.players.find((p) => p.id === 'playerB')
    return `(${playerA?.games || 0}-${playerB?.games || 0})`
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder bg={cardBg}>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconHistory size={20} />
            <Text fw={600}>{translations.title}</Text>
          </Group>
          <Badge variant="light" size="sm">
            {history.length} {history.length === 1 ? 'state' : 'states'}
          </Badge>
        </Group>

        {history.length <= 1 ? (
          <Text size="sm" c="dimmed" ta="center" py="lg">
            {translations.empty}
          </Text>
        ) : (
          <ScrollArea.Autosize mah={300}>
            <Timeline
              active={0}
              bulletSize={24}
              lineWidth={2}
              styles={{
                itemTitle: { fontWeight: 500 },
              }}
            >
              {/* Current state */}
              <Timeline.Item
                bullet={
                  <ThemeIcon size={24} radius="xl" color="green">
                    <IconCircleDot size={14} />
                  </ThemeIcon>
                }
                title={
                  <Group gap="xs">
                    <Text size="sm" fw={600}>
                      {translations.currentState}
                    </Text>
                    <Badge size="xs" variant="light" color="green">
                      {getScoreDisplay(currentMatch)} {getGamesDisplay(currentMatch)}
                    </Badge>
                  </Group>
                }
              >
                <Text size="xs" c="dimmed">
                  Current match state
                </Text>
              </Timeline.Item>

              {/* History entries */}
              {historyEntries.map((entry) => (
                <Timeline.Item
                  key={entry.index}
                  bullet={
                    <ThemeIcon
                      size={24}
                      radius="xl"
                      color={entry.action === translations.game ? 'yellow' : 'blue'}
                      variant="light"
                    >
                      {entry.action === translations.game ? (
                        <IconTrophy size={14} />
                      ) : (
                        <IconCircleDot size={12} />
                      )}
                    </ThemeIcon>
                  }
                  title={
                    <Group gap="xs">
                      <Text size="sm">{entry.description || entry.action}</Text>
                      <Badge size="xs" variant="outline">
                        {getScoreDisplay(entry.state)} {getGamesDisplay(entry.state)}
                      </Badge>
                    </Group>
                  }
                >
                  <Group gap="xs" mt={4}>
                    <Text size="xs" c="dimmed">
                      {translations.actionsAgo(history.length - entry.index - 1)}
                    </Text>
                    {entry.index > 0 && (
                      <Button
                        size="compact-xs"
                        variant="subtle"
                        leftSection={<IconArrowBackUp size={12} />}
                        onClick={() => onUndoToIndex(entry.index)}
                      >
                        {translations.undoTo}
                      </Button>
                    )}
                  </Group>
                </Timeline.Item>
              ))}
            </Timeline>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Card>
  )
}
