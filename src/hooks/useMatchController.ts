import { useEffect, useMemo, useState } from 'react'
import {
  BEST_OF_OPTIONS,
  DEFAULT_STATE,
  HISTORY_LIMIT,
  STORAGE_KEY,
  getDefaultName,
  type MatchState,
  type PlayerId,
} from '../types/match'
import { clampPoints, didWinGame } from '../utils/match'
import { showToast } from '../utils/notifications'

const readFromStorage = (): MatchState => {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE
  }

  const isValidBestOf = (value: unknown): value is MatchState['bestOf'] =>
    typeof value === 'number' &&
    BEST_OF_OPTIONS.some((option) => option === value)

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return DEFAULT_STATE
    }

    const parsed = JSON.parse(stored) as Partial<MatchState>
    const parsedBestOf = isValidBestOf(parsed.bestOf)
      ? parsed.bestOf
      : DEFAULT_STATE.bestOf
    const parsedMaxPoint = parsed.maxPoint ?? DEFAULT_STATE.maxPoint
    const parsedRaceTo = parsed.raceTo ?? DEFAULT_STATE.raceTo

    return {
      ...DEFAULT_STATE,
      ...parsed,
      players:
        parsed.players?.map((player, index) => ({
          ...DEFAULT_STATE.players[index],
          ...player,
        })) ?? DEFAULT_STATE.players,
      matchWinner: parsed.matchWinner ?? null,
      server: parsed.server ?? DEFAULT_STATE.server,
      raceTo: Math.min(parsedRaceTo, parsedMaxPoint),
      maxPoint: parsedMaxPoint,
      winByTwo: parsed.winByTwo ?? DEFAULT_STATE.winByTwo,
      bestOf: parsedBestOf,
    }
  } catch (error) {
    console.warn('Failed to parse stored match state', error)
    return DEFAULT_STATE
  }
}

export const useMatchController = () => {
  const [match, setMatch] = useState<MatchState>(readFromStorage)
  const [history, setHistory] = useState<MatchState[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(match))
  }, [match])

  const gamesNeeded = useMemo(
    () => Math.ceil(match.bestOf / 2),
    [match.bestOf],
  )

  const pushUpdate = (updater: (state: MatchState) => MatchState) => {
    setMatch((previous) => {
      const next = updater(previous)
      setHistory((prevHistory) =>
        [previous, ...prevHistory].slice(0, HISTORY_LIMIT),
      )
      return { ...next, lastUpdated: Date.now() }
    })
  }

  const handleNameChange = (playerId: PlayerId, name: string) => {
    const trimmed = name.trim() || getDefaultName(playerId)
    pushUpdate((state) => ({
      ...state,
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, name: trimmed } : player,
      ),
    }))
  }

  const handlePointChange = (playerId: PlayerId, delta: number) => {
    if (match.matchWinner && delta > 0) {
      showToast({
        title: 'Match finished',
        description: 'Start a new match to keep scoring.',
        status: 'info',
      })
      return
    }

    pushUpdate((state) => {
      const players = state.players.map((player) => {
        if (player.id !== playerId) {
          return { ...player }
        }

        const nextPoints = clampPoints(player.points + delta, state.maxPoint)
        return { ...player, points: nextPoints }
      })

      if (delta < 0) {
        return { ...state, players }
      }

      const scorer = players.find((player) => player.id === playerId)!
      const opponent = players.find((player) => player.id !== playerId)!

      if (didWinGame(scorer.points, opponent.points, state)) {
        const updatedPlayers = players.map((player) => ({
          ...player,
          points: 0,
          games: player.id === playerId ? player.games + 1 : player.games,
        }))

        const winner = updatedPlayers.find(
          (player) => player.id === playerId,
        )!
        const isMatchWin = winner.games >= gamesNeeded
        const matchWinner = isMatchWin ? playerId : state.matchWinner

        showToast({
          title: `${winner.name} wins the ${isMatchWin ? 'match' : 'game'}`,
          status: 'success',
        })

        return {
          ...state,
          players: updatedPlayers,
          server: playerId,
          matchWinner: matchWinner ?? null,
        }
      }

      return { ...state, players, server: playerId }
    })
  }

  const handleUndo = () => {
    setHistory((previous) => {
      if (previous.length === 0) {
        showToast({ title: 'Nothing to undo', status: 'warning' })
        return previous
      }

      const [latest, ...rest] = previous
      setMatch(latest)
      return rest
    })
  }

  const handleResetGame = () => {
    pushUpdate((state) => ({
      ...state,
      players: state.players.map((player) => ({
        ...player,
        points: 0,
      })),
      matchWinner: state.matchWinner,
    }))
  }

  const handleResetMatch = () => {
    pushUpdate((state) => ({
      ...state,
      players: state.players.map((player) => ({
        ...player,
        points: 0,
        games: 0,
      })),
      matchWinner: null,
      server: 'playerA',
    }))
  }

  const handleSwapEnds = () => {
    pushUpdate((state) => ({
      ...state,
      players: [...state.players].reverse(),
    }))
  }

  const handleServerToggle = () => {
    pushUpdate((state) => ({
      ...state,
      server: state.server === 'playerA' ? 'playerB' : 'playerA',
    }))
  }

  const matchIsLive = !match.matchWinner

  return {
    match,
    history,
    gamesNeeded,
    matchIsLive,
    actions: {
      handleNameChange,
      handlePointChange,
      handleUndo,
      handleResetGame,
      handleResetMatch,
      handleSwapEnds,
      handleServerToggle,
      pushUpdate,
    },
  }
}
