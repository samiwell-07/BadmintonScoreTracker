import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_GENERAL_SETTINGS,
  GENERAL_SETTINGS_STORAGE_KEY,
  loadGeneralSettings,
  normalizeGeneralSettings,
  saveGeneralSettings,
} from './generalSettings'

describe('general settings', () => {
  it('defaults haptic feedback to on', () => {
    expect(normalizeGeneralSettings(undefined)).toEqual({
      hapticsEnabled: true,
    })
    expect(normalizeGeneralSettings({ hapticsEnabled: false })).toEqual({
      hapticsEnabled: false,
    })
  })

  it('round-trips the haptic preference through storage', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    }

    expect(saveGeneralSettings({ hapticsEnabled: false }, storage)).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      GENERAL_SETTINGS_STORAGE_KEY,
      JSON.stringify({ hapticsEnabled: false }),
    )
    expect(loadGeneralSettings(storage)).toEqual({ hapticsEnabled: false })
  })

  it('falls back safely for corrupt or unavailable storage', () => {
    const corruptStorage = { getItem: vi.fn(() => '{invalid') }
    const unavailableStorage = {
      getItem: vi.fn(() => {
        throw new Error('Unavailable')
      }),
      setItem: vi.fn(() => {
        throw new Error('Unavailable')
      }),
    }

    expect(loadGeneralSettings(corruptStorage)).toEqual(
      DEFAULT_GENERAL_SETTINGS,
    )
    expect(loadGeneralSettings(unavailableStorage)).toEqual(
      DEFAULT_GENERAL_SETTINGS,
    )
    expect(
      saveGeneralSettings(DEFAULT_GENERAL_SETTINGS, unavailableStorage),
    ).toBe(false)
  })
})