import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { IconBookmarkPlus, IconUserCircle } from '@tabler/icons-react'
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
  savedNames: string[]
  onNameChange: (playerId: PlayerId, name: string) => void
  onPointChange: (playerId: PlayerId, delta: number) => void
  onApplySavedName: (playerId: PlayerId, name: string) => void
  onSaveName: (playerId: PlayerId) => void
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
  savedNames,
  onNameChange,
  onPointChange,
  onApplySavedName,
  onSaveName,
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
          <Group gap="xs" align="flex-start" style={{ flex: 1 }} wrap="nowrap">
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
              flex={1}
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
            <Menu withinPortal position="bottom-end" shadow="md">
              <Menu.Target>
                <Tooltip label="Saved names">
                  <ActionIcon variant="light" size="lg">
                    <IconUserCircle size={18} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Saved names</Menu.Label>
                {savedNames.length === 0 && (
                  <Menu.Item disabled>No saved names</Menu.Item>
                )}
                {savedNames.map((name) => (
                  <Menu.Item key={name} onClick={() => onApplySavedName(player.id, name)}>
                    {name}
                  </Menu.Item>
                ))}
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconBookmarkPlus size={16} />}
                  onClick={() => onSaveName(player.id)}
                >
                  Save “{player.name}”
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
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
            <Group align="flex-end" gap="xl" wrap="wrap">
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
                <Title order={3} style={{ lineHeight: 1 }}>
                  {player.games}
                </Title>
              </div>
            </Group>
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
