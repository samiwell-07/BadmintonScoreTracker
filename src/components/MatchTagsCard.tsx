import { Card, Stack, Text, Title, Group, Chip } from '@mantine/core'
import { MATCH_TAGS, type MatchTag } from '../types/match'
import type { Translations } from '../i18n/translations'
import { IconTag } from '@tabler/icons-react'

interface MatchTagsCardProps {
  selectedTags: MatchTag[]
  onToggleTag: (tag: MatchTag) => void
  cardBg: string
  mutedText: string
  t: Translations
}

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

export const MatchTagsCard = ({
  selectedTags,
  onToggleTag,
  cardBg,
  mutedText,
  t,
}: MatchTagsCardProps) => {
  return (
    <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconTag size={18} />
            <Title order={5}>{t.matchTags?.title ?? 'Match Type'}</Title>
          </Group>
          <Text size="xs" c={mutedText}>
            {t.matchTags?.hint ?? 'Tag this match'}
          </Text>
        </Group>

        <Chip.Group multiple value={selectedTags} onChange={(values) => {
          // Find which tag changed
          const currentSet = new Set(selectedTags)
          const newSet = new Set(values as MatchTag[])
          
          // Find added tag
          for (const val of newSet) {
            if (!currentSet.has(val)) {
              onToggleTag(val)
              return
            }
          }
          
          // Find removed tag
          for (const val of currentSet) {
            if (!newSet.has(val)) {
              onToggleTag(val)
              return
            }
          }
        }}>
          <Group gap="sm">
            {MATCH_TAGS.map((tag) => (
              <Chip
                key={tag}
                value={tag}
                color={getTagColor(tag)}
                variant="outline"
                size="sm"
              >
                {getTagLabel(tag, t)}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>
    </Card>
  )
}

// Compact inline tags display for match history
interface MatchTagsBadgesProps {
  tags: MatchTag[]
  t: Translations
}

export const MatchTagsBadges = ({ tags, t }: MatchTagsBadgesProps) => {
  if (!tags || tags.length === 0) return null

  return (
    <Group gap={4}>
      {tags.map((tag) => (
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
    </Group>
  )
}
