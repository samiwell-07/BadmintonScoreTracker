import { describe, expect, it } from 'vitest'
import {
  applyDoublesRally,
  createDoublesServiceState,
  getPlayerForScore,
  setDoublesServer,
} from './doublesService'

describe('doubles service', () => {
  it('selects the left court player for odd scores and the other for even', () => {
    expect(getPlayerForScore(0, 1)).toBe(0)
    expect(getPlayerForScore(0, 2)).toBe(1)
    expect(getPlayerForScore(1, 3)).toBe(1)
    expect(getPlayerForScore(1, 0)).toBe(0)
  })

  it('creates a server from both teams court positions and current score', () => {
    expect(
      createDoublesServiceState(
        { left: 0, right: 1 },
        'right',
        { left: 4, right: 3 },
      ),
    ).toEqual({
      leftCourtPlayerIndexes: { left: 0, right: 1 },
      servingPlayerIndex: 1,
    })
  })

  it('keeps the serving player and swaps that teams courts after winning', () => {
    const state = createDoublesServiceState(
      { left: 0, right: 1 },
      'left',
      { left: 0, right: 0 },
    )

    expect(
      applyDoublesRally(state, 'left', 'left', { left: 1, right: 0 }),
    ).toEqual({
      leftCourtPlayerIndexes: { left: 1, right: 1 },
      servingPlayerIndex: 1,
    })
  })

  it('preserves receiving positions and selects its new parity court server', () => {
    const state = createDoublesServiceState(
      { left: 0, right: 1 },
      'left',
      { left: 2, right: 2 },
    )

    expect(
      applyDoublesRally(state, 'left', 'right', { left: 2, right: 3 }),
    ).toEqual({
      leftCourtPlayerIndexes: { left: 0, right: 1 },
      servingPlayerIndex: 1,
    })
  })

  it('sets service to the eligible player after a transfer correction', () => {
    const state = createDoublesServiceState(
      { left: 0, right: 1 },
      'left',
      { left: 2, right: 2 },
    )

    expect(setDoublesServer(state, 'right', 4).servingPlayerIndex).toBe(0)
  })
})