import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'bst-multicourt-state'

export interface CourtPlayer {
  name: string
  score: number
}

export interface Court {
  id: string
  name: string
  playerA: CourtPlayer
  playerB: CourtPlayer
  raceTo: number
  savedToHistory?: boolean
}

export interface MultiCourtState {
  courts: Court[]
}

const createDefaultCourt = (id: string, name: string): Court => ({
  id,
  name,
  playerA: { name: 'Player A', score: 0 },
  playerB: { name: 'Player B', score: 0 },
  raceTo: 21,
  savedToHistory: false,
})

const defaultState: MultiCourtState = {
  courts: [
    createDefaultCourt('court-1', 'Court 1'),
    createDefaultCourt('court-2', 'Court 2'),
  ],
}

const readStoredState = (): MultiCourtState => {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    // Validate structure
    if (parsed?.courts?.length >= 2) {
      return parsed
    }
    return defaultState
  } catch {
    return defaultState
  }
}

const saveState = (state: MultiCourtState) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export const useMultiCourt = () => {
  const [state, setState] = useState<MultiCourtState>(readStoredState)

  // Debounced save to localStorage
  useEffect(() => {
    const handle = window.setTimeout(() => {
      saveState(state)
    }, 200)
    return () => window.clearTimeout(handle)
  }, [state])

  const updateScore = useCallback((courtId: string, player: 'playerA' | 'playerB', delta: number) => {
    setState((prev) => ({
      ...prev,
      courts: prev.courts.map((court) =>
        court.id === courtId
          ? {
              ...court,
              [player]: {
                ...court[player],
                score: Math.max(0, court[player].score + delta),
              },
            }
          : court
      ),
    }))
  }, [])

  const updatePlayerName = useCallback((courtId: string, player: 'playerA' | 'playerB', name: string) => {
    setState((prev) => ({
      ...prev,
      courts: prev.courts.map((court) =>
        court.id === courtId
          ? {
              ...court,
              [player]: {
                ...court[player],
                name,
              },
            }
          : court
      ),
    }))
  }, [])

  const updateCourtName = useCallback((courtId: string, name: string) => {
    setState((prev) => ({
      ...prev,
      courts: prev.courts.map((court) =>
        court.id === courtId ? { ...court, name } : court
      ),
    }))
  }, [])

  const resetCourt = useCallback((courtId: string) => {
    setState((prev) => ({
      ...prev,
      courts: prev.courts.map((court) =>
        court.id === courtId
          ? {
              ...court,
              playerA: { ...court.playerA, score: 0 },
              playerB: { ...court.playerB, score: 0 },
            }
          : court
      ),
    }))
  }, [])

  const resetAll = useCallback(() => {
    setState(defaultState)
  }, [])

  const updateRaceTo = useCallback((courtId: string, raceTo: number) => {
    setState((prev) => ({
      ...prev,
      courts: prev.courts.map((court) =>
        court.id === courtId ? { ...court, raceTo } : court
      ),
    }))
  }, [])

  const addCourt = useCallback(() => {
    setState((prev) => {
      const courtNumber = prev.courts.length + 1
      const newCourt = createDefaultCourt(`court-${Date.now()}`, `Court ${courtNumber}`)
      return {
        ...prev,
        courts: [...prev.courts, newCourt],
      }
    })
  }, [])

  const removeCourt = useCallback((courtId: string) => {
    setState((prev) => {
      if (prev.courts.length <= 1) return prev
      return {
        ...prev,
        courts: prev.courts.filter((court) => court.id !== courtId),
      }
    })
  }, [])

  const markSavedToHistory = useCallback((courtId: string) => {
    setState((prev) => ({
      ...prev,
      courts: prev.courts.map((court) =>
        court.id === courtId ? { ...court, savedToHistory: true } : court
      ),
    }))
  }, [])

  return {
    courts: state.courts,
    updateScore,
    updatePlayerName,
    updateCourtName,
    resetCourt,
    resetAll,
    updateRaceTo,
    addCourt,
    removeCourt,
    markSavedToHistory,
  }
}
