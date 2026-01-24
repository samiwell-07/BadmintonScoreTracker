import { useState } from 'react'
import {
  Card,
  Text,
  Stack,
  Group,
  Textarea,
  Button,
  ActionIcon,
  ScrollArea,
  Badge,
  Divider,
} from '@mantine/core'
import { IconNotes, IconTrash, IconPlus } from '@tabler/icons-react'
import type { MatchNote } from '../types/match'
import type { Translations } from '../i18n/translations'

interface MatchNotesCardProps {
  notes: MatchNote[]
  onAddNote: (text: string) => void
  onDeleteNote: (noteId: string) => void
  t: Translations
}

export function MatchNotesCard({
  notes,
  onAddNote,
  onDeleteNote,
  t,
}: MatchNotesCardProps) {
  const [noteText, setNoteText] = useState('')

  const translations = t.matchNotes || {
    title: 'Match Notes',
    note: 'note',
    notes: 'notes',
    placeholder: 'Add a note about this match...',
    ctrlEnterHint: 'Ctrl+Enter to add',
    addNote: 'Add Note',
    deleteNote: 'Delete note',
    game: 'Game',
    empty: 'No notes yet. Add observations, tactics, or reminders.',
  }

  const handleAddNote = () => {
    const trimmed = noteText.trim()
    if (trimmed) {
      onAddNote(trimmed)
      setNoteText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddNote()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconNotes size={20} />
            <Text fw={600}>{translations.title}</Text>
          </Group>
          <Badge variant="light" size="sm">
            {notes.length} {notes.length === 1 ? translations.note : translations.notes}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Textarea
            placeholder={translations.placeholder}
            value={noteText}
            onChange={(e) => setNoteText(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            minRows={2}
            maxRows={4}
            autosize
          />
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {translations.ctrlEnterHint}
            </Text>
            <Button
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={handleAddNote}
              disabled={!noteText.trim()}
            >
              {translations.addNote}
            </Button>
          </Group>
        </Stack>

        {notes.length > 0 && (
          <>
            <Divider />
            <ScrollArea.Autosize mah={250}>
              <Stack gap="xs">
                {[...notes].reverse().map((note) => (
                  <Card key={note.id} padding="xs" radius="sm" withBorder>
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap={4} style={{ flex: 1 }}>
                        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                          {note.text}
                        </Text>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            {formatTime(note.timestamp)}
                          </Text>
                          <Badge size="xs" variant="outline">
                            {translations.game} {note.gameNumber}
                          </Badge>
                          <Badge size="xs" variant="light" color="blue">
                            {note.scoreSnapshot.playerA}-{note.scoreSnapshot.playerB}
                          </Badge>
                        </Group>
                      </Stack>
                      <ActionIcon
                        size="sm"
                        color="red"
                        variant="subtle"
                        onClick={() => onDeleteNote(note.id)}
                        aria-label={translations.deleteNote}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          </>
        )}

        {notes.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="md">
            {translations.empty}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
