export const HAPTIC_DURATION = {
  point: 20,
  swipe: 45,
} as const

export type HapticKind = keyof typeof HAPTIC_DURATION

export function triggerHaptic(kind: HapticKind, isEnabled = true) {
  if (!isEnabled) {
    return false
  }

  try {
    return navigator.vibrate?.(HAPTIC_DURATION[kind]) ?? false
  } catch {
    return false
  }
}