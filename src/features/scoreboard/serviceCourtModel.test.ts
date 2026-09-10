import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_COURT_POSITION,
  SERVICE_COURT_POSITION_STORAGE_KEY,
  SERVICE_COURT_WIDTH_STORAGE_KEY,
  clampCourtPosition,
  clampCourtWidth,
  createCourtViewModel,
  getServiceCourtRow,
  getServeFlight,
  loadCourtPosition,
  loadCourtWidth,
  saveCourtPosition,
  saveCourtWidth,
  snapCourtPosition,
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

  it('loads, saves, and clamps the persisted court width', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    }

    expect(loadCourtWidth(390, storage)).toBe(120)
    expect(saveCourtWidth(280, storage)).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      SERVICE_COURT_WIDTH_STORAGE_KEY,
      '280',
    )
    expect(loadCourtWidth(390, storage)).toBe(280)
    expect(clampCourtWidth(40, 390)).toBe(80)
    expect(clampCourtWidth(500, 390)).toBe(374)
    expect(clampCourtWidth(80, 70)).toBe(54)
  })

  it.each([
    [{ x: 0.18, y: 0.06 }, { x: 0.17, y: 0.0475 }],
    [{ x: 0.82, y: 0.06 }, { x: 0.83, y: 0.0475 }],
    [{ x: 0.18, y: 0.94 }, { x: 0.17, y: 0.9525 }],
    [{ x: 0.82, y: 0.94 }, { x: 0.83, y: 0.9525 }],
  ])('snaps near each corner using live court bounds', (position, expected) => {
    expect(snapCourtPosition(
      position,
      { width: 400, height: 800 },
      { width: 120, height: 60 },
    )).toEqual(expected)
  })

  it('snaps only the horizontal coordinate near the middle line', () => {
    expect(
      snapCourtPosition(
        { x: 0.55, y: 0.7 },
        { width: 400, height: 800 },
        { width: 120, height: 60 },
      ),
    ).toEqual({ x: 0.5, y: 0.7 })
    expect(
      snapCourtPosition(
        { x: 0.6, y: 0.7 },
        { width: 400, height: 800 },
        { width: 120, height: 60 },
      ),
    ).toEqual({ x: 0.6, y: 0.7 })
  })
})
