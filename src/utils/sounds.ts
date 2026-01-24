/**
 * Sound effects utility for game events
 * Uses Web Audio API for generating sounds
 */

const SETTINGS_STORAGE_KEY = 'bst-app-settings'

let audioContext: AudioContext | null = null

/**
 * Get or create the audio context
 */
const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

/**
 * Check if sound effects are enabled in settings
 */
const isSoundEnabled = (): boolean => {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return true // default to enabled
    const settings = JSON.parse(raw)
    return settings.soundEffectsEnabled !== false
  } catch {
    return true
  }
}

/**
 * Play a quick "pop" sound for regular point
 */
export const playPointSound = (): void => {
  if (!isSoundEnabled()) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    // Create a short, pleasant "pop" sound
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now) // A5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1) // Drop to A4
    
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.1)
  } catch {
    // Audio not supported
  }
}

/**
 * Play a rising tone for game point
 */
export const playGamePointSound = (): void => {
  if (!isSoundEnabled()) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    // Two-note rising arpeggio
    const notes = [523.25, 659.25] // C5, E5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.1)
      
      gain.gain.setValueAtTime(0, now + i * 0.1)
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.1 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.15)
    })
  } catch {
    // Audio not supported
  }
}

/**
 * Play an urgent rising tone for match point
 */
export const playMatchPointSound = (): void => {
  if (!isSoundEnabled()) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    // Three-note rising arpeggio with tension
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + i * 0.08)
      
      gain.gain.setValueAtTime(0, now + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.2)
    })
  } catch {
    // Audio not supported
  }
}

/**
 * Play a celebratory sound for game win
 */
export const playGameWinSound = (): void => {
  if (!isSoundEnabled()) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    // Major chord arpeggio (C major)
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.1)
      
      gain.gain.setValueAtTime(0, now + i * 0.1)
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.4)
    })
  } catch {
    // Audio not supported
  }
}

/**
 * Play a triumphant fanfare for match win
 */
export const playMatchWinSound = (): void => {
  if (!isSoundEnabled()) return
  
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    
    // Triumphant fanfare pattern
    const pattern = [
      { freq: 523.25, time: 0, duration: 0.15 },      // C5
      { freq: 659.25, time: 0.15, duration: 0.15 },   // E5
      { freq: 783.99, time: 0.3, duration: 0.15 },    // G5
      { freq: 1046.50, time: 0.45, duration: 0.5 },   // C6 (held)
    ]
    
    pattern.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + time)
      
      gain.gain.setValueAtTime(0, now + time)
      gain.gain.linearRampToValueAtTime(0.25, now + time + 0.02)
      gain.gain.setValueAtTime(0.25, now + time + duration - 0.1)
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + duration)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(now + time)
      osc.stop(now + time + duration)
    })
    
    // Add a bass note for fullness
    const bassOsc = ctx.createOscillator()
    const bassGain = ctx.createGain()
    
    bassOsc.type = 'sine'
    bassOsc.frequency.setValueAtTime(130.81, now + 0.45) // C3
    
    bassGain.gain.setValueAtTime(0, now + 0.45)
    bassGain.gain.linearRampToValueAtTime(0.15, now + 0.47)
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 1)
    
    bassOsc.connect(bassGain)
    bassGain.connect(ctx.destination)
    
    bassOsc.start(now + 0.45)
    bassOsc.stop(now + 1)
  } catch {
    // Audio not supported
  }
}
