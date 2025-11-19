import {
  BEST_OF_OPTIONS,
  DEFAULT_STATE,
  GAME_HISTORY_LIMIT,
  PROFILE_COLORS,
  SAVED_NAMES_LIMIT,
  STORAGE_KEY,
  createDefaultTeammateServerMap,
  type MatchState,
  type PlayerId,
  type PlayerProfile,
  type ProfileColor,
} from '../../types/match'
import { createFreshClockState } from './clock'
import { normalizeTeammates, normalizeTeammateServerMap } from './teammates'
import { createProfileId } from './ids'

const createDefaultPlayers = () =>
  DEFAULT_STATE.players.map((player) => ({
    ...player,
    teammates: player.teammates.map((teammate) => ({ ...teammate })),
  }))

export const createDefaultState = (): MatchState => ({
  ...DEFAULT_STATE,
  ...createFreshClockState(),
  players: createDefaultPlayers(),
  completedGames: [],
  savedNames: [],
  lastUpdated: Date.now(),
  doublesMode: DEFAULT_STATE.doublesMode,
  teammateServerMap: { ...createDefaultTeammateServerMap() },
})

const clampCompletedGames = (games: MatchState['completedGames']) =>
  games
    .map((game, index) => ({
      ...game,
      number: game?.number ?? index + 1,
      durationMs: typeof game?.durationMs === 'number' ? Math.max(0, game.durationMs) : 0,
    }))
    .slice(0, GAME_HISTORY_LIMIT)

const resolveProfileColor = (index: number): ProfileColor =>
  PROFILE_COLORS[index % PROFILE_COLORS.length]

const isProfileColor = (value: string): value is ProfileColor =>
  PROFILE_COLORS.includes(value as ProfileColor)

const sanitizeSavedProfiles = (value: unknown): PlayerProfile[] => {
  if (!Array.isArray(value)) {
    return DEFAULT_STATE.savedNames
  }

  const normalized: PlayerProfile[] = []

  value.forEach((entry, index) => {
    if (typeof entry === 'string') {
      const label = entry.trim()
      if (!label) {
        return
      }
      normalized.push({
        id: createProfileId(),
        label,
        color: resolveProfileColor(normalized.length),
      })
      return
    }

    if (typeof entry !== 'object' || entry === null) {
      return
    }

    const candidate = entry as Partial<PlayerProfile>
    const label = typeof candidate.label === 'string' ? candidate.label.trim() : ''
    if (!label) {
      return
    }

    const color =
      typeof candidate.color === 'string' && isProfileColor(candidate.color)
        ? candidate.color
        : resolveProfileColor(index)

    normalized.push({
      id: typeof candidate.id === 'string' ? candidate.id : createProfileId(),
      label,
      color,
      icon: typeof candidate.icon === 'string' ? candidate.icon : undefined,
    })
  })

  return normalized.slice(0, SAVED_NAMES_LIMIT)
}

const sanitizeClock = (parsed: Partial<MatchState>) => {
  const clockRunning =
    typeof parsed.clockRunning === 'boolean'
      ? parsed.clockRunning
      : DEFAULT_STATE.clockRunning
  const clockElapsedMs = Math.max(
    0,
    typeof parsed.clockElapsedMs === 'number'
      ? parsed.clockElapsedMs
      : DEFAULT_STATE.clockElapsedMs,
  )
  const clockStartedAt =
    typeof parsed.clockStartedAt === 'number'
      ? parsed.clockStartedAt
      : clockRunning
        ? Date.now()
        : null

  return { clockRunning, clockElapsedMs, clockStartedAt }
}

const isValidBestOf = (value: unknown): value is MatchState['bestOf'] =>
  typeof value === 'number' && BEST_OF_OPTIONS.some((option) => option === value)

export const readFromStorage = (): MatchState => {
  if (typeof window === 'undefined') {
    return createDefaultState()
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return createDefaultState()
    }

    const parsed = JSON.parse(stored) as Partial<MatchState>
    const parsedBestOf = isValidBestOf(parsed.bestOf)
      ? parsed.bestOf
      : DEFAULT_STATE.bestOf
    const parsedMaxPoint = parsed.maxPoint ?? DEFAULT_STATE.maxPoint
    const parsedRaceTo = parsed.raceTo ?? DEFAULT_STATE.raceTo

    const normalizedPlayers = DEFAULT_STATE.players.map((defaultPlayer, index) => {
      const storedPlayer = parsed.players?.[index]
      const resolvedId = (storedPlayer?.id as PlayerId) ?? defaultPlayer.id

      return {
        ...defaultPlayer,
        ...storedPlayer,
        id: resolvedId,
        teammates: normalizeTeammates(resolvedId, storedPlayer?.teammates),
      }
    })

    const { clockRunning, clockElapsedMs, clockStartedAt } = sanitizeClock(parsed)

    return {
      ...createDefaultState(),
      ...parsed,
      players: normalizedPlayers,
      matchWinner: parsed.matchWinner ?? null,
      server: parsed.server ?? DEFAULT_STATE.server,
      raceTo: Math.min(parsedRaceTo, parsedMaxPoint),
      maxPoint: parsedMaxPoint,
      winByTwo: parsed.winByTwo ?? DEFAULT_STATE.winByTwo,
      bestOf: parsedBestOf,
      completedGames: clampCompletedGames(
        Array.isArray(parsed.completedGames)
          ? parsed.completedGames
          : DEFAULT_STATE.completedGames,
      ),
      clockRunning,
      clockElapsedMs,
      clockStartedAt,
      savedNames: sanitizeSavedProfiles(parsed.savedNames),
      doublesMode:
        typeof parsed.doublesMode === 'boolean'
          ? parsed.doublesMode
          : DEFAULT_STATE.doublesMode,
      teammateServerMap: normalizeTeammateServerMap(
        normalizedPlayers,
        parsed.teammateServerMap,
      ),
    }
  } catch (error) {
    console.warn('Failed to parse stored match state', error)
    return createDefaultState()
  }
}
