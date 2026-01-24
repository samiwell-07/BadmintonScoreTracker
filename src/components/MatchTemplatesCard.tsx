import { useCallback, useEffect, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconBookmark, IconTrash, IconPlus, IconTemplate } from '@tabler/icons-react'
import type { MatchTag } from '../types/match'
import type { Translations } from '../i18n/translations'

const TEMPLATES_STORAGE_KEY = 'bst-match-templates'
const MAX_TEMPLATES = 8

export interface MatchTemplate {
  id: string
  name: string
  createdAt: number
  config: {
    raceTo: number
    bestOf: number
    winByTwo: boolean
    doublesMode: boolean
    tags: MatchTag[]
    playerAName?: string
    playerBName?: string
  }
}

const loadTemplates = (): MatchTemplate[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(TEMPLATES_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as MatchTemplate[]
  } catch {
    return []
  }
}

const saveTemplates = (templates: MatchTemplate[]) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates))
  } catch {
    /* noop */
  }
}

interface MatchTemplatesCardProps {
  cardBg: string
  mutedText: string
  currentConfig: {
    raceTo: number
    bestOf: number
    winByTwo: boolean
    doublesMode: boolean
    tags: MatchTag[]
    playerAName: string
    playerBName: string
  }
  onApplyTemplate: (template: MatchTemplate) => void
  t: Translations
}

export const MatchTemplatesCard = ({
  cardBg,
  mutedText,
  currentConfig,
  onApplyTemplate,
  t,
}: MatchTemplatesCardProps) => {
  const [templates, setTemplates] = useState<MatchTemplate[]>([])
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')

  // Load templates on mount
  useEffect(() => {
    setTemplates(loadTemplates())
  }, [])

  const handleSaveTemplate = useCallback(() => {
    if (!templateName.trim()) return

    const newTemplate: MatchTemplate = {
      id: `template-${Date.now()}`,
      name: templateName.trim(),
      createdAt: Date.now(),
      config: {
        raceTo: currentConfig.raceTo,
        bestOf: currentConfig.bestOf,
        winByTwo: currentConfig.winByTwo,
        doublesMode: currentConfig.doublesMode,
        tags: currentConfig.tags,
        playerAName: currentConfig.playerAName || undefined,
        playerBName: currentConfig.playerBName || undefined,
      },
    }

    const updated = [newTemplate, ...templates].slice(0, MAX_TEMPLATES)
    setTemplates(updated)
    saveTemplates(updated)
    setTemplateName('')
    setSaveModalOpen(false)
  }, [templateName, currentConfig, templates])

  const handleDeleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const updated = prev.filter((tmpl) => tmpl.id !== id)
      saveTemplates(updated)
      return updated
    })
  }, [])

  const handleApply = useCallback(
    (template: MatchTemplate) => {
      onApplyTemplate(template)
    },
    [onApplyTemplate]
  )

  const getConfigLabel = (config: MatchTemplate['config']) => {
    const parts: string[] = []
    parts.push(`${config.raceTo} pts`)
    parts.push(`Best of ${config.bestOf}`)
    if (config.winByTwo) parts.push('Win by 2')
    if (config.doublesMode) parts.push('Doubles')
    return parts.join(' • ')
  }

  const getTagLabel = (tag: MatchTag): string => {
    const labels: Record<MatchTag, string> = {
      training: t.matchTags?.training ?? 'Training',
      league: t.matchTags?.league ?? 'League',
      friendly: t.matchTags?.friendly ?? 'Friendly',
      tournament: t.matchTags?.tournament ?? 'Tournament',
    }
    return labels[tag]
  }

  const getTagColor = (tag: MatchTag): string => {
    const colors: Record<MatchTag, string> = {
      training: 'blue',
      league: 'orange',
      friendly: 'green',
      tournament: 'red',
    }
    return colors[tag]
  }

  return (
    <>
      <Card withBorder radius="lg" p="xl" style={{ backgroundColor: cardBg }}>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconTemplate size={20} />
              <Title order={5}>{t.templates?.title ?? 'Match Templates'}</Title>
            </Group>
            <Tooltip label={t.templates?.saveCurrentTooltip ?? 'Save current settings as template'}>
              <Button
                variant="light"
                color="teal"
                size="xs"
                leftSection={<IconPlus size={16} />}
                onClick={() => setSaveModalOpen(true)}
                disabled={templates.length >= MAX_TEMPLATES}
              >
                {t.templates?.save ?? 'Save'}
              </Button>
            </Tooltip>
          </Group>

          <Text size="xs" c={mutedText}>
            {t.templates?.hint ?? 'Save and quickly apply your favorite match configurations'}
          </Text>

          {templates.length === 0 ? (
            <Text size="sm" c={mutedText} ta="center" py="md">
              {t.templates?.empty ?? 'No templates saved yet. Save your current settings to create a template.'}
            </Text>
          ) : (
            <Stack gap="xs">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  withBorder
                  p="sm"
                  radius="md"
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                  }}
                  onClick={() => handleApply(template)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ''
                    e.currentTarget.style.boxShadow = ''
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs" wrap="nowrap">
                        <IconBookmark size={14} color="var(--mantine-color-teal-5)" />
                        <Text size="sm" fw={500} truncate>
                          {template.name}
                        </Text>
                      </Group>
                      <Text size="xs" c={mutedText}>
                        {getConfigLabel(template.config)}
                      </Text>
                      {template.config.tags.length > 0 && (
                        <Group gap={4}>
                          {template.config.tags.map((tag) => (
                            <Badge key={tag} size="xs" variant="light" color={getTagColor(tag)}>
                              {getTagLabel(tag)}
                            </Badge>
                          ))}
                        </Group>
                      )}
                      {(template.config.playerAName || template.config.playerBName) && (
                        <Text size="xs" c={mutedText}>
                          {template.config.playerAName || 'Player 1'} vs {template.config.playerBName || 'Player 2'}
                        </Text>
                      )}
                    </Stack>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTemplate(template.id)
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      <Modal
        opened={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title={t.templates?.saveTitle ?? 'Save Template'}
        centered
      >
        <Stack gap="md">
          <TextInput
            label={t.templates?.nameLabel ?? 'Template Name'}
            placeholder={t.templates?.namePlaceholder ?? 'e.g., League Match, Practice Session'}
            value={templateName}
            onChange={(e) => setTemplateName(e.currentTarget.value)}
            maxLength={30}
          />
          <Text size="xs" c={mutedText}>
            {t.templates?.saveDesc ?? 'This will save your current match settings (points, best of, win by two, doubles mode, tags, and player names).'}
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setSaveModalOpen(false)}>
              {t.common?.cancel ?? 'Cancel'}
            </Button>
            <Button
              color="teal"
              onClick={handleSaveTemplate}
              disabled={!templateName.trim()}
            >
              {t.templates?.save ?? 'Save'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
