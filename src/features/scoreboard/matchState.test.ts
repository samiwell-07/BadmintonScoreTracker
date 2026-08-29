import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_MATCH_SETTINGS } from './matchSettings'
import {
  MATCH_STATE_STORAGE_KEY,
  createFreshMatchState,
  loadMatchState,
  saveMatchState,
} from './matchState'

describe('match state persistence', () => {
  it('round-trips an active match with completed sets', () => {
    const state = createFreshMatchState()
    state.sides.left = { id: 'left', name: 'Falcons', score: 7 }
    state.servingSide = 'left'
    state.activeRules = DEFAULT_MATCH_SETTINGS
    state.completedSets = [
      {
        setNumber: 1,
        leftName: 'Falcons',
        rightName: 'Rockets',
        leftScore: 21,
        rightScore: 18,
        winner: 'left',
        rules: DEFAULT_MATCH_SETTINGS,
      },
    ]
    const values = new Map<string, string>()
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    }

    expect(saveMatchState(state, storage)).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      MATCH_STATE_STORAGE_KEY,
      JSON.stringify(state),
    )
    expect(loadMatchState(storage)).toEqual(state)
  })

  it('falls back safely for malformed state', () => {
    const storage = { getItem: vi.fn(() => '{invalid') }

    expect(loadMatchState(storage)).toEqual(createFreshMatchState())
  })

  it('handles unavailable storage', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('Unavailable')
      }),
      setItem: vi.fn(() => {
        throw new Error('Unavailable')
      }),
    }

    expect(loadMatchState(storage)).toEqual(createFreshMatchState())
    expect(saveMatchState(createFreshMatchState(), storage)).toBe(false)
  })
})