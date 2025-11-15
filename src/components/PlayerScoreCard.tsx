import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useMantineTheme } from '@mantine/core'
import { type FocusEvent, type KeyboardEvent } from 'react'
import type { MatchConfig } from '../utils/match'
import { didWinGame } from '../utils/match'
import type { PlayerId, PlayerState } from '../types/match'

interface PlayerScoreCardProps {
  player: PlayerState
  opponent: PlayerState
  cardBg: string
  mutedText: string
  isServer: boolean
  matchWinner: PlayerId | null
  gamesNeeded: number
  matchConfig: MatchConfig
  matchIsLive: boolean
  onNameChange: (playerId: PlayerId, name: string) => void
  onPointChange: (playerId: PlayerId, delta: number) => void
}

export const PlayerScoreCard = ({
  player,
  opponent,
  cardBg,
  mutedText,
  isServer,
  matchWinner,
  gamesNeeded,
  matchConfig,
  matchIsLive,
  onNameChange,
  onPointChange,
}: PlayerScoreCardProps) => {
  const theme = useMantineTheme()
  const isGamePoint = didWinGame(player.points + 1, opponent.points, matchConfig)
  const isMatchPoint = isGamePoint && player.games === gamesNeeded - 1
  const isWinner = matchWinner === player.id

  return (
    <Card
      withBorder
      radius="lg"
      p="xl"
      shadow="xl"
      style={{
        backgroundColor: cardBg,
        borderColor: isWinner ? theme.colors.green[5] : theme.colors.gray[4],
        borderWidth: isWinner ? 2 : 1,
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" gap="sm">
          <TextInput
            key={`${player.id}-${player.name}`}
            defaultValue={player.name}
            onBlur={(event: FocusEvent<HTMLInputElement>) =>
              onNameChange(player.id, event.currentTarget.value)
            }
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              }
            }}
            spellCheck={false}
            maxLength={24}
            styles={{
              input: {
                fontSize: '1.5rem',
                fontWeight: 700,
                backgroundColor: 'transparent',
                border: 'none',
                paddingLeft: 0,
              },
            }}
          />
          <Group gap="xs" wrap="wrap">
            {isServer && (
              <Badge color="cyan" variant="light">
                Serving
              </Badge>
            )}
            {isMatchPoint && (
              <Badge color="red" variant="filled">
                Match point
              </Badge>
            )}
            {!isMatchPoint && isGamePoint && (
              <Badge color="orange" variant="light">
                Game point
              </Badge>
            )}
            {isWinner && (
              <Badge color="green" variant="light">
                Winner
              </Badge>
            )}
          </Group>
        </Group>
        <Stack gap="md">
          <div>
            <Text size="sm" c={mutedText}>
              Points
            </Text>
            <Title order={1} style={{ lineHeight: 1, fontSize: '4rem' }}>
              {player.points}
            </Title>
          </div>
          <div>
            <Text size="sm" c={mutedText}>
              Games won
            </Text>
            <Title order={3}>{player.games}</Title>
          </div>
          <Group gap="xs" grow>
            <Button
              variant="light"
              color="gray"
              size="lg"
              onClick={() => onPointChange(player.id, -1)}
              disabled={player.points === 0}
            >
              -1
            </Button>
            <Button
              size="lg"
              color="teal"
              onClick={() => onPointChange(player.id, 1)}
              disabled={!matchIsLive}
            >
              +1
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Card>
  )
}
