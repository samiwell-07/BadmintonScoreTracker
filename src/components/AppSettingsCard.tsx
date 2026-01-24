import { Card, Group, Stack, Switch, Text, Title, Kbd, Divider, Badge } from '@mantine/core'
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import type { Translations } from '../i18n/translations'
import { APP_VERSION } from '../App'

const SETTINGS_STORAGE_KEY = 'bst-app-settings'

interface AppSettings {
  soundEffectsEnabled: boolean
  hapticFeedbackEnabled: boolean
  keepScreenOnEnabled: boolean
}

const defaultSettings: AppSettings = {
  soundEffectsEnabled: true,
  hapticFeedbackEnabled: true,
  keepScreenOnEnabled: true,
}

export const readAppSettings = (): AppSettings => {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return defaultSettings
  }
}

export const saveAppSettings = (settings: Partial<AppSettings>) => {
  if (typeof window === 'undefined') return
  try {
    const current = readAppSettings()
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...current, ...settings })
    )
  } catch {
    /* noop */
  }
}

interface AppSettingsCardProps {
  cardBg: string
  mutedText: string
  soundEnabled: boolean
  hapticEnabled: boolean
  keepScreenOn: boolean
  onSoundToggle: (enabled: boolean) => void
  onHapticToggle: (enabled: boolean) => void
  onKeepScreenOnToggle: (enabled: boolean) => void
  onShowOnboarding: () => void
  t: Translations
}

export const AppSettingsCard = ({
  cardBg,
  mutedText,
  soundEnabled,
  hapticEnabled,
  keepScreenOn,
  onSoundToggle,
  onHapticToggle,
  onKeepScreenOnToggle,
  onShowOnboarding,
  t,
}: AppSettingsCardProps) => {
  const { isMobile, isTouchDevice } = useDeviceDetect()
  
  // Only show haptic on devices that support it
  const showHapticOption = isTouchDevice && 'vibrate' in navigator
  // Wake Lock API support check
  const showKeepScreenOn = 'wakeLock' in navigator
  
  return (
    <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
      <Stack gap="lg">
        <div>
          <Title order={5}>{t.settings2?.soundEffects ?? 'App Settings'}</Title>
        </div>

        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                {t.settings2?.soundEffects ?? 'Sound Effects'}
              </Text>
              <Text size="xs" c={mutedText}>
                {t.settings2?.soundEffectsDesc ?? 'Play heartbeat sound during critical points'}
              </Text>
            </div>
            <Switch
              checked={soundEnabled}
              onChange={(e) => onSoundToggle(e.currentTarget.checked)}
              color="teal"
            />
          </Group>

          {showHapticOption && (
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  {t.settings2?.hapticFeedback ?? 'Haptic Feedback'}
                </Text>
                <Text size="xs" c={mutedText}>
                  {t.settings2?.hapticFeedbackDesc ?? 'Vibrate on game and match wins'}
                </Text>
              </div>
              <Switch
                checked={hapticEnabled}
                onChange={(e) => onHapticToggle(e.currentTarget.checked)}
                color="teal"
              />
            </Group>
          )}

          {showKeepScreenOn && (
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  {t.settings2?.keepScreenOn ?? 'Keep Screen On'}
                </Text>
                <Text size="xs" c={mutedText}>
                  {t.settings2?.keepScreenOnDesc ?? 'Prevent screen from turning off during matches'}
                </Text>
              </div>
              <Switch
                checked={keepScreenOn}
                onChange={(e) => onKeepScreenOnToggle(e.currentTarget.checked)}
                color="teal"
              />
            </Group>
          )}
        </Stack>

        <Divider />

        {/* Only show keyboard shortcuts on desktop */}
        {!isMobile && (
          <>
            <div>
              <Text size="sm" fw={500} mb="xs">
                {t.settings2?.showKeyboardShortcuts ?? 'Keyboard Shortcuts'}
              </Text>
              <Stack gap="xs">
                {KEYBOARD_SHORTCUTS.map((shortcut) => (
                  <Group key={shortcut.key} gap="sm">
                    <Kbd>{shortcut.key}</Kbd>
                    <Text size="xs" c={mutedText}>
                      {shortcut.description}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </div>

            <Divider />
          </>
        )}

        <Group justify="space-between" align="center">
          <Text size="xs" c={mutedText}>
            {t.settings2?.appVersion ?? 'App Version'}
          </Text>
          <Badge variant="light" color="gray">
            v{APP_VERSION}
          </Badge>
        </Group>

        <Text
          size="xs"
          c="teal"
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={onShowOnboarding}
        >
          {t.onboarding?.welcome ? 'Show welcome tour again' : 'Show Welcome Tour'}
        </Text>
      </Stack>
    </Card>
  )
}
