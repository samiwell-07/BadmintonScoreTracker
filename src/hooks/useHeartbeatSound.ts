import { useEffect, useRef, useCallback } from 'react'

/**
 * Creates a rhythmic heartbeat sound using Web Audio API
 * The heartbeat has two beats (lub-dub) pattern
 */
export const useHeartbeatSound = (isActive: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const intervalRef = useRef<number | null>(null)
  const isPlayingRef = useRef(false)

  const playHeartbeat = useCallback(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return

    const ctx = audioContextRef.current
    const masterGain = gainNodeRef.current
    const now = ctx.currentTime

    // First beat (lub) - deeper, louder
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(55, now)
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.1)
    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.02)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    osc1.connect(gain1)
    gain1.connect(masterGain)
    osc1.start(now)
    osc1.stop(now + 0.15)

    // Second beat (dub) - slightly higher, quieter
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(70, now + 0.15)
    osc2.frequency.exponentialRampToValueAtTime(50, now + 0.25)
    gain2.gain.setValueAtTime(0, now + 0.15)
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.17)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    osc2.connect(gain2)
    gain2.connect(masterGain)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.3)
  }, [])

  const startHeartbeat = useCallback(() => {
    if (isPlayingRef.current) return

    // Create audio context on user interaction
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    const ctx = audioContextRef.current

    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Create master gain for fade in/out
    if (!gainNodeRef.current) {
      gainNodeRef.current = ctx.createGain()
      gainNodeRef.current.connect(ctx.destination)
    }

    // Fade in
    gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime)
    gainNodeRef.current.gain.linearRampToValueAtTime(1, ctx.currentTime + 1)

    isPlayingRef.current = true

    // Start heartbeat rhythm (60 BPM = one beat per second)
    playHeartbeat()
    intervalRef.current = window.setInterval(() => {
      playHeartbeat()
    }, 1000)
  }, [playHeartbeat])

  const stopHeartbeat = useCallback(() => {
    if (!isPlayingRef.current) return

    // Fade out
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current
      gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
    }

    // Stop interval after fade out
    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isPlayingRef.current = false
    }, 500)
  }, [])

  useEffect(() => {
    if (isActive) {
      startHeartbeat()
    } else {
      stopHeartbeat()
    }

    return () => {
      stopHeartbeat()
    }
  }, [isActive, startHeartbeat, stopHeartbeat])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])
}
