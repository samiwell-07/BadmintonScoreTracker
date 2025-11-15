import {
  ActionIcon,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
  type MantineColorScheme,
} from '@mantine/core'
import { IconArrowBackUp, IconMoon, IconSun } from '@tabler/icons-react'

interface MatchHeaderProps {
  cardBg: string
  mutedText: string
  onUndo: () => void
  onToggleColorMode: () => void
  colorScheme: MantineColorScheme
  canUndo: boolean
}

export const MatchHeader = ({
  cardBg,
  mutedText,
  onUndo,
  onToggleColorMode,
  colorScheme,
  canUndo,
}: MatchHeaderProps) => (
  <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }} shadow="lg">
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <div style={{ flex: 1, minWidth: '16rem' }}>
          <Title order={2}>Badminton Score Tracker</Title>
          <Text c={mutedText} mt="xs">
            Keep a responsive, offline-friendly record of every rally. Scores stay in local storage so you can close the tab and resume anytime.
          </Text>
        </div>
        <Group gap="sm">
          <Tooltip label="Swap light / dark mode">
            <ActionIcon
              variant="outline"
              size="lg"
              onClick={onToggleColorMode}
              aria-label="Toggle color scheme"
            >
              {colorScheme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Undo last change">
            <Button
              variant="light"
              leftSection={<IconArrowBackUp size={18} />}
              onClick={onUndo}
              disabled={!canUndo}
            >
              Undo
            </Button>
          </Tooltip>
        </Group>
      </Group>
    </Stack>
  </Card>
)
