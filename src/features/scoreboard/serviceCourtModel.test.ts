import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_COURT_POSITION,
  SERVICE_COURT_POSITION_STORAGE_KEY,
  clampCourtPosition,
  createCourtViewModel,
  getServiceCourtRow,
  getServeFlight,
  loadCourtPosition,
  saveCourtPosition,
} from './serviceCourtModel'
import type { ScoreSideState } from './scoreboard.types'

const sides: Record<'left' | 'right', ScoreSideState> = {
  left: {
    id: 'left',
    name: 'Left Team',
    playerNames: ['Alex', 'Blake'],
    score: 2,
  },
  right: {
    id: 'right',
    name: 'Right Team',
    playerNames: ['Casey', 'Drew'],
    score: 3,
  },
}

describe('service court model', () => {
  it('maps even and odd scores to mirrored service courts', () => {
    expect(getServiceCourtRow('left', 2)).toBe('bottom')
    expect(getServiceCourtRow('left', 3)).toBe('top')
    expect(getServiceCourtRow('right', 2)).toBe('top')
    expect(getServiceCourtRow('right', 3)).toBe('bottom')
    expect(getServeFlight('left', 'top')).toEqual({
      fromX: 25,
      fromY: 25,
      toX: 75,
      toY: 75,
    })
    expect(getServeFlight('right', 'bottom')).toEqual({
      fromX: 75,
      fromY: 75,
      toX: 25,
      toY: 25,
    })
  })

  it('highlights the serving team court in team mode', () => {
    const model = createCourtViewModel({
      doublesService: null,
      playerMode: false,
      servingSide: 'right',
      sides,
    })

    expect(model.mode).toBe('team')
    expect(model.cells.filter(({ isServiceCourt }) => isServiceCourt)).toEqual([
      expect.objectContaining({ row: 'bottom', side: 'right' }),
    ])
    expect(model.cells.every(({ label }) => label === null)).toBe(true)
  })

  it('mirrors player positions and marks the exact server', () => {
    const model = createCourtViewModel({
      doublesService: {
        leftCourtPlayerIndexes: { left: 0, right: 1 },
        servingPlayerIndex: 1,
      },
      playerMode: true,
      servingSide: 'right',
      sides,
    })

    expect(model.mode).toBe('player')
    expect(model.cells).toEqual([
      expect.objectContaining({ label: 'Alex', row: 'top', side: 'left' }),
      expect.objectContaining({ label: 'Blake', row: 'bottom', side: 'left' }),
      expect.objectContaining({ label: 'Casey', row: 'top', side: 'right' }),
      expect.objectContaining({
        isServer: true,
        label: 'Drew',
        row: 'bottom',
        side: 'right',
      }),
    ])
  })

  it('does not invent service or player positions before setup', () => {
    const model = createCourtViewModel({
      doublesService: null,
      playerMode: true,
      servingSide: 'left',
      sides,
    })

    expect(model.mode).toBe('neutral')
    expect(model.cells.every(({ isServiceCourt }) => !isServiceCourt)).toBe(true)
    expect(model.cells.every(({ playerIndex }) => playerIndex === null)).toBe(true)
  })

  it('loads, saves, and safely defaults normalized positions', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    }

    expect(loadCourtPosition(storage)).toEqual(DEFAULT_COURT_POSITION)
    expect(saveCourtPosition({ x: 0.2, y: 0.8 }, storage)).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      SERVICE_COURT_POSITION_STORAGE_KEY,
      JSON.stringify({ x: 0.2, y: 0.8 }),
    )
    expect(loadCourtPosition(storage)).toEqual({ x: 0.2, y: 0.8 })

    values.set(SERVICE_COURT_POSITION_STORAGE_KEY, '{invalid')
    expect(loadCourtPosition(storage)).toEqual(DEFAULT_COURT_POSITION)
  })

  it('clamps the complete court inside viewport margins', () => {
    expect(
      clampCourtPosition(
        { x: 1, y: 0 },
        { width: 400, height: 800 },
        { width: 120, height: 60 },
      ),
    ).toEqual({ x: 0.83, y: 0.0475 })
  })
})
