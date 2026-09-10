import { useEffect, useState } from 'react'
import { Scoreboard } from '../features/scoreboard/Scoreboard'
import { SplashScreen } from '../features/splash/SplashScreen'

const SPLASH_FADE_START_MS = 2500
const SPLASH_DURATION_MS = 3000

export function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true)
  const [isSplashExiting, setIsSplashExiting] = useState(false)

  useEffect(() => {
    const fadeTimer = window.setTimeout(
      () => setIsSplashExiting(true),
      SPLASH_FADE_START_MS,
    )
    const finishTimer = window.setTimeout(
      () => setIsSplashVisible(false),
      SPLASH_DURATION_MS,
    )

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(finishTimer)
    }
  }, [])

  return isSplashVisible
    ? <SplashScreen isExiting={isSplashExiting} />
    : <Scoreboard />
}