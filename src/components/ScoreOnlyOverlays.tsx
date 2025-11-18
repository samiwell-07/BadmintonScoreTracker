import { Affix, Button, Group, Paper, Stack, Text } from '@mantine/core'
import type { PlayerId, PlayerState } from '../types/match'
import { getRotationSummary } from '../utils/doublesRotation'

interface ScoreOnlyOverlaysProps {
  active: boolean
  mutedText: string
  players: PlayerState[]
  server: PlayerId
  doublesMode: boolean
  teammateServerMap: Record<PlayerId, string>
  onExitScoreOnly: () => void
  onSetServer: (playerId: PlayerId) => void
  onToggleServer: () => void
}

export const ScoreOnlyOverlays = ({
  active,
  mutedText,
  players,
  server,
  doublesMode,
  teammateServerMap,
  onExitScoreOnly,
  onSetServer,
  onToggleServer,
}: ScoreOnlyOverlaysProps) => {
  if (!active) {
    return null
  }

  const rotationSummary =
    doublesMode && players.length >= 2
      ? getRotationSummary(players, server, teammateServerMap)
      : null

  return (
    <>
      <Affix position={{ top: 16, right: 16 }}>
        <Button size="sm" color="teal" onClick={onExitScoreOnly}>
          Show full view
        </Button>
      </Affix>
      <Paper withBorder shadow="lg" radius="lg" p="md">
        <Stack gap="xs">
          {rotationSummary && (
            <Stack gap={2}>
              <Text size="xs" fw={600} c={mutedText}>
                Doubles rotation
              </Text>
              <Text size="sm">
                {`${rotationSummary.servingTeamName} serving from the ${rotationSummary.courtSide === 'right' ? 'right court' : 'left court'} with ${rotationSummary.servingPartnerName}.`}
              </Text>
              <Text size="sm" c={mutedText}>
                {`${rotationSummary.receivingTeamName} receiving with ${rotationSummary.receivingPartnerName}.`}
              </Text>
            </Stack>
          )}
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
