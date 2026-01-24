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
import { notifications } from '@mantine/notifications'
import { IconArrowBackUp, IconMoon, IconShare, IconSun } from '@tabler/icons-react'
import type { Translations } from '../i18n/translations'
import logoImage from '../assets/logo.png'

const APP_URL = 'https://srouji.github.io/BadmintonScoreTracker/'

interface MatchHeaderProps {
  cardBg: string
  mutedText: string
  onUndo: () => void
  onToggleColorMode: () => void
  colorScheme: MantineColorScheme
  canUndo: boolean
  scoreOnlyMode: boolean
  onToggleScoreOnly: () => void
  simpleScoreMode: boolean
  onToggleSimpleScore: () => void
  language: 'en' | 'fr'
  onToggleLanguage: () => void
  t: Translations
}

const handleShareApp = async (t: Translations) => {
  const shareData = {
    title: 'Badminton Score Tracker',
    text: 'Track badminton match scores easily!',
    url: APP_URL,
  }

  try {
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(APP_URL)
      notifications.show({
        title: t.header.shareApp,
        message: t.header.shareAppCopied,
        color: 'teal',
      })
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      try {
        await navigator.clipboard.writeText(APP_URL)
        notifications.show({
          title: t.header.shareApp,
          message: t.header.shareAppCopied,
          color: 'teal',
        })
      } catch {
        notifications.show({
          title: t.header.shareApp,
          message: t.header.shareAppError,
          color: 'red',
        })
      }
    }
  }
}

export const MatchHeader = ({
  cardBg,
  mutedText,
  onUndo,
  onToggleColorMode,
  colorScheme,
  canUndo,
  scoreOnlyMode,
  onToggleScoreOnly,
  simpleScoreMode,
  onToggleSimpleScore,
  language,
  onToggleLanguage,
  t,
}: MatchHeaderProps) => (
  <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }} shadow="lg">
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Group gap={0} align="flex-start" style={{ flex: 1, minWidth: '16rem' }}>
          <div>
            <Title order={2}>{t.app.headerTitle}</Title>
            <Stack gap={4} mt="xs">
              {t.app.descriptionLines.map((line) => (
                <Text key={line} c={mutedText}>
                  {line}
                </Text>
              ))}
            </Stack>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <img
              src={logoImage}
              alt="Badminton Score Tracker Logo"
              style={{
                height: '14rem',
                width: 'auto',
                display: 'block',
                maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                maskComposite: 'intersect',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                WebkitMaskComposite: 'source-in',
              }}
            />
          </div>
        </Group>
        <Stack gap="xs" align="stretch" style={{ minWidth: '14rem', width: '100%' }}>
          <Group gap="sm" wrap="wrap" justify="flex-end">
            <Tooltip label={t.header.colorSchemeTooltip}>
              <ActionIcon
                variant="outline"
                size="lg"
                onClick={onToggleColorMode}
                aria-label={t.header.colorSchemeAriaLabel}
              >
                {colorScheme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t.header.languageTooltip}>
              <Button variant="light" onClick={onToggleLanguage}>
                {language === 'en' ? 'FR' : 'EN'}
              </Button>
            </Tooltip>
            <Tooltip label={t.header.undoTooltip}>
              <Button
                variant="light"
                leftSection={<IconArrowBackUp size={18} />}
                onClick={onUndo}
                disabled={!canUndo}
              >
                {t.header.undo}
              </Button>
            </Tooltip>
            <Tooltip label={t.header.shareAppTooltip}>
              <Button
                variant="light"
                color="teal"
                leftSection={<IconShare size={18} />}
                onClick={() => handleShareApp(t)}
              >
                {t.header.shareApp}
              </Button>
            </Tooltip>
          </Group>
          <Group gap="xs" grow wrap="wrap" style={{ width: '100%' }}>
            <Button
              variant={scoreOnlyMode ? 'filled' : 'light'}
              color={scoreOnlyMode ? 'teal' : 'gray'}
              onClick={onToggleScoreOnly}
              aria-pressed={scoreOnlyMode}
              styles={{
                root: { flex: 1, height: 'auto', minHeight: '2.25rem' },
                inner: { whiteSpace: 'normal', wordBreak: 'break-word' },
                label: { whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.3, padding: '0.25rem 0' },
              }}
            >
              {scoreOnlyMode ? t.header.scoreOnlyActive : t.header.scoreOnlyInactive}
            </Button>
            <Button
              variant={simpleScoreMode ? 'filled' : 'light'}
              color={simpleScoreMode ? 'teal' : 'gray'}
              onClick={onToggleSimpleScore}
              aria-pressed={simpleScoreMode}
              styles={{
                root: { flex: 1, height: 'auto', minHeight: '2.25rem' },
                inner: { whiteSpace: 'normal', wordBreak: 'break-word' },
                label: { whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.3, padding: '0.25rem 0' },
              }}
            >
              {simpleScoreMode ? t.header.simpleActive : t.header.simpleInactive}
            </Button>
          </Group>
        </Stack>
      </Group>
    </Stack>
  </Card>
)
