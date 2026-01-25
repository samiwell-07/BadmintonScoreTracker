import { Card, Group, Stack, Switch, Text, Title, Kbd, Divider, Badge, ColorSwatch, Tooltip, ActionIcon } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import { useCustomTheme, THEME_COLORS, type ThemeColor } from '../hooks/useCustomTheme'
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
  tvMode?: boolean
  onSoundToggle: (enabled: boolean) => void
  onHapticToggle: (enabled: boolean) => void
  onKeepScreenOnToggle: (enabled: boolean) => void
  onTvModeToggle?: () => void
  onShowOnboarding: () => void
  t: Translations
}

export const AppSettingsCard = ({
  cardBg,
  mutedText,
  soundEnabled,
  hapticEnabled,
  keepScreenOn,
  tvMode,
  onSoundToggle,
  onHapticToggle,
  onKeepScreenOnToggle,
  onTvModeToggle,
  onShowOnboarding,
  t,
}: AppSettingsCardProps) => {
  const { isMobile, isTouchDevice } = useDeviceDetect()
  const { primaryColor, accentColor, setPrimaryColor, setAccentColor, resetTheme } = useCustomTheme()
  
  // Only show haptic on devices that support it
  const showHapticOption = isTouchDevice && 'vibrate' in navigator
  // Wake Lock API support check
  const showKeepScreenOn = 'wakeLock' in navigator

  const colorSwatchStyle = (color: ThemeColor, isSelected: boolean) => ({
    cursor: 'pointer',
    border: isSelected ? '2px solid white' : '2px solid transparent',
    boxShadow: isSelected ? '0 0 0 2px var(--mantine-color-' + color + '-6)' : 'none',
  })
  
  return (
    <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
      <Stack gap="lg">
        <div>
          <Title order={5}>{t.settings2?.soundEffects ?? 'App Settings'}</Title>
        </div>

        {/* Custom Theme Section */}
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>🎨 Custom Theme</Text>
            <Tooltip label="Reset to default">
              <ActionIcon variant="subtle" size="sm" onClick={resetTheme}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
          
          <div>
            <Text size="xs" c={mutedText} mb={4}>Primary Color</Text>
            <Group gap={4}>
              {THEME_COLORS.map((color) => (
                <Tooltip key={color} label={color} withArrow>
                  <ColorSwatch
                    color={`var(--mantine-color-${color}-6)`}
                    size={24}
                    style={colorSwatchStyle(color, primaryColor === color)}
                    onClick={() => setPrimaryColor(color)}
                  />
                </Tooltip>
              ))}
            </Group>
          </div>

          <div>
            <Text size="xs" c={mutedText} mb={4}>Accent Color</Text>
            <Group gap={4}>
              {THEME_COLORS.map((color) => (
                <Tooltip key={color} label={color} withArrow>
                  <ColorSwatch
                    color={`var(--mantine-color-${color}-6)`}
                    size={24}
                    style={colorSwatchStyle(color, accentColor === color)}
                    onClick={() => setAccentColor(color)}
                  />
                </Tooltip>
              ))}
            </Group>
          </div>
        </Stack>

        <Divider />

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

          {onTvModeToggle && (
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>
                  📺 TV Mode
                </Text>
                <Text size="xs" c={mutedText}>
                  Large display optimized for streaming and casting
                </Text>
              </div>
              <Switch
                checked={tvMode}
                onChange={onTvModeToggle}
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
