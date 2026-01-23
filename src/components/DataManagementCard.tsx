import { useCallback } from 'react'
import { Button, Card, Group, Stack, Text, Title, Modal, Textarea, CopyButton, ActionIcon, Tooltip, Checkbox } from '@mantine/core'
import { IconDownload, IconUpload, IconCopy, IconCheck } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import type { MatchState } from '../types/match'
import type { CompletedMatchSummary } from '../types/match'
import { STORAGE_KEY, MATCH_SUMMARY_STORAGE_KEY } from '../types/match'
import type { Translations } from '../i18n/translations'

interface DataManagementCardProps {
  cardBg: string
  mutedText: string
  t: Translations
}

interface ExportData {
  version: 1
  exportedAt: string
  matchState: MatchState | null
  completedMatches: CompletedMatchSummary[]
}

export const DataManagementCard = ({ cardBg, mutedText, t }: DataManagementCardProps) => {
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [exportText, setExportText] = useState('')
  const [importCurrentMatch, setImportCurrentMatch] = useState(false)

  const handleExport = useCallback(() => {
    try {
      const matchStateRaw = localStorage.getItem(STORAGE_KEY)
      const completedMatchesRaw = localStorage.getItem(MATCH_SUMMARY_STORAGE_KEY)

      const exportData: ExportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        matchState: matchStateRaw ? JSON.parse(matchStateRaw) : null,
        completedMatches: completedMatchesRaw ? JSON.parse(completedMatchesRaw) : [],
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      setExportText(jsonString)
      setExportModalOpen(true)
    } catch (error) {
      notifications.show({
        title: t.dataManagement?.exportError ?? 'Export Error',
        message: t.dataManagement?.exportErrorMsg ?? 'Failed to export data',
        color: 'red',
      })
    }
  }, [t])

  const handleDownloadExport = useCallback(() => {
    try {
      const blob = new Blob([exportText], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `badminton-score-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      notifications.show({
        title: '✓',
        message: t.dataManagement?.downloadSuccess ?? 'Backup downloaded',
        color: 'teal',
      })
      setExportModalOpen(false)
    } catch (error) {
      notifications.show({
        title: t.dataManagement?.downloadError ?? 'Download Error',
        message: t.dataManagement?.downloadErrorMsg ?? 'Failed to download file',
        color: 'red',
      })
    }
  }, [exportText, t])

  const handleImport = useCallback(() => {
    try {
      const data: ExportData = JSON.parse(importText)

      if (data.version !== 1) {
        throw new Error('Unsupported backup version')
      }

      // Only import current match if checkbox is checked
      if (importCurrentMatch && data.matchState) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.matchState))
      }

      if (data.completedMatches && data.completedMatches.length > 0) {
        localStorage.setItem(MATCH_SUMMARY_STORAGE_KEY, JSON.stringify(data.completedMatches))
      }

      notifications.show({
        title: '✓',
        message: t.dataManagement?.importSuccess ?? 'Data imported successfully. Reloading...',
        color: 'teal',
      })

      setImportModalOpen(false)
      setImportText('')
      setImportCurrentMatch(false)

      // Reload to apply imported data
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      notifications.show({
        title: t.dataManagement?.importError ?? 'Import Error',
        message: t.dataManagement?.importErrorMsg ?? 'Invalid backup file format',
        color: 'red',
      })
    }
  }, [importText, importCurrentMatch, t])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setImportText(text)
    }
    reader.readAsText(file)
  }, [])

  return (
    <>
      <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
        <Stack gap="md">
          <div>
            <Title order={5}>{t.dataManagement?.title ?? 'Data Management'}</Title>
            <Text size="sm" c={mutedText}>
              {t.dataManagement?.description ?? 'Backup and restore your match data'}
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconDownload size={18} />}
              onClick={handleExport}
            >
              {t.dataManagement?.export ?? 'Export Backup'}
            </Button>
            <Button
              variant="light"
              leftSection={<IconUpload size={18} />}
              onClick={() => setImportModalOpen(true)}
            >
              {t.dataManagement?.import ?? 'Import Backup'}
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Export Modal */}
      <Modal
        opened={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={t.dataManagement?.exportTitle ?? 'Export Data'}
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c={mutedText}>
            {t.dataManagement?.exportHelp ?? 'Copy this data or download as a file to backup your matches.'}
          </Text>
          <div style={{ position: 'relative' }}>
            <Textarea
              value={exportText}
              readOnly
              minRows={10}
              maxRows={15}
              styles={{ input: { fontFamily: 'monospace', fontSize: '0.75rem' } }}
            />
            <CopyButton value={exportText}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied!' : 'Copy'}>
                  <ActionIcon
                    color={copied ? 'teal' : 'gray'}
                    variant="subtle"
                    onClick={copy}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </div>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setExportModalOpen(false)}>
              {t.common?.cancel ?? 'Cancel'}
            </Button>
            <Button leftSection={<IconDownload size={18} />} onClick={handleDownloadExport}>
              {t.dataManagement?.downloadFile ?? 'Download File'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Import Modal */}
      <Modal
        opened={importModalOpen}
        onClose={() => {
          setImportModalOpen(false)
          setImportCurrentMatch(false)
        }}
        title={t.dataManagement?.importTitle ?? 'Import Data'}
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c={mutedText}>
            {t.dataManagement?.importHelp ?? 'Paste your backup data or upload a backup file.'}
          </Text>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ marginBottom: '0.5rem' }}
          />
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.currentTarget.value)}
            placeholder={t.dataManagement?.importPlaceholder ?? 'Paste backup data here...'}
            minRows={10}
            maxRows={15}
            styles={{ input: { fontFamily: 'monospace', fontSize: '0.75rem' } }}
          />
          <Checkbox
            checked={importCurrentMatch}
            onChange={(e) => setImportCurrentMatch(e.currentTarget.checked)}
            label={t.dataManagement?.importCurrentMatch ?? 'Also replace current match (unchecked = history only)'}
            color="teal"
          />
          <Text size="xs" c="orange">
            {importCurrentMatch 
              ? (t.dataManagement?.importWarning ?? '⚠️ This will replace your current match and history, then reload the app.')
              : (t.dataManagement?.importWarningHistoryOnly ?? '⚠️ This will replace your match history only, then reload the app.')}
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => {
              setImportModalOpen(false)
              setImportCurrentMatch(false)
            }}>
              {t.common?.cancel ?? 'Cancel'}
            </Button>
            <Button
              leftSection={<IconUpload size={18} />}
              onClick={handleImport}
              disabled={!importText.trim()}
              color="teal"
            >
              {t.dataManagement?.importData ?? 'Import Data'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
