import { useCallback, useEffect, useMemo, useState } from 'react'
import { translations, type Language } from '../i18n/translations'

const STORAGE_KEY = 'bst-language'

const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr']

const readInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'en'
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'fr') {
      return stored
    }
  } catch {
    // ignore storage errors
  }

  if (typeof navigator !== 'undefined') {
    return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
  }

  return 'en'
}

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(readInitialLanguage)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handle = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, language)
      } catch {
        // ignore storage write errors
      }
    }, 150)

    return () => window.clearTimeout(handle)
  }, [language])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = translations[language].app.documentTitle
    }
  }, [language])

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => (current === 'en' ? 'fr' : 'en'))
  }, [])

  const t = useMemo(() => translations[language], [language])

  return {
    language,
    setLanguage,
    toggleLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    t,
  }
}
