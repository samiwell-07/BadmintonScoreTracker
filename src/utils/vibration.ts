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
