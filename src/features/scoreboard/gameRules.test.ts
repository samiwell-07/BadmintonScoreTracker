import { describe, expect, it } from 'vitest'
import { getGameWinner } from './gameRules'
import type { MatchSettings } from './matchSettings'

const STANDARD_RULES: MatchSettings = {
  pointsToWin: 21,
  winByTwo: true,
  maximumScore: 30,
  gamesToWin: 2,
}

describe('getGameWinner', () => {
  it.each([
    [20, 18, null],
    [21, 19, 'left'],
    [19, 21, 'right'],
    [21, 20, null],
    [22, 20, 'left'],
    [29, 28, null],
    [30, 29, 'left'],
  ] as const)('evaluates %i-%i as %s', (left, right, expected) => {
    expect(getGameWinner(left, right, STANDARD_RULES)).toBe(expected)
  })

  it('wins at the target without a two-point requirement', () => {
    expect(
      getGameWinner(11, 10, {
        pointsToWin: 11,
        winByTwo: false,
        maximumScore: 15,
        gamesToWin: 1,
      }),
    ).toBe('left')
  })

  it('wins when the target and maximum are equal', () => {
    expect(
      getGameWinner(15, 14, {
        pointsToWin: 15,
        winByTwo: true,
        maximumScore: 15,
        gamesToWin: 1,
      }),
    ).toBe('left')
  })
})