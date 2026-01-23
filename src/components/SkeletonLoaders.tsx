import { Card, Group, Skeleton, Stack } from '@mantine/core'

interface SkeletonCardProps {
  cardBg: string
}

export const PlayerScoreCardSkeleton = ({ cardBg }: SkeletonCardProps) => (
  <Card withBorder radius="lg" p="xl" shadow="xl" style={{ backgroundColor: cardBg }}>
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Group gap="xs" style={{ flex: 1 }}>
          <Skeleton height={36} width={36} radius="md" />
          <Skeleton height={36} width="60%" radius="md" />
        </Group>
        <Group gap="xs">
          <Skeleton height={24} width={80} radius="xl" />
        </Group>
      </Group>
      <Stack gap="md">
        <div>
          <Skeleton height={14} width={50} mb={8} />
          <Skeleton height={64} width={80} radius="md" />
        </div>
        <Group gap="xs" grow>
          <Skeleton height={42} radius="md" />
          <Skeleton height={42} radius="md" />
        </Group>
      </Stack>
    </Stack>
  </Card>
)

export const SimpleScoreViewSkeleton = ({ cardBg }: SkeletonCardProps) => (
  <Stack gap="lg" align="center" w="100%">
    <Skeleton height={36} width={120} radius="md" />
    <Stack gap="lg" w="100%">
      {[1, 2].map((i) => (
        <Card key={i} radius="lg" withBorder shadow="lg" p="xl" style={{ backgroundColor: cardBg }}>
          <Stack gap="md" align="center">
            <Skeleton height={28} width="50%" radius="md" />
            <Skeleton height={64} width={100} radius="md" />
            <Group gap="xs">
              <Skeleton height={42} width={60} radius="md" />
              <Skeleton height={42} width={60} radius="md" />
            </Group>
          </Stack>
        </Card>
      ))}
    </Stack>
  </Stack>
)

export const MatchInsightsSkeleton = ({ cardBg }: SkeletonCardProps) => (
  <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }} shadow="lg">
    <Stack gap="md">
      <Group justify="space-between">
        <Skeleton height={24} width={120} />
        <Skeleton height={36} width={100} radius="md" />
      </Group>
      <Group gap="xl">
        <div>
          <Skeleton height={14} width={60} mb={4} />
          <Skeleton height={28} width={80} />
        </div>
        <div>
          <Skeleton height={14} width={80} mb={4} />
          <Skeleton height={28} width={60} />
        </div>
      </Group>
    </Stack>
  </Card>
)

export const GameHistorySkeleton = ({ cardBg }: SkeletonCardProps) => (
  <Card mt="lg" withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Skeleton height={20} width={120} mb={8} />
          <Skeleton height={14} width={180} />
        </div>
        <Group gap="xs">
          <Skeleton height={28} width={60} radius="md" />
          <Skeleton height={28} width={80} radius="md" />
        </Group>
      </Group>
      <Stack gap="sm">
        {[1, 2, 3].map((i) => (
          <Card key={i} withBorder radius="md" p="md" shadow="sm">
            <Stack gap={4}>
              <Group justify="space-between">
                <Skeleton height={16} width={60} />
                <Skeleton height={14} width={80} />
              </Group>
              <Group gap="xs">
                <Skeleton height={22} width={100} radius="xl" />
                <Skeleton height={22} width={60} radius="xl" />
                <Skeleton height={22} width={80} radius="xl" />
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  </Card>
)

export const MatchStatsSkeleton = ({ cardBg }: SkeletonCardProps) => (
  <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }} shadow="lg">
    <Stack gap="lg">
      <Group justify="space-between">
        <Skeleton height={24} width={140} />
        <Skeleton height={32} width={80} radius="md" />
      </Group>
      <Stack gap="md">
        {[1, 2, 3].map((i) => (
          <Group key={i} justify="space-between">
            <Skeleton height={16} width="40%" />
            <Skeleton height={16} width="20%" />
          </Group>
        ))}
      </Stack>
    </Stack>
  </Card>
)

export const DoublesCourtSkeleton = ({ cardBg }: SkeletonCardProps) => (
  <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }} shadow="lg">
    <Stack gap="md">
      <Skeleton height={20} width={160} />
      <Skeleton height={200} radius="md" />
      <Group gap="xs" justify="center">
        <Skeleton height={14} width={100} />
        <Skeleton height={14} width={120} />
      </Group>
    </Stack>
  </Card>
)
