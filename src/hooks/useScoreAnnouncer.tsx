import { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Text } from '@mantine/core'
import type { PlayerId, PlayerState } from '../types/match'

interface UseScoreAnnouncerProps {
  players: PlayerState[]
  language: 'en' | 'fr'
}

/**
 * Hook for screen reader announcements of score changes
 * Returns a component to render and an announce function
 */
export const useScoreAnnouncer = ({ players, language }: UseScoreAnnouncerProps) => {
  const [announcement, setAnnouncement] = useState('')
  const prevScores = useRef<Record<PlayerId, number>>({
    playerA: players.find((p) => p.id === 'playerA')?.points ?? 0,
    playerB: players.find((p) => p.id === 'playerB')?.points ?? 0,
  })

  const announce = useCallback((message: string) => {
    // Clear first to ensure the same message is re-announced
    setAnnouncement('')
    requestAnimationFrame(() => {
      setAnnouncement(message)
    })
  }, [])

  useEffect(() => {
    const playerA = players.find((p) => p.id === 'playerA')
    const playerB = players.find((p) => p.id === 'playerB')

    if (!playerA || !playerB) return

    const prevA = prevScores.current.playerA
    const prevB = prevScores.current.playerB
    const currA = playerA.points
    const currB = playerB.points

    // Detect score changes
    if (currA !== prevA || currB !== prevB) {
      const scoreText =
        language === 'en'
          ? `Score: ${playerA.name} ${currA}, ${playerB.name} ${currB}`
          : `Score: ${playerA.name} ${currA}, ${playerB.name} ${currB}`

      // Add context for special situations
      let context = ''
      if (currA === currB && currA >= 20) {
        context = language === 'en' ? '. Deuce!' : '. Égalité!'
      } else if (currA >= 20 && currA - currB === 1) {
        context =
          language === 'en'
            ? `. Game point for ${playerA.name}`
            : `. Balle de jeu pour ${playerA.name}`
      } else if (currB >= 20 && currB - currA === 1) {
        context =
          language === 'en'
            ? `. Game point for ${playerB.name}`
            : `. Balle de jeu pour ${playerB.name}`
      }

      announce(scoreText + context)

      prevScores.current = { playerA: currA, playerB: currB }
    }
  }, [players, announce, language])

  // Aria-live region component
  const AnnouncerRegion = () => (
    <Box
      component="div"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      <Text>{announcement}</Text>
    </Box>
  )

  return { AnnouncerRegion, announce }
}
