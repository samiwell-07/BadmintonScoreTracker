import { useState } from 'react'
import {
  Card,
  Stack,
  Text,
  Group,
  Button,
  Alert,
} from '@mantine/core'
import { IconDownload, IconPhoto, IconCheck, IconX } from '@tabler/icons-react'
import { toPng } from 'html-to-image'
import type { Translations } from '../i18n/translations'

interface MatchExportCardProps {
  exportTargetRef: React.RefObject<HTMLElement | null>
  t: Translations
  cardBg: string
}

export function MatchExportCard({
  exportTargetRef,
  t,
  cardBg,
}: MatchExportCardProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const translations = t.export || {
    title: 'Export Match',
    hint: 'Save a snapshot of the current scoreboard',
    exportPng: 'Export as PNG',
    exporting: 'Exporting...',
    success: 'Image saved!',
    error: 'Export failed',
    filename: 'badminton-score',
  }

  const handleExportPng = async () => {
    if (!exportTargetRef.current) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }

    setExporting(true)
    setStatus('idle')

    try {
      const dataUrl = await toPng(exportTargetRef.current, {
        backgroundColor: '#1a1b1e', // Dark background for export
        pixelRatio: 2, // Higher resolution
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      })

      // Create download link
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().slice(0, 10)
      link.download = `${translations.filename}-${timestamp}.png`
      link.href = dataUrl
      link.click()

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder bg={cardBg}>
      <Stack gap="md">
        <Group gap="xs">
          <IconPhoto size={20} />
          <Text fw={600}>{translations.title}</Text>
        </Group>

        <Text size="sm" c="dimmed">
          {translations.hint}
        </Text>

        {status === 'success' && (
          <Alert
            icon={<IconCheck size={16} />}
            color="green"
            variant="light"
          >
            {translations.success}
          </Alert>
        )}

        {status === 'error' && (
          <Alert
            icon={<IconX size={16} />}
            color="red"
            variant="light"
          >
            {translations.error}
          </Alert>
        )}

        <Button
          leftSection={<IconDownload size={16} />}
          onClick={handleExportPng}
          loading={exporting}
          disabled={exporting}
          fullWidth
        >
          {exporting ? translations.exporting : translations.exportPng}
        </Button>
      </Stack>
    </Card>
  )
}
