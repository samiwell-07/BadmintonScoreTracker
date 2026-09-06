export interface GeneralSettings {
  courtVisualizationEnabled: boolean
  keepScreenAwakeEnabled: boolean
  playerServeIndicatorEnabled: boolean
  teamServeIndicatorEnabled: boolean
}

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  courtVisualizationEnabled: true,
  keepScreenAwakeEnabled: true,
  playerServeIndicatorEnabled: false,
  teamServeIndicatorEnabled: true,
}

export const GENERAL_SETTINGS_STORAGE_KEY =
  'badminton-score-tracker:general-settings:v1'

export function normalizeGeneralSettings(value: unknown): GeneralSettings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_GENERAL_SETTINGS
  }

  const candidate = value as Partial<GeneralSettings>
  return {
    courtVisualizationEnabled:
      typeof candidate.courtVisualizationEnabled === 'boolean'
        ? candidate.courtVisualizationEnabled
        : DEFAULT_GENERAL_SETTINGS.courtVisualizationEnabled,
    keepScreenAwakeEnabled:
      typeof candidate.keepScreenAwakeEnabled === 'boolean'
        ? candidate.keepScreenAwakeEnabled
        : DEFAULT_GENERAL_SETTINGS.keepScreenAwakeEnabled,
    playerServeIndicatorEnabled:
      typeof candidate.playerServeIndicatorEnabled === 'boolean'
        ? candidate.playerServeIndicatorEnabled
        : DEFAULT_GENERAL_SETTINGS.playerServeIndicatorEnabled,
    teamServeIndicatorEnabled:
      typeof candidate.teamServeIndicatorEnabled === 'boolean'
        ? candidate.teamServeIndicatorEnabled
        : DEFAULT_GENERAL_SETTINGS.teamServeIndicatorEnabled,
  }
}

export function loadGeneralSettings(
  storage: Pick<Storage, 'getItem'> = localStorage,
) {
  try {
    const storedValue = storage.getItem(GENERAL_SETTINGS_STORAGE_KEY)
    return storedValue
      ? normalizeGeneralSettings(JSON.parse(storedValue))
      : DEFAULT_GENERAL_SETTINGS
  } catch {
    return DEFAULT_GENERAL_SETTINGS
  }
}

export function saveGeneralSettings(
  settings: GeneralSettings,
  storage: Pick<Storage, 'setItem'> = localStorage,
) {
  const normalizedSettings = normalizeGeneralSettings(settings)

  try {
    storage.setItem(
      GENERAL_SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizedSettings),
    )
    return true
  } catch {
    return false
  }
}