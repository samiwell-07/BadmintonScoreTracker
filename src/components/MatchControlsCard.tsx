import { Button, Card, Group } from '@mantine/core'
import { IconRepeat } from '@tabler/icons-react'

interface MatchControlsCardProps {
  cardBg: string
  onSwapEnds: () => void
  onToggleServer: () => void
  onResetGame: () => void
  onResetMatch: () => void
}

export const MatchControlsCard = ({
  cardBg,
  onSwapEnds,
  onToggleServer,
  onResetGame,
  onResetMatch,
}: MatchControlsCardProps) => (
  <Card mt="lg" withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
    <Group gap="sm" wrap="wrap">
      <Button variant="light" leftSection={<IconRepeat size={18} />} onClick={onSwapEnds}>
        Swap ends
      </Button>
      <Button variant="light" onClick={onToggleServer}>
        Toggle server
      </Button>
      <Button variant="light" onClick={onResetGame}>
        Reset points
      </Button>
      <Button color="red" onClick={onResetMatch}>
        Start new match
      </Button>
    </Group>
  </Card>
)
