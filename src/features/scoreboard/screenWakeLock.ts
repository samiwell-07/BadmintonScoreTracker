import { useEffect, useRef } from 'react'

const releaseWakeLock = async (wakeLock: WakeLockSentinel) => {
  try {
    await wakeLock.release()
  } catch {
    // The browser may have already released the lock.
  }
}

export function useScreenWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled) {
      const wakeLock = wakeLockRef.current
      wakeLockRef.current = null
      if (wakeLock && !wakeLock.released) void releaseWakeLock(wakeLock)
      return
    }

    let isDisposed = false
    let requestPending = false

    const requestWakeLock = async () => {
      if (
        isDisposed ||
        requestPending ||
        document.visibilityState !== 'visible' ||
        !('wakeLock' in navigator)
      ) {
        return
      }

      if (wakeLockRef.current && !wakeLockRef.current.released) return
      wakeLockRef.current = null
      requestPending = true

      try {
        const wakeLock = await navigator.wakeLock.request('screen')
        if (isDisposed) {
          await releaseWakeLock(wakeLock)
          return
        }

        wakeLockRef.current = wakeLock
        wakeLock.addEventListener(
          'release',
          () => {
            if (wakeLockRef.current === wakeLock) {
              wakeLockRef.current = null
            }
          },
          { once: true },
        )
      } catch {
        wakeLockRef.current = null
      } finally {
        requestPending = false
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock()
      }
    }

    void requestWakeLock()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isDisposed = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      const wakeLock = wakeLockRef.current
      wakeLockRef.current = null
      if (wakeLock && !wakeLock.released) void releaseWakeLock(wakeLock)
    }
  }, [enabled])
}