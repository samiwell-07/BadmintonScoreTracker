import { Avatar, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import type { PlayerId, PlayerProfile, PlayerState } from '../types/match'
import type { Translations } from '../i18n/translations'

interface ProfilesSettingsCardProps {
  cardBg: string
  mutedText: string
  players: PlayerState[]
  profiles: PlayerProfile[]
  onApplyProfile: (playerId: PlayerId, profile: PlayerProfile) => void
  onSaveProfile: (playerId: PlayerId) => void
  t: Translations
}

const getAvatarLabel = (profile: PlayerProfile | undefined, fallback: string) =>
  profile?.icon ?? fallback.charAt(0).toUpperCase()

export const ProfilesSettingsCard = ({
  cardBg,
  mutedText,
  players,
  profiles,
  onApplyProfile,
  onSaveProfile,
  t,
}: ProfilesSettingsCardProps) => (
  <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
    <Stack gap="md">
      <Stack gap={4}>
        <Title order={4}>{t.profilesPanel.title}</Title>
        <Text size="sm" c={mutedText}>
          {t.profilesPanel.description}
        </Text>
        {profiles.length > 0 && (
          <Text size="xs" c={mutedText}>
            {t.profilesPanel.applyHint}
          </Text>
        )}
      </Stack>

      {players.map((player) => {
        const currentProfile = profiles.find((profile) => profile.id === player.profileId)

        return (
          <Stack key={player.id} gap="xs">
            <Group justify="space-between" align="center" wrap="wrap">
              <Group align="center" gap="sm">
                <Avatar radius="xl" color={currentProfile?.color ?? 'gray'} variant="filled">
                  {getAvatarLabel(currentProfile, player.name)}
                </Avatar>
                <div>
                  <Text fw={600}>{player.name}</Text>
                  <Text size="xs" c={mutedText}>
                    {currentProfile
                      ? t.profilesPanel.linkedLabel(currentProfile.label)
                      : t.profilesPanel.unlinkedLabel}
                  </Text>
                </div>
              </Group>
              <Button size="xs" variant="light" onClick={() => onSaveProfile(player.id)}>
                {t.profilesPanel.saveButton}
              </Button>
            </Group>

            {profiles.length === 0 ? (
              <Text size="xs" c={mutedText}>
                {t.profilesPanel.emptyState}
              </Text>
            ) : (
              <Group gap="xs" wrap="wrap">
                {profiles.map((profile) => (
                  <Button
                    key={`${player.id}-${profile.id}`}
                    size="xs"
                    variant={player.profileId === profile.id ? 'filled' : 'light'}
                    color={profile.color}
                    onClick={() => onApplyProfile(player.id, profile)}
                    leftSection={
                      <Avatar size={20} radius="xl" color={profile.color} variant="filled">
                        {getAvatarLabel(profile, profile.label)}
                      </Avatar>
                    }
                  >
                    {profile.label}
                  </Button>
                ))}
              </Group>
            )}
          </Stack>
        )
      })}
    </Stack>
  </Card>
)
