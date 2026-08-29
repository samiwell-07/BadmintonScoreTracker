export interface MatchSettings {
  pointsToWin: number
  winByTwo: boolean
  maximumScore: number
  gamesToWin: number
}

export const DEFAULT_MATCH_SETTINGS: MatchSettings = {
  pointsToWin: 21,
  winByTwo: true,
  maximumScore: 30,
  gamesToWin: 2,
}

export const MATCH_SETTINGS_STORAGE_KEY = 'badminton-score-tracker:match-settings'

const clampInteger = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, Math.round(value)))

export function normalizeMatchSettings(value: unknown): MatchSettings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_MATCH_SETTINGS
  }

  const candidate = value as Partial<MatchSettings>
  if (
    typeof candidate.pointsToWin !== 'number' ||
    typeof candidate.winByTwo !== 'boolean' ||
    typeof candidate.maximumScore !== 'number' ||
    typeof candidate.gamesToWin !== 'number'
  ) {
    return DEFAULT_MATCH_SETTINGS
  }

  const pointsToWin = clampInteger(candidate.pointsToWin, 1, 99)

  return {
    pointsToWin,
    winByTwo: candidate.winByTwo,
    maximumScore: clampInteger(candidate.maximumScore, pointsToWin, 99),
    gamesToWin: clampInteger(candidate.gamesToWin, 1, 5),
  }
}

export function loadMatchSettings(storage: Pick<Storage, 'getItem'> = localStorage) {
  try {
    const storedValue = storage.getItem(MATCH_SETTINGS_STORAGE_KEY)
    return storedValue
      ? normalizeMatchSettings(JSON.parse(storedValue))
      : DEFAULT_MATCH_SETTINGS
  } catch {
    return DEFAULT_MATCH_SETTINGS
  }
}

export function saveMatchSettings(
  settings: MatchSettings,
  storage: Pick<Storage, 'setItem'> = localStorage,
) {
  const normalizedSettings = normalizeMatchSettings(settings)

  try {
    storage.setItem(
      MATCH_SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizedSettings),
    )
    return true
  } catch {
    return false
  }
}