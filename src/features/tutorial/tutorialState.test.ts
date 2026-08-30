import { describe, expect, it, vi } from 'vitest'
import {
  TUTORIAL_STEPS,
  canAdvanceTutorial,
  expectedTutorialAction,
} from './tutorialState'
import {
  DEFAULT_TUTORIAL_PREFERENCE,
  TUTORIAL_STORAGE_KEY,
  dismissTutorial,
  loadTutorialPreference,
} from './tutorialPersistence'

describe('tutorial state', () => {
  it('advances only for the expected action', () => {
    expect(expectedTutorialAction(0)).toBe('add-left')
    expect(canAdvanceTutorial(0, 'add-left')).toBe(true)
    expect(canAdvanceTutorial(0, 'add-right')).toBe(false)
    expect(TUTORIAL_STEPS).toHaveLength(21)
    expect(TUTORIAL_STEPS.map(({ action }) => action).slice(0, 4)).toEqual([
      'add-left',
      'remove-left',
      'transfer-right-left',
      'edit-name',
    ])
    expect(
      TUTORIAL_STEPS.map(({ action }) => action).slice(8, 14),
    ).toEqual([
      'service',
      'team-service',
      'doubles-service',
      'left-court-player',
      'right-court-player',
      'server-player',
    ])
    expect(
      TUTORIAL_STEPS.filter(({ cue }) => cue?.startsWith('swipe')).map(
        ({ action, cue }) => [action, cue],
      ),
    ).toEqual([
      ['remove-left', 'swipe-down'],
      ['transfer-right-left', 'swipe-left'],
    ])
    expect(
      TUTORIAL_STEPS.some(({ action }) =>
        ['add-right', 'transfer-left-right', 'copy-result', 'share-result', 'undo-result'].includes(action),
      ),
    ).toBe(false)
    expect(TUTORIAL_STEPS.at(-2)?.action).toBe('next-game')
    expect(TUTORIAL_STEPS.at(-1)?.action).toBe('finish')
  })

  it('offers by default and persists Skip all dismissal', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    }

    expect(loadTutorialPreference(storage)).toEqual(
      DEFAULT_TUTORIAL_PREFERENCE,
    )
    expect(dismissTutorial(storage)).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      TUTORIAL_STORAGE_KEY,
      JSON.stringify({ dismissed: true, version: 1 }),
    )
    expect(loadTutorialPreference(storage).dismissed).toBe(true)
  })

  it('falls back safely for corrupt or unavailable storage', () => {
    expect(loadTutorialPreference({ getItem: () => '{invalid' })).toEqual(
      DEFAULT_TUTORIAL_PREFERENCE,
    )
    expect(
      dismissTutorial({
        setItem: () => {
          throw new Error('Unavailable')
        },
      }),
    ).toBe(false)
  })
})