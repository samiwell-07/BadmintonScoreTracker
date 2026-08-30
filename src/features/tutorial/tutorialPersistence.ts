export const TUTORIAL_VERSION = 1
export const TUTORIAL_STORAGE_KEY =
  'badminton-score-tracker:tutorial:v1'

export interface TutorialPreference {
  dismissed: boolean
  version: number
}

export const DEFAULT_TUTORIAL_PREFERENCE: TutorialPreference = {
  dismissed: false,
  version: TUTORIAL_VERSION,
}

export function loadTutorialPreference(
  storage: Pick<Storage, 'getItem'> = localStorage,
): TutorialPreference {
  try {
    const stored = storage.getItem(TUTORIAL_STORAGE_KEY)
    if (!stored) return DEFAULT_TUTORIAL_PREFERENCE

    const candidate = JSON.parse(stored) as Partial<TutorialPreference>
    return {
      dismissed:
        candidate.version === TUTORIAL_VERSION &&
        candidate.dismissed === true,
      version: TUTORIAL_VERSION,
    }
  } catch {
    return DEFAULT_TUTORIAL_PREFERENCE
  }
}

export function dismissTutorial(
  storage: Pick<Storage, 'setItem'> = localStorage,
) {
  const preference: TutorialPreference = {
    dismissed: true,
    version: TUTORIAL_VERSION,
  }

  try {
    storage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(preference))
    return true
  } catch {
    return false
  }
}