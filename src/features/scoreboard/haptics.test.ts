import { afterEach, describe, expect, it, vi } from 'vitest'
import { HAPTIC_DURATION, triggerHaptic } from './haptics'

const originalVibrate = Object.getOwnPropertyDescriptor(navigator, 'vibrate')

afterEach(() => {
  if (originalVibrate) {
    Object.defineProperty(navigator, 'vibrate', originalVibrate)
  } else {
    Reflect.deleteProperty(navigator, 'vibrate')
  }
})

describe('triggerHaptic', () => {
  it('uses subtle point and swipe durations', () => {
    const vibrate = vi.fn(() => true)
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    })

    expect(triggerHaptic('point')).toBe(true)
    expect(triggerHaptic('swipe')).toBe(true)
    expect(vibrate).toHaveBeenNthCalledWith(1, HAPTIC_DURATION.point)
    expect(vibrate).toHaveBeenNthCalledWith(2, HAPTIC_DURATION.swipe)
  })

  it('silently continues when vibration is unsupported or throws', () => {
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    })
    expect(triggerHaptic('point')).toBe(false)

    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vi.fn(() => {
        throw new Error('Vibration unavailable')
      }),
    })
    expect(triggerHaptic('swipe')).toBe(false)
  })

  it('does not call the Vibration API when feedback is disabled', () => {
    const vibrate = vi.fn(() => true)
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    })

    expect(triggerHaptic('point', false)).toBe(false)
    expect(triggerHaptic('swipe', false)).toBe(false)
    expect(vibrate).not.toHaveBeenCalled()
  })
})