import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Hook to manage Screen Wake Lock API
 * Keeps the screen on during active matches
 */
export const useWakeLock = (enabled: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator)
  }, [])

  const requestWakeLock = useCallback(async () => {
    if (!isSupported || !enabled) return

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setIsActive(true)

      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false)
      })
    } catch (err) {
      // Wake lock request failed (e.g., low battery)
      console.warn('Wake Lock request failed:', err)
      setIsActive(false)
    }
  }, [isSupported, enabled])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setIsActive(false)
      } catch (err) {
        console.warn('Wake Lock release failed:', err)
      }
    }
  }, [])

  // Request/release based on enabled state
  useEffect(() => {
    if (enabled) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [enabled, requestWakeLock, releaseWakeLock])

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, requestWakeLock])

  return { isSupported, isActive }
}
