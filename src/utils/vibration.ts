/**
 * Vibration utility for game events
 * Uses the Web Vibration API (mobile devices only)
 */

const SETTINGS_STORAGE_KEY = 'bst-app-settings'

/**
 * Check if haptic feedback is enabled in settings
 */
const isHapticEnabled = (): boolean => {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return true // default to enabled
    const settings = JSON.parse(raw)
    return settings.hapticFeedbackEnabled !== false
  } catch {
    return true
  }
}

/**
 * Check if vibration is supported
 */
export const isVibrationSupported = (): boolean => {
  return 'vibrate' in navigator
}

/**
 * Trigger a light vibration for regular point scored
 * Pattern: quick 30ms pulse
 */
export const vibratePoint = (): void => {
  if (!isVibrationSupported() || !isHapticEnabled()) return
  navigator.vibrate(30)
}

/**
 * Trigger a medium vibration for game point
 * Pattern: double pulse 50ms, pause 50ms, 50ms
 */
export const vibrateGamePoint = (): void => {
  if (!isVibrationSupported() || !isHapticEnabled()) return
  navigator.vibrate([50, 50, 50])
}

/**
 * Trigger a stronger vibration for match point
 * Pattern: triple pulse
 */
export const vibrateMatchPoint = (): void => {
  if (!isVibrationSupported() || !isHapticEnabled()) return
  navigator.vibrate([60, 40, 60, 40, 80])
}

/**
 * Trigger a powerful double-pulse vibration for game/set wins
 * Pattern: vibrate 200ms, pause 100ms, vibrate 400ms
 */
export const vibrateGameWin = (): void => {
  if (!isVibrationSupported() || !isHapticEnabled()) return
  
  // Double pulse: short strong pulse, brief pause, longer strong pulse
  // [vibrate, pause, vibrate, pause, ...]
  navigator.vibrate([200, 100, 400])
}

/**
 * Trigger an even more powerful vibration for match wins
 * Pattern: vibrate 300ms, pause 100ms, vibrate 300ms, pause 100ms, vibrate 500ms
 */
export const vibrateMatchWin = (): void => {
  if (!isVibrationSupported() || !isHapticEnabled()) return
  
  // Triple pulse for match win - more celebratory
  navigator.vibrate([300, 100, 300, 100, 500])
}

/**
 * Cancel any ongoing vibration
 */
export const cancelVibration = (): void => {
  if (!isVibrationSupported()) return
  navigator.vibrate(0)
}
