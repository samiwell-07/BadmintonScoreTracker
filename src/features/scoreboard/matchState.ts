import { normalizeMatchSettings } from './matchSettings'
import type {
  CompletedSet,
  DoublesServiceState,
  MatchPhase,
  MatchState,
  PlayerIndex,
  PlayerNames,
  ScoreSideState,
  SideId,
} from './scoreboard.types'

export const MATCH_STATE_STORAGE_KEY = 'badminton-score-tracker:match-state:v1'

export function createFreshMatchState(): MatchState {
  return {
    sides: {
      left: {
        id: 'left',
        name: 'Player / Team 1',
        playerNames: ['Player 1', 'Player 2'],
        score: 0,
      },
      right: {
        id: 'right',
        name: 'Player / Team 2',
        playerNames: ['Player 1', 'Player 2'],
        score: 0,
      },
    },
    servingSide: null,
    completedSets: [],
    phase: 'playing',
    matchWinner: null,
    resultDialogOpen: false,
    activeRules: null,
    doublesService: null,
  }
}

const isSideId = (value: unknown): value is SideId =>
  value === 'left' || value === 'right'

const isPhase = (value: unknown): value is MatchPhase =>
  value === 'playing' || value === 'gameWon' || value === 'matchWon'

const isPlayerIndex = (value: unknown): value is PlayerIndex =>
  value === 0 || value === 1

function normalizeDoublesService(
  value: unknown,
): DoublesServiceState | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<DoublesServiceState>
  if (
    !isPlayerIndex(candidate.leftCourtPlayerIndexes?.left) ||
    !isPlayerIndex(candidate.leftCourtPlayerIndexes?.right) ||
    (candidate.servingPlayerIndex !== null &&
      !isPlayerIndex(candidate.servingPlayerIndex))
  ) {
    return null
  }

  return {
    leftCourtPlayerIndexes: {
      left: candidate.leftCourtPlayerIndexes.left,
      right: candidate.leftCourtPlayerIndexes.right,
    },
    servingPlayerIndex: candidate.servingPlayerIndex,
  }
}

const normalizeScore = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0

const normalizePlayerNames = (value: unknown): PlayerNames => {
  if (!Array.isArray(value)) {
    return ['Player 1', 'Player 2']
  }

  return [0, 1].map((index) => {
    const name = value[index]
    return typeof name === 'string' && name.trim()
      ? name.trim().slice(0, 40)
      : `Player ${index + 1}`
  }) as PlayerNames
}

function normalizeSide(value: unknown, id: SideId): ScoreSideState | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const side = value as Partial<ScoreSideState>
  if (typeof side.name !== 'string' || !side.name.trim()) {
    return null
  }

  return {
    id,
    name: side.name.trim().slice(0, 40),
    playerNames: normalizePlayerNames(side.playerNames),
    score: normalizeScore(side.score),
  }
}

function normalizeCompletedSet(value: unknown): CompletedSet | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Partial<CompletedSet>
  if (
    typeof record.setNumber !== 'number' ||
    typeof record.leftName !== 'string' ||
    typeof record.rightName !== 'string' ||
    !isSideId(record.winner)
  ) {
    return null
  }

  const completedSet: CompletedSet = {
    setNumber: Math.max(1, Math.round(record.setNumber)),
    leftName: record.leftName.trim().slice(0, 40),
    rightName: record.rightName.trim().slice(0, 40),
    leftScore: normalizeScore(record.leftScore),
    rightScore: normalizeScore(record.rightScore),
    winner: record.winner,
    rules: normalizeMatchSettings(record.rules),
  }

  if (typeof record.previousLeftScore === 'number') {
    completedSet.previousLeftScore = normalizeScore(record.previousLeftScore)
  }

  if (typeof record.previousRightScore === 'number') {
    completedSet.previousRightScore = normalizeScore(record.previousRightScore)
  }

  if ('previousDoublesService' in record) {
    completedSet.previousDoublesService = normalizeDoublesService(
      record.previousDoublesService,
    )
  }

  if ('previousServingSide' in record) {
    completedSet.previousServingSide = isSideId(record.previousServingSide)
      ? record.previousServingSide
      : null
  }

  return completedSet
}

export function normalizeMatchState(value: unknown): MatchState {
  const freshState = createFreshMatchState()
  if (!value || typeof value !== 'object') {
    return freshState
  }

  const candidate = value as Partial<MatchState>
  const left = normalizeSide(candidate.sides?.left, 'left')
  const right = normalizeSide(candidate.sides?.right, 'right')
  if (!left || !right) {
    return freshState
  }

  const completedSets = Array.isArray(candidate.completedSets)
    ? candidate.completedSets
        .map(normalizeCompletedSet)
        .filter((record): record is CompletedSet => record !== null)
        .map((record, index) => ({ ...record, setNumber: index + 1 }))
    : []
  let phase = isPhase(candidate.phase) ? candidate.phase : 'playing'
  if (phase !== 'playing' && completedSets.length === 0) {
    phase = 'playing'
  }

  const savedMatchWinner = isSideId(candidate.matchWinner)
    ? candidate.matchWinner
    : null
  const matchWinner =
    phase === 'matchWon'
      ? savedMatchWinner ?? completedSets.at(-1)?.winner ?? null
      : null

  return {
    sides: { left, right },
    servingSide: isSideId(candidate.servingSide)
      ? candidate.servingSide
      : null,
    completedSets,
    phase,
    matchWinner,
    resultDialogOpen:
      phase === 'gameWon' ? true : Boolean(candidate.resultDialogOpen),
    activeRules: candidate.activeRules
      ? normalizeMatchSettings(candidate.activeRules)
      : null,
    doublesService: normalizeDoublesService(candidate.doublesService),
  }
}

export function loadMatchState(
  storage: Pick<Storage, 'getItem'> = localStorage,
): MatchState {
  try {
    const storedValue = storage.getItem(MATCH_STATE_STORAGE_KEY)
    return storedValue
      ? normalizeMatchState(JSON.parse(storedValue))
      : createFreshMatchState()
  } catch {
    return createFreshMatchState()
  }
}

export function saveMatchState(
  state: MatchState,
  storage: Pick<Storage, 'setItem'> = localStorage,
) {
  try {
    storage.setItem(MATCH_STATE_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}