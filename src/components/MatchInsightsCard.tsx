import { Badge, Card, Divider, Group, Stack, Text, Title } from '@mantine/core'
import type { MatchState } from '../types/match'
import { formatRelativeTime } from '../utils/match'

interface MatchInsightsCardProps {
  cardBg: string
  match: MatchState
  gamesNeeded: number
  matchIsLive: boolean
}

export const MatchInsightsCard = ({
  cardBg,
  match,
  gamesNeeded,
  matchIsLive,
}: MatchInsightsCardProps) => (
  <Card mt="lg" withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
    <Stack gap="md">
      <Title order={5}>Match insights</Title>
      <Group gap="sm" wrap="wrap">
        <Badge color={matchIsLive ? 'green' : 'grape'} variant="light">
          {matchIsLive ? 'Live' : 'Completed'}
        </Badge>
        <Badge color="cyan" variant="light">
          Best of {match.bestOf}
        </Badge>
        <Badge color="pink" variant="light">
          Games needed {gamesNeeded}
        </Badge>
        <Badge color="orange" variant="light">
          Race to {match.raceTo}
        </Badge>
        <Badge color="yellow" variant="light">
          Updated {formatRelativeTime(match.lastUpdated)}
        </Badge>
      </Group>
      <Divider />
      <Text c="dimmed">
        Tip: add the page to your home screen for a fast, offline-ready scoreboard during practice or tournaments.
      </Text>
    </Stack>
  </Card>
)
