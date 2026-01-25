import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'bst-custom-theme'

export type ThemeColor = 'teal' | 'blue' | 'violet' | 'grape' | 'pink' | 'red' | 'orange' | 'yellow' | 'lime' | 'green' | 'cyan' | 'indigo'

export interface CustomTheme {
  primaryColor: ThemeColor
  accentColor: ThemeColor
}

const defaultTheme: CustomTheme = {
  primaryColor: 'teal',
  accentColor: 'blue',
}

export const THEME_COLORS: ThemeColor[] = [
  'teal', 'blue', 'violet', 'grape', 'pink', 'red', 
  'orange', 'yellow', 'lime', 'green', 'cyan', 'indigo'
]

export const readCustomTheme = (): CustomTheme => {
  if (typeof window === 'undefined') return defaultTheme
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultTheme
    const parsed = JSON.parse(raw)
    return {
      primaryColor: THEME_COLORS.includes(parsed.primaryColor) ? parsed.primaryColor : defaultTheme.primaryColor,
      accentColor: THEME_COLORS.includes(parsed.accentColor) ? parsed.accentColor : defaultTheme.accentColor,
    }
  } catch {
    return defaultTheme
  }
}

export const saveCustomTheme = (theme: Partial<CustomTheme>) => {
  if (typeof window === 'undefined') return
  try {
    const current = readCustomTheme()
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...current, ...theme })
    )
  } catch {
    /* noop */
  }
}

export const useCustomTheme = () => {
  const [customTheme, setCustomTheme] = useState<CustomTheme>(readCustomTheme)

  useEffect(() => {
    // Debounce save
    const handle = window.setTimeout(() => {
      saveCustomTheme(customTheme)
    }, 150)
    return () => window.clearTimeout(handle)
  }, [customTheme])

  const setPrimaryColor = useCallback((color: ThemeColor) => {
    setCustomTheme((prev) => ({ ...prev, primaryColor: color }))
  }, [])

  const setAccentColor = useCallback((color: ThemeColor) => {
    setCustomTheme((prev) => ({ ...prev, accentColor: color }))
  }, [])

  const resetTheme = useCallback(() => {
    setCustomTheme(defaultTheme)
  }, [])

  return {
    customTheme,
    primaryColor: customTheme.primaryColor,
    accentColor: customTheme.accentColor,
    setPrimaryColor,
    setAccentColor,
    resetTheme,
    availableColors: THEME_COLORS,
  }
}
