import { useEffect, useCallback, useRef } from 'react'
import type { PlayerId } from '../types/match'

interface UseKeyboardShortcutsProps {
  onPointChange: (playerId: PlayerId, delta: number) => void
  onUndo: () => void
  onToggleServer: () => void
  onSwapEnds: () => void
  onToggleClock: () => void
  matchIsLive: boolean
  enabled?: boolean
}

export const useKeyboardShortcuts = ({
  onPointChange,
  onUndo,
  onToggleServer,
  onSwapEnds,
  onToggleClock,
  matchIsLive,
  enabled = true,
}: UseKeyboardShortcutsProps) => {
  const lastKeyTime = useRef<number>(0)
  const DEBOUNCE_MS = 100

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Debounce rapid key presses
      const now = Date.now()
      if (now - lastKeyTime.current < DEBOUNCE_MS) {
        return
      }
      lastKeyTime.current = now

      const key = event.key.toLowerCase()

      // Prevent default for our shortcuts
      const shortcuts = ['a', 'b', 'q', 'w', 'z', 'u', 's', 'e', ' ']
      if (shortcuts.includes(key)) {
        event.preventDefault()
      }

      switch (key) {
        // Player A score
        case 'a':
          if (matchIsLive) {
            onPointChange('playerA', 1)
          }
          break
        case 'q':
          onPointChange('playerA', -1)
          break

        // Player B score
        case 'b':
          if (matchIsLive) {
            onPointChange('playerB', 1)
          }
          break
        case 'w':
          onPointChange('playerB', -1)
          break

        // Undo
        case 'z':
          if (event.ctrlKey || event.metaKey) {
            onUndo()
          }
          break
        case 'u':
          onUndo()
          break

        // Toggle server
        case 's':
          if (!event.ctrlKey && !event.metaKey) {
            onToggleServer()
          }
          break

        // Swap ends
        case 'e':
          onSwapEnds()
          break

        // Toggle clock (spacebar)
        case ' ':
          onToggleClock()
          break

        default:
          break
      }
    },
    [onPointChange, onUndo, onToggleServer, onSwapEnds, onToggleClock, matchIsLive],
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

export const KEYBOARD_SHORTCUTS = [
  { key: 'A', description: 'Player A +1 point' },
  { key: 'Q', description: 'Player A -1 point' },
  { key: 'B', description: 'Player B +1 point' },
  { key: 'W', description: 'Player B -1 point' },
  { key: 'U / Ctrl+Z', description: 'Undo last action' },
  { key: 'S', description: 'Toggle server' },
  { key: 'E', description: 'Swap ends' },
  { key: 'Space', description: 'Pause/Resume clock' },
] as const
