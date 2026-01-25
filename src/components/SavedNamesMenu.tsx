import { ActionIcon, Avatar, Badge, Group, Menu, Stack, Text, Tooltip } from '@mantine/core'
import type { ActionIconProps, MenuProps } from '@mantine/core'
import { IconBookmarkPlus, IconCircleX, IconUserCircle } from '@tabler/icons-react'
import type { Translations } from '../i18n/translations'
import type { PlayerProfile } from '../types/match'

interface SavedNamesMenuProps {
  savedNames: PlayerProfile[]
  onApply: (profile: PlayerProfile) => void
  onSave?: () => void
  onClear?: () => void
  tooltipLabel?: string
  actionSize?: ActionIconProps['size']
  iconSize?: number
  menuPosition?: MenuProps['position']
  menuWithinPortal?: boolean
  saveLabel?: string
  clearLabel?: string
  t?: Translations['savedNamesMenu']
  quickApplyLimit?: number
}

export const SavedNamesMenu = ({
  savedNames,
  onApply,
  onSave,
  onClear,
  tooltipLabel = 'Saved names',
  actionSize = 'lg',
  iconSize = 18,
  menuPosition = 'bottom-end',
  menuWithinPortal = true,
  saveLabel = 'Save current name',
  clearLabel = 'Clear name',
  t,
  quickApplyLimit = 3,
}: SavedNamesMenuProps) => {
  const quickApplyProfiles = savedNames.slice(0, quickApplyLimit)
  const remainingProfiles = savedNames.slice(quickApplyProfiles.length)

  const renderAvatar = (profile: PlayerProfile) => {
    // If profile has an avatar image, show it
    if (profile.avatar) {
      return (
        <Avatar size={20} radius="xl" src={profile.avatar} alt={profile.label} />
      )
    }
    // Otherwise show icon or first letter
    const label = profile.icon ?? profile.label.charAt(0).toUpperCase()
    return (
      <Avatar size={20} radius="xl" color={profile.color} variant="light">
        {label}
      </Avatar>
    )
  }

  return (
    <Menu withinPortal={menuWithinPortal} position={menuPosition} shadow="md">
      <Menu.Target>
        <Tooltip label={t?.tooltip ?? tooltipLabel}>
          <ActionIcon variant="light" size={actionSize}>
            <IconUserCircle size={iconSize} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t?.menuLabel ?? 'Saved names'}</Menu.Label>

        <Menu.Label>{t?.quickApplyLabel ?? 'Quick apply'}</Menu.Label>
        {quickApplyProfiles.length === 0 ? (
          <Menu.Item disabled>{t?.quickApplyEmpty ?? 'Save a name to unlock quick apply.'}</Menu.Item>
        ) : (
          quickApplyProfiles.map((profile, index) => (
            <Menu.Item
              key={`quick-${profile.id}-${index}`}
              onClick={() => onApply(profile)}
              leftSection={renderAvatar(profile)}
            >
              <Stack gap={2} align="flex-start">
                <Text fw={600}>{profile.label}</Text>
                <Group gap={6} align="center">
                  <Badge size="xs" color="teal">
                    {t?.recentBadge ?? 'Recent'}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {t?.quickApplyHint ?? 'Fills this field instantly.'}
                  </Text>
                </Group>
              </Stack>
            </Menu.Item>
          ))
        )}

        {onClear && (
          <Menu.Item leftSection={<IconCircleX size={iconSize} />} onClick={onClear}>
            <Stack gap={2} align="flex-start">
              <Text fw={600}>{clearLabel}</Text>
              <Text size="xs" c="dimmed">
                {t?.clearHelper ?? 'Revert to the default placeholder name.'}
              </Text>
            </Stack>
          </Menu.Item>
        )}

        {(remainingProfiles.length > 0 || savedNames.length === 0) && (
          <>
            <Menu.Divider />
            <Menu.Label>{t?.allNamesLabel ?? 'All saved names'}</Menu.Label>
            {savedNames.length === 0 ? (
              <Menu.Item disabled>{t?.noSavedNames ?? 'No saved names'}</Menu.Item>
            ) : (
              remainingProfiles.map((profile) => (
                <Menu.Item
                  key={profile.id}
                  onClick={() => onApply(profile)}
                  leftSection={renderAvatar(profile)}
                >
                  {profile.label}
                </Menu.Item>
              ))
            )}
          </>
        )}

        {onSave && (
          <>
            <Menu.Divider />
            <Menu.Item leftSection={<IconBookmarkPlus size={16} />} onClick={onSave}>
              <Stack gap={2} align="flex-start">
                <Text fw={600}>{saveLabel}</Text>
                <Text size="xs" c="dimmed">
                  {t?.saveHelper ?? 'Adds the current input to this list.'}
                </Text>
              </Stack>
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}
