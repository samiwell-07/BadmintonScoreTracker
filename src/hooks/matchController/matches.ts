import {
  BEST_OF_OPTIONS,
  MATCH_SUMMARY_LIMIT,
  MATCH_SUMMARY_STORAGE_KEY,
  type CompletedMatchPlayerSummary,
  type CompletedMatchSummary,
} from '../../types/match'

const isValidBestOf = (value: number): value is (typeof BEST_OF_OPTIONS)[number] =>
  BEST_OF_OPTIONS.includes(value as (typeof BEST_OF_OPTIONS)[number])

const sanitizePlayers = (value: unknown): CompletedMatchPlayerSummary[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => {
      if (typeof entry !== 'object' || entry === null) {
        return null
      }

      const candidate = entry as CompletedMatchPlayerSummary
      if (
        typeof candidate.playerId !== 'string' ||
        typeof candidate.name !== 'string' ||
        typeof candidate.pointsScored !== 'number' ||
        typeof candidate.gamesWon !== 'number' ||
        typeof candidate.wonMatch !== 'boolean'
      ) {
        return null
      }

      return {
        ...candidate,
        pointsScored: Math.max(0, candidate.pointsScored),
        gamesWon: Math.max(0, candidate.gamesWon),
        profileId:
          typeof candidate.profileId === 'string' ? candidate.profileId : null,
      }
    })
    .filter((value): value is CompletedMatchPlayerSummary => Boolean(value))
}

const sanitizeSummary = (entry: unknown): CompletedMatchSummary | null => {
  if (typeof entry !== 'object' || entry === null) {
    return null
  }

  const candidate = entry as CompletedMatchSummary
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.completedAt !== 'number' ||
    typeof candidate.durationMs !== 'number' ||
    typeof candidate.gamesPlayed !== 'number' ||
    typeof candidate.totalRallies !== 'number' ||
    typeof candidate.raceTo !== 'number' ||
    typeof candidate.bestOf !== 'number' ||
    typeof candidate.winByTwo !== 'boolean' ||
    typeof candidate.doublesMode !== 'boolean' ||
    typeof candidate.winnerId !== 'string' ||
    typeof candidate.winnerName !== 'string'
  ) {
    return null
  }

  if (!isValidBestOf(candidate.bestOf)) {
    return null
  }

  return {
    ...candidate,
    durationMs: Math.max(0, candidate.durationMs),
    gamesPlayed: Math.max(0, candidate.gamesPlayed),
    totalRallies: Math.max(0, candidate.totalRallies),
    players: sanitizePlayers(candidate.players),
  }
}

export const readCompletedMatchHistory = (): CompletedMatchSummary[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = window.localStorage.getItem(MATCH_SUMMARY_STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((entry) => sanitizeSummary(entry))
      .filter((entry): entry is CompletedMatchSummary => Boolean(entry))
      .slice(0, MATCH_SUMMARY_LIMIT)
  } catch {
    return []
  }
}

export const persistCompletedMatchHistory = (history: CompletedMatchSummary[]) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(MATCH_SUMMARY_STORAGE_KEY, JSON.stringify(history))
  } catch {
    /* noop */
  }
}