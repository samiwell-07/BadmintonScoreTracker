import {
  PROFILE_COLORS,
  SAVED_NAMES_LIMIT,
  type PlayerProfile,
  type ProfileColor,
} from '../../types/match'
import { createProfileId } from './ids'

const pickColor = (index: number): ProfileColor =>
  PROFILE_COLORS[index % PROFILE_COLORS.length]

const normalizeLabel = (label: string) => label.trim()

export const upsertSavedProfile = (
  profiles: PlayerProfile[],
  label: string,
  options?: { color?: ProfileColor; icon?: string }
) => {
  const normalized = normalizeLabel(label)
  if (!normalized) {
    return profiles
  }

  const lowered = normalized.toLowerCase()
  const existing = profiles.find((profile) => profile.label.toLowerCase() === lowered)
  const filtered = profiles.filter((profile) => profile.label.toLowerCase() !== lowered)

  const nextProfile: PlayerProfile = existing
    ? { ...existing, icon: options?.icon ?? existing.icon }
    : {
        id: createProfileId(),
        label: normalized,
        color: options?.color ?? pickColor(profiles.length),
        icon: options?.icon,
      }

  return [nextProfile, ...filtered].slice(0, SAVED_NAMES_LIMIT)
}
