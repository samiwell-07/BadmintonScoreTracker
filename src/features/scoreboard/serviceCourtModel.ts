import { otherPlayer } from './doublesService'
import type {
  DoublesServiceState,
  PlayerIndex,
  ScoreSideState,
  SideId,
} from './scoreboard.types'

export type CourtRow = 'top' | 'bottom'
export type CourtViewMode = 'neutral' | 'team' | 'player'

export interface CourtCell {
  isServer: boolean
  isServiceCourt: boolean
  label: string | null
  playerIndex: PlayerIndex | null
  row: CourtRow
  side: SideId
}

export interface CourtViewModel {
  cells: CourtCell[]
  mode: CourtViewMode
  serviceRows: Record<SideId, CourtRow>
  servingSide: SideId | null
}

export interface ServeFlight {
  fromX: number
  fromY: number
  toX: number
  toY: number
}

export interface CourtPosition {
  x: number
  y: number
}

export interface CourtSize {
  height: number
  width: number
}

export const SERVICE_COURT_POSITION_STORAGE_KEY =
  'badminton-score-tracker:service-court-position:v1'

export const DEFAULT_COURT_POSITION: CourtPosition = { x: 0.84, y: 0.72 }

interface CreateCourtViewModelOptions {
  doublesService: DoublesServiceState | null
  playerMode: boolean
  servingSide: SideId | null
  sides: Record<SideId, ScoreSideState>
}

const rows: CourtRow[] = ['top', 'bottom']
const sides: SideId[] = ['left', 'right']

const isCourtPosition = (value: unknown): value is CourtPosition => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CourtPosition>
  return (
    typeof candidate.x === 'number' &&
    Number.isFinite(candidate.x) &&
    candidate.x >= 0 &&
    candidate.x <= 1 &&
    typeof candidate.y === 'number' &&
    Number.isFinite(candidate.y) &&
    candidate.y >= 0 &&
    candidate.y <= 1
  )
}

export function loadCourtPosition(
  storage: Pick<Storage, 'getItem'> = localStorage,
): CourtPosition {
  try {
    const storedValue = storage.getItem(SERVICE_COURT_POSITION_STORAGE_KEY)
    if (!storedValue) return DEFAULT_COURT_POSITION
    const position = JSON.parse(storedValue) as unknown
    return isCourtPosition(position) ? position : DEFAULT_COURT_POSITION
  } catch {
    return DEFAULT_COURT_POSITION
  }
}

export function saveCourtPosition(
  position: CourtPosition,
  storage: Pick<Storage, 'setItem'> = localStorage,
) {
  if (!isCourtPosition(position)) return false
  try {
    storage.setItem(
      SERVICE_COURT_POSITION_STORAGE_KEY,
      JSON.stringify(position),
    )
    return true
  } catch {
    return false
  }
}

export function clampCourtPosition(
  position: CourtPosition,
  viewport: CourtSize,
  court: CourtSize,
  margin = 8,
): CourtPosition {
  if (viewport.width <= 0 || viewport.height <= 0) {
    return DEFAULT_COURT_POSITION
  }

  const minimumX = Math.min(viewport.width / 2, margin + court.width / 2)
  const maximumX = Math.max(minimumX, viewport.width - minimumX)
  const minimumY = Math.min(viewport.height / 2, margin + court.height / 2)
  const maximumY = Math.max(minimumY, viewport.height - minimumY)

  return {
    x: Math.min(
      maximumX,
      Math.max(minimumX, position.x * viewport.width),
    ) / viewport.width,
    y: Math.min(
      maximumY,
      Math.max(minimumY, position.y * viewport.height),
    ) / viewport.height,
  }
}

export const getServiceCourtRow = (
  side: SideId,
  score: number,
): CourtRow => {
  const isLeftCourt = score % 2 === 1
  if (side === 'left') return isLeftCourt ? 'top' : 'bottom'
  return isLeftCourt ? 'bottom' : 'top'
}

export const getServeFlight = (
  side: SideId,
  row: CourtRow,
): ServeFlight => {
  const fromX = side === 'left' ? 25 : 75
  const fromY = row === 'top' ? 25 : 75
  return {
    fromX,
    fromY,
    toX: side === 'left' ? 75 : 25,
    toY: row === 'top' ? 75 : 25,
  }
}

const getPlayerAtRow = (
  side: SideId,
  row: CourtRow,
  leftCourtPlayerIndex: PlayerIndex,
): PlayerIndex => {
  const leftCourtRow: CourtRow = side === 'left' ? 'top' : 'bottom'
  return row === leftCourtRow
    ? leftCourtPlayerIndex
    : otherPlayer(leftCourtPlayerIndex)
}

export function createCourtViewModel({
  doublesService,
  playerMode,
  servingSide,
  sides: matchSides,
}: CreateCourtViewModelOptions): CourtViewModel {
  const hasPlayerPositions = playerMode && doublesService !== null
  const serviceRows = {
    left: getServiceCourtRow('left', matchSides.left.score),
    right: getServiceCourtRow('right', matchSides.right.score),
  } satisfies Record<SideId, CourtRow>
  const mode: CourtViewMode = playerMode
    ? hasPlayerPositions
      ? 'player'
      : 'neutral'
    : servingSide
      ? 'team'
      : 'neutral'

  const cells = sides.flatMap((side) =>
    rows.map((row): CourtCell => {
      const playerIndex = hasPlayerPositions
        ? getPlayerAtRow(
            side,
            row,
            doublesService.leftCourtPlayerIndexes[side],
          )
        : null
      const isServiceCourt =
        mode !== 'neutral' &&
        servingSide === side &&
        row === serviceRows[side]

      return {
        isServer:
          isServiceCourt &&
          playerIndex !== null &&
          doublesService?.servingPlayerIndex === playerIndex,
        isServiceCourt,
        label:
          playerIndex === null
            ? null
            : matchSides[side].playerNames[playerIndex],
        playerIndex,
        row,
        side,
      }
    }),
  )

  return { cells, mode, serviceRows, servingSide }
}
