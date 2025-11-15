import { Affix, Button, Group, Paper, Stack, Text } from '@mantine/core'
import type { PlayerId, PlayerState } from '../types/match'

interface ScoreOnlyOverlaysProps {
  active: boolean
  mutedText: string
  players: PlayerState[]
  server: PlayerId
  onExitScoreOnly: () => void
  onSetServer: (playerId: PlayerId) => void
  onToggleServer: () => void
}

export const ScoreOnlyOverlays = ({
  active,
  mutedText,
  players,
  server,
  onExitScoreOnly,
  onSetServer,
  onToggleServer,
}: ScoreOnlyOverlaysProps) => {
  if (!active) {
    return null
  }

  return (
    <>
      <Affix position={{ top: 16, right: 16 }}>
        <Button size="sm" color="teal" onClick={onExitScoreOnly}>
          Show full view
        </Button>
      </Affix>
      <Paper withBorder shadow="lg" radius="lg" p="md">
        <Stack gap="xs">
          <Text size="xs" c={mutedText} fw={600}>
            Serving player
          </Text>
          <Group gap="xs" wrap="wrap">
            {players.map((player) => {
              const isCurrentServer = server === player.id
              return (
                <Button
                  key={player.id}
                  size="sm"
                  variant={isCurrentServer ? 'filled' : 'light'}
                  color={isCurrentServer ? 'cyan' : 'gray'}
                  onClick={() => onSetServer(player.id)}
                >
                  {player.name}
                </Button>
              )
            })}
            <Button size="sm" variant="subtle" color="gray" onClick={onToggleServer}>
              Swap
            </Button>
          </Group>
        </Stack>
      </Paper>
    </>
  )
}
