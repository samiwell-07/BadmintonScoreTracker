import { useEffect, useMemo, useState } from 'react'
import {
  GAME_HISTORY_LIMIT,
  HISTORY_LIMIT,
  STORAGE_KEY,
  getDefaultName,
  createDefaultTeammateServerMap,
  type CompletedGame,
  type MatchState,
  type PlayerId,
} from '../types/match'
import { clampPoints, didWinGame } from '../utils/match'
import { showToast } from '../utils/notifications'
import type { Translations } from '../i18n/translations'
import { perfMonitor } from '../utils/performance'
import { createFreshClockState, getLiveElapsedMs } from './matchController/clock'
import { rotateRightCourtTeammate } from './matchController/teammates'
import { readFromStorage } from './matchController/state'
import { upsertSavedName } from './matchController/savedNames'
import { createGameId } from './matchController/ids'

export const useMatchController = (t: Translations) => {
  const [match, setMatch] = useState<MatchState>(readFromStorage)
  const [history, setHistory] = useState<MatchState[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(match))
  }, [match])

  const gamesNeeded = useMemo(() => Math.ceil(match.bestOf / 2), [match.bestOf])

  const pushUpdate = (updater: (state: MatchState) => MatchState) => {
    setMatch((previous) => {
      const next = updater(previous)
      setHistory((prevHistory) => [previous, ...prevHistory].slice(0, HISTORY_LIMIT))
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
    perfMonitor.recordUserFlow({
      type: delta > 0 ? 'award-point' : 'subtract-point',
      timestamp: performance.now(),
      metadata: { playerId, delta },
    })

    if (match.matchWinner && delta > 0) {
      showToast({
        title: t.toasts.matchFinishedTitle,
        description: t.toasts.matchFinishedBody,
        status: 'info',
      })
      return
    }

    pushUpdate((state) => {
      const wasServing = state.server === playerId
      const nextServerMap = { ...state.teammateServerMap }

      const players = state.players.map((player) => {
        if (player.id !== playerId) {
          return {
            ...player,
            teammates: player.teammates.map((mate) => ({ ...mate })),
          }
        }

        const nextPoints = clampPoints(player.points + delta, state.maxPoint)
        const nextTeammates = player.teammates.map((mate) => ({ ...mate }))

        return { ...player, points: nextPoints, teammates: nextTeammates }
      })

      if (delta < 0) {
        return { ...state, players }
      }

      const scorer = players.find((player) => player.id === playerId)!

      if (!nextServerMap[playerId] && scorer.teammates.length > 0) {
        nextServerMap[playerId] = scorer.teammates[0].id
      }
      const hasTeammates = scorer.teammates.length > 0
      if (wasServing && hasTeammates && scorer.teammates.length > 1) {
        rotateRightCourtTeammate(scorer, nextServerMap)
      }

      const opponent = players.find((player) => player.id !== playerId)!
      const liveElapsedMs = getLiveElapsedMs(state)

      if (didWinGame(scorer.points, opponent.points, state)) {
        let clockRunning = state.clockRunning
        let clockStartedAt = state.clockStartedAt
        let clockElapsedMs = state.clockElapsedMs

        const completedGame: CompletedGame = {
          id: createGameId(),
          number: state.completedGames.length + 1,
          timestamp: Date.now(),
          winnerId: playerId,
          winnerName: scorer.name,
          durationMs: liveElapsedMs,
          scores: players.reduce<CompletedGame['scores']>(
            (acc, player) => {
              acc[player.id] = { name: player.name, points: player.points }
              return acc
            },
            {} as CompletedGame['scores'],
          ),
        }

        const updatedPlayers = players.map((player) => ({
          ...player,
          points: 0,
          games: player.id === playerId ? player.games + 1 : player.games,
          teammates: player.teammates.map((mate) => ({ ...mate })),
        }))

        const winner = updatedPlayers.find((player) => player.id === playerId)!
        const isMatchWin = winner.games >= gamesNeeded
        const matchWinner = isMatchWin ? playerId : state.matchWinner

        if (isMatchWin) {
          clockElapsedMs = 0
          clockRunning = false
          clockStartedAt = null
        }

        showToast({
          title: isMatchWin
            ? t.toasts.matchWin(winner.name)
            : t.toasts.gameWin(winner.name),
          status: 'success',
        })

        return {
          ...state,
          players: updatedPlayers,
          server: playerId,
          matchWinner: matchWinner ?? null,
          completedGames: [completedGame, ...state.completedGames].slice(
            0,
            GAME_HISTORY_LIMIT,
          ),
          clockRunning,
          clockStartedAt,
          clockElapsedMs,
          teammateServerMap: nextServerMap,
        }
      }

      return {
        ...state,
        players,
        server: playerId,
        teammateServerMap: nextServerMap,
      }
    })
  }

  const handleUndo = () => {
    setHistory((previous) => {
      if (previous.length === 0) {
        showToast({ title: t.toasts.nothingToUndo, status: 'warning' })
        return previous
      }

      const [latest, ...rest] = previous
      setMatch(latest)
      return rest
    })
  }

  const handleResetGame = () => {
    perfMonitor.recordUserFlow({ type: 'reset-game', timestamp: performance.now() })
    pushUpdate((state) => ({
      ...state,
      players: state.players.map((player) => ({
        ...player,
        points: 0,
        teammates: player.teammates.map((mate) => ({ ...mate })),
      })),
      matchWinner: state.matchWinner,
    }))
  }

  const handleResetMatch = () => {
    perfMonitor.recordUserFlow({ type: 'reset-match', timestamp: performance.now() })
    pushUpdate((state) => ({
      ...state,
      players: state.players.map((player) => ({
        ...player,
        points: 0,
        games: 0,
        teammates: player.teammates.map((mate) => ({ ...mate })),
      })),
      matchWinner: null,
      server: 'playerA',
      teammateServerMap: createDefaultTeammateServerMap(),
      ...createFreshClockState(),
    }))
  }

  const handleClearHistory = () => {
    if (match.completedGames.length === 0) {
      showToast({ title: t.toasts.nothingToErase, status: 'info' })
      return
    }

    pushUpdate((state) => ({
      ...state,
      completedGames: [],
    }))

    showToast({ title: t.toasts.historyCleared, status: 'success' })
  }

  const handleSwapTeammates = (playerId: PlayerId) => {
    pushUpdate((state) => {
      const players = state.players.map((player) => {
        if (player.id !== playerId) {
          return {
            ...player,
            teammates: player.teammates.map((mate) => ({ ...mate })),
          }
        }

        if (player.teammates.length < 2) {
          return {
            ...player,
            teammates: player.teammates.map((mate) => ({ ...mate })),
          }
        }

        const cloned = player.teammates.map((mate) => ({ ...mate }))
        const [first, second, ...rest] = cloned
        return {
          ...player,
          teammates: [second, first, ...rest],
        }
      })

      const updatedPlayer = players.find((entry) => entry.id === playerId)
      const nextServerMap = { ...state.teammateServerMap }
      if (updatedPlayer && updatedPlayer.teammates.length > 0) {
        nextServerMap[playerId] = updatedPlayer.teammates[0].id
      }

      return {
        ...state,
        players,
        teammateServerMap: nextServerMap,
      }
    })
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

  const handleSetServer = (playerId: PlayerId) => {
    const isValidPlayer = match.players.some((player) => player.id === playerId)
    if (!isValidPlayer) {
      return
    }

    pushUpdate((state) => ({
      ...state,
      server: playerId,
    }))
  }

  const handleTeammateNameChange = (
    playerId: PlayerId,
    teammateId: string,
    name: string,
  ) => {
    const trimmed = name.trim()

    pushUpdate((state) => ({
      ...state,
      players: state.players.map((player) => {
        if (player.id !== playerId) {
          return {
            ...player,
            teammates: player.teammates.map((mate) => ({ ...mate })),
          }
        }

        return {
          ...player,
          teammates: player.teammates.map((mate) =>
            mate.id === teammateId
              ? { ...mate, name: trimmed }
              : { ...mate },
          ),
        }
      }),
    }))
  }

  const handleDoublesModeToggle = (enabled: boolean) => {
    perfMonitor.recordUserFlow({
      type: 'toggle-doubles-mode',
      timestamp: performance.now(),
      metadata: { enabled },
    })
    pushUpdate((state) => ({
      ...state,
      doublesMode: enabled,
    }))
  }

  const handleSavePlayerName = (playerId: PlayerId) => {
    const player = match.players.find((entry) => entry.id === playerId)
    if (!player) {
      return
    }

    const trimmed = player.name.trim()
    if (!trimmed) {
      showToast({ title: t.toasts.cannotSaveEmptyName, status: 'warning' })
      return
    }

    pushUpdate((state) => ({
      ...state,
      savedNames: upsertSavedName(state.savedNames, trimmed),
    }))

    showToast({ title: t.toasts.savedName(trimmed), status: 'success' })
  }

  const handleSaveTeammateName = (playerId: PlayerId, teammateId: string) => {
    const player = match.players.find((entry) => entry.id === playerId)
    if (!player) {
      return
    }

    const teammate = player.teammates.find((mate) => mate.id === teammateId)
    if (!teammate) {
      return
    }

    const trimmed = teammate.name.trim()
    if (!trimmed) {
      showToast({ title: t.toasts.cannotSaveEmptyName, status: 'warning' })
      return
    }

    pushUpdate((state) => ({
      ...state,
      savedNames: upsertSavedName(state.savedNames, trimmed),
    }))

    showToast({ title: t.toasts.savedName(trimmed), status: 'success' })
  }

  const handleApplySavedName = (playerId: PlayerId, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      return
    }

    pushUpdate((state) => ({
      ...state,
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, name: trimmed } : player,
      ),
    }))
  }

  const handleClockToggle = () => {
    pushUpdate((state) => {
      if (state.clockRunning) {
        return {
          ...state,
          clockRunning: false,
          clockStartedAt: null,
          clockElapsedMs: getLiveElapsedMs(state),
        }
      }

      return {
        ...state,
        clockRunning: true,
        clockStartedAt: Date.now(),
      }
    })
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
      handleSwapTeammates,
      handleClearHistory,
      handleServerToggle,
      handleSetServer,
      handleTeammateNameChange,
      handleDoublesModeToggle,
      handleSavePlayerName,
      handleSaveTeammateName,
      handleApplySavedName,
      handleClockToggle,
      pushUpdate,
    },
  }
}
