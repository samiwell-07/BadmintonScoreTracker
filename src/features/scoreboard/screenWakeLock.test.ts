import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useScreenWakeLock } from './screenWakeLock'

const originalWakeLock = Object.getOwnPropertyDescriptor(navigator, 'wakeLock')
const originalVisibilityState = Object.getOwnPropertyDescriptor(
  document,
  'visibilityState',
)

const restoreProperty = (
  target: object,
  key: PropertyKey,
  descriptor: PropertyDescriptor | undefined,
) => {
  if (descriptor) {
    Object.defineProperty(target, key, descriptor)
  } else {
    Reflect.deleteProperty(target, key)
  }
}

const setVisibility = (visibilityState: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: visibilityState,
  })
  document.dispatchEvent(new Event('visibilitychange'))
}

const createWakeLock = () => {
  const wakeLock = new EventTarget() as WakeLockSentinel
  Object.defineProperties(wakeLock, {
    released: { configurable: true, value: false, writable: true },
    type: { configurable: true, value: 'screen' },
  })
  wakeLock.release = vi.fn(async () => {
    if (wakeLock.released) return
    Object.defineProperty(wakeLock, 'released', { value: true })
    wakeLock.dispatchEvent(new Event('release'))
  })
  return wakeLock
}

const mockWakeLockApi = (...wakeLocks: WakeLockSentinel[]) => {
  const request = vi.fn()
  wakeLocks.forEach((wakeLock) => request.mockResolvedValueOnce(wakeLock))
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: { request },
  })
  return request
}

afterEach(() => {
  restoreProperty(navigator, 'wakeLock', originalWakeLock)
  restoreProperty(document, 'visibilityState', originalVisibilityState)
})

describe('useScreenWakeLock', () => {
  it('requests a lock once and releases it on unmount', async () => {
    const wakeLock = createWakeLock()
    const request = mockWakeLockApi(wakeLock)
    const { unmount } = renderHook(() => useScreenWakeLock(true))

    await waitFor(() => expect(request).toHaveBeenCalledOnce())
    expect(request).toHaveBeenCalledWith('screen')

    unmount()
    await waitFor(() => expect(wakeLock.release).toHaveBeenCalledOnce())
  })

  it('releases when disabled', async () => {
    const wakeLock = createWakeLock()
    const request = mockWakeLockApi(wakeLock)
    const { rerender } = renderHook(
      ({ enabled }) => useScreenWakeLock(enabled),
      { initialProps: { enabled: true } },
    )

    await waitFor(() => expect(request).toHaveBeenCalledOnce())
    rerender({ enabled: false })

    await waitFor(() => expect(wakeLock.release).toHaveBeenCalledOnce())
  })

  it('reacquires after a released lock becomes visible again', async () => {
    const firstWakeLock = createWakeLock()
    const secondWakeLock = createWakeLock()
    const request = mockWakeLockApi(firstWakeLock, secondWakeLock)
    const { unmount } = renderHook(() => useScreenWakeLock(true))

    await waitFor(() => expect(request).toHaveBeenCalledOnce())
    setVisibility('hidden')
    await firstWakeLock.release()
    setVisibility('visible')

    await waitFor(() => expect(request).toHaveBeenCalledTimes(2))
    unmount()
  })

  it('continues when the API is unsupported or rejects the request', async () => {
    const unsupported = renderHook(() => useScreenWakeLock(true))
    unsupported.unmount()

    const request = vi.fn().mockRejectedValue(new DOMException('Denied'))
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request },
    })
    const rejected = renderHook(() => useScreenWakeLock(true))

    await waitFor(() => expect(request).toHaveBeenCalledOnce())
    rejected.unmount()
  })
})