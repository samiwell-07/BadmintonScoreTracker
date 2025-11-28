import { useEffect, useMemo, useState } from 'react'
import {
  GAME_HISTORY_LIMIT,
  HISTORY_LIMIT,
  MATCH_SUMMARY_LIMIT,
  STORAGE_KEY,
  getDefaultName,
  createDefaultTeammateServerMap,
  type CompletedGame,
  type CompletedMatchPlayerSummary,
  type CompletedMatchSummary,
  type MatchState,
  type PlayerId,
  type PlayerProfile,
} from '../types/match'
import { clampPoints, didWinGame } from '../utils/match'
import { showToast } from '../utils/notifications'
import type { Translations } from '../i18n/translations'
import { perfMonitor } from '../utils/performance'
import { createFreshClockState, getLiveElapsedMs } from './matchController/clock'
import { rotateRightCourtTeammate } from './matchController/teammates'
import { readFromStorage } from './matchController/state'
import { upsertSavedProfile } from './matchController/savedNames'
import { createGameId, createMatchId } from './matchController/ids'
import {
  persistCompletedMatchHistory,
  readCompletedMatchHistory,
} from './matchController/matches'

export const useMatchController = (t: Translations) => {
  const [match, setMatch] = useState<MatchState>(readFromStorage)
  const [history, setHistory] = useState<MatchState[]>([])
  const [completedMatches, setCompletedMatches] = useState<CompletedMatchSummary[]>(
    readCompletedMatchHistory,
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(match))
  }, [match])

  const gamesNeeded = useMemo(() => Math.ceil(match.bestOf / 2), [match.bestOf])

  const recordCompletedMatch = (summary: CompletedMatchSummary) => {
    setCompletedMatches((previous) => {
      const next = [summary, ...previous].slice(0, MATCH_SUMMARY_LIMIT)
      persistCompletedMatchHistory(next)
      return next
    })
  }

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
        player.id === playerId ? { ...player, name: trimmed, profileId: null } : player,
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

      // Auto-start clock when adding a point (if not already running)
      let clockRunning = state.clockRunning
      let clockStartedAt = state.clockStartedAt
      let clockElapsedMs = state.clockElapsedMs

      if (delta > 0 && !clockRunning) {
        clockRunning = true
        clockStartedAt = Date.now()
      }

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
        return { ...state, players, clockRunning, clockStartedAt, clockElapsedMs }
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
      const liveElapsedMs = getLiveElapsedMs({ ...state, clockRunning, clockStartedAt, clockElapsedMs })

      if (didWinGame(scorer.points, opponent.points, state)) {
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

        const completedGamesWithLatest = [completedGame, ...state.completedGames]

        const updatedPlayers = players.map((player) => ({
          ...player,
          points: 0,
          games: player.id === playerId ? player.games + 1 : player.games,
          teammates: player.teammates.map((mate) => ({ ...mate })),
        }))

        const winner = updatedPlayers.find((player) => player.id === playerId)!
        const isMatchWin = winner.games >= gamesNeeded
        const matchWinner = isMatchWin ? playerId : state.matchWinner

        // Stop clock when match is finished
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

        if (isMatchWin) {
          recordCompletedMatch(
            buildCompletedMatchSummary({
              games: completedGamesWithLatest,
              match: state,
              winnerId: playerId,
              winnerName: winner.name,
              durationMs: liveElapsedMs,
            }),
          )
        }

        return {
          ...state,
          players: updatedPlayers,
          server: playerId,
          matchWinner: matchWinner ?? null,
          completedGames: completedGamesWithLatest.slice(0, GAME_HISTORY_LIMIT),
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
        clockRunning,
        clockStartedAt,
        clockElapsedMs,
        teammateServerMap: nextServerMap,
      }
    })
  }

  const handleSetScores = (scores: { playerId: PlayerId; points: number }[]) => {
    perfMonitor.recordUserFlow({
      type: 'set-scores-directly',
      timestamp: performance.now(),
      metadata: { scores },
    })

    // Track what notification to show after state update
    let toastInfo: { title: string; status: 'success' } | null = null

    pushUpdate((state) => {
      // In Coach mode, if match is finished, auto-start a new match first
      let currentState = state
      if (state.matchWinner) {
        currentState = {
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
          // Keep completedGames - don't clear history
          clockRunning: false,
          clockStartedAt: null,
          clockElapsedMs: 0,
        }
      }

      // Apply the new scores
      const players = currentState.players.map((player) => {
        const scoreEntry = scores.find((s) => s.playerId === player.id)
        const nextPoints = scoreEntry
          ? clampPoints(scoreEntry.points, currentState.maxPoint)
          : player.points
        return {
          ...player,
          points: nextPoints,
          teammates: player.teammates.map((mate) => ({ ...mate })),
        }
      })

      // Check if either player has won the game
      const playerA = players.find((p) => p.id === 'playerA')!
      const playerB = players.find((p) => p.id === 'playerB')!

      const playerAWins = didWinGame(playerA.points, playerB.points, currentState)
      const playerBWins = didWinGame(playerB.points, playerA.points, currentState)

      // If no one wins, just update points
      if (!playerAWins && !playerBWins) {
        return { ...currentState, players }
      }

      // Determine winner (if both would win, higher score wins; if tied, playerA wins)
      const winnerId: PlayerId =
        playerAWins && playerBWins
          ? playerA.points >= playerB.points
            ? 'playerA'
            : 'playerB'
          : playerAWins
            ? 'playerA'
            : 'playerB'

      const winner = players.find((p) => p.id === winnerId)!

      // Coach mode: don't record duration (set to 0)
      const completedGame: CompletedGame = {
        id: createGameId(),
        number: currentState.completedGames.length + 1,
        timestamp: Date.now(),
        winnerId,
        winnerName: winner.name,
        durationMs: 0, // No time tracking in coach mode
        scores: players.reduce<CompletedGame['scores']>(
          (acc, player) => {
            acc[player.id] = { name: player.name, points: player.points }
            return acc
          },
          {} as CompletedGame['scores'],
        ),
      }

      const completedGamesWithLatest = [completedGame, ...currentState.completedGames]

      const updatedPlayers = players.map((player) => ({
        ...player,
        points: 0,
        games: player.id === winnerId ? player.games + 1 : player.games,
        teammates: player.teammates.map((mate) => ({ ...mate })),
      }))

      const updatedWinner = updatedPlayers.find((p) => p.id === winnerId)!
      const isMatchWin = updatedWinner.games >= gamesNeeded

      // Set toast info to show after state update (avoid double toast in StrictMode)
      toastInfo = {
        title: isMatchWin
          ? t.toasts.matchWin(updatedWinner.name)
          : t.toasts.gameWin(updatedWinner.name),
        status: 'success',
      }

      if (isMatchWin) {
        recordCompletedMatch(
          buildCompletedMatchSummary({
            games: completedGamesWithLatest,
            match: currentState,
            winnerId,
            winnerName: updatedWinner.name,
            durationMs: 0, // No time tracking in coach mode
          }),
        )

        // Auto-start new match but KEEP the game history
        return {
          ...currentState,
          players: currentState.players.map((player) => ({
            ...player,
            points: 0,
            games: 0,
            teammates: player.teammates.map((mate) => ({ ...mate })),
          })),
          matchWinner: null,
          server: 'playerA',
          teammateServerMap: createDefaultTeammateServerMap(),
          completedGames: completedGamesWithLatest.slice(0, GAME_HISTORY_LIMIT), // Keep history!
          clockRunning: false,
          clockStartedAt: null,
          clockElapsedMs: 0,
        }
      }

      return {
        ...currentState,
        players: updatedPlayers,
        server: winnerId,
        matchWinner: null,
        completedGames: completedGamesWithLatest.slice(0, GAME_HISTORY_LIMIT),
        // Keep clock state as is (don't modify it in coach mode)
      }
    })

    // Show toast after state update to avoid StrictMode double-invocation
    if (toastInfo) {
      showToast(toastInfo)
    }
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

    pushUpdate((state) => {
      const nextSaved = upsertSavedProfile(state.savedNames, trimmed)
      const linkedProfile = nextSaved.find((profile) => profile.label === trimmed) ?? null
      return {
        ...state,
        savedNames: nextSaved,
        players: state.players.map((entry) =>
          entry.id === playerId
            ? { ...entry, profileId: linkedProfile?.id ?? entry.profileId }
            : entry,
        ),
      }
    })

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
      savedNames: upsertSavedProfile(state.savedNames, trimmed),
    }))

    showToast({ title: t.toasts.savedName(trimmed), status: 'success' })
  }

  const handleApplySavedName = (playerId: PlayerId, profile: PlayerProfile) => {
    const trimmed = profile.label.trim()
    if (!trimmed) {
      return
    }

    pushUpdate((state) => ({
      ...state,
      players: state.players.map((player) =>
        player.id === playerId
          ? { ...player, name: trimmed, profileId: profile.id }
          : player,
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
    completedMatches,
    actions: {
      handleNameChange,
      handlePointChange,
      handleSetScores,
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

interface BuildSummaryInput {
  games: CompletedGame[]
  match: MatchState
  winnerId: PlayerId
  winnerName: string
  durationMs: number
}

const ensureUniqueProfileNames = (players: CompletedMatchPlayerSummary[]) => {
  const counts = new Map<string, number>()
  players.forEach((player) => {
    if (player.profileId) {
      return
    }
    counts.set(player.name, (counts.get(player.name) ?? 0) + 1)
  })

  const usage = new Map<string, number>()
  return players.map((player) => {
    if (player.profileId) {
      return player
    }
    const duplicates = counts.get(player.name) ?? 0
    if (duplicates <= 1) {
      return player
    }

    const nextIndex = (usage.get(player.name) ?? 0) + 1
    usage.set(player.name, nextIndex)
    return { ...player, name: `${player.name} ${nextIndex}` }
  })
}

const buildCompletedMatchSummary = ({
  games,
  match,
  winnerId,
  winnerName,
  durationMs,
}: BuildSummaryInput): CompletedMatchSummary => {
  const totalRallies = games.reduce((acc, game) => {
    const gameTotal = Object.values(game.scores).reduce(
      (sum, score) => sum + score.points,
      0,
    )
    return acc + gameTotal
  }, 0)

  const playerSummaries: CompletedMatchPlayerSummary[] = match.players.map((player) => {
    const pointsScored = games.reduce((sum, game) => {
      const score = game.scores[player.id]
      return sum + (score ? score.points : 0)
    }, 0)

    const gamesWon = games.reduce(
      (sum, game) => (game.winnerId === player.id ? sum + 1 : sum),
      0,
    )

    return {
      playerId: player.id,
      name: player.name,
      pointsScored,
      gamesWon,
      wonMatch: winnerId === player.id,
      profileId: player.profileId ?? null,
    }
  })

  return {
    id: createMatchId(),
    completedAt: Date.now(),
    durationMs: Math.max(0, durationMs),
    gamesPlayed: games.length,
    totalRallies,
    raceTo: match.raceTo,
    bestOf: match.bestOf,
    winByTwo: match.winByTwo,
    doublesMode: match.doublesMode,
    winnerId,
    winnerName,
    players: ensureUniqueProfileNames(playerSummaries),
  }
}
