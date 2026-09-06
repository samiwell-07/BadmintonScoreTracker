import { GENERAL_SETTINGS_STORAGE_KEY } from './features/scoreboard/generalSettings'
import { MATCH_SETTINGS_STORAGE_KEY } from './features/scoreboard/matchSettings'
import { MATCH_STATE_STORAGE_KEY } from './features/scoreboard/matchState'
import { SERVICE_COURT_POSITION_STORAGE_KEY } from './features/scoreboard/serviceCourtModel'
import {
  TUTORIAL_STORAGE_KEY,
  TUTORIAL_VERSION,
} from './features/tutorial/tutorialPersistence'

const RESET_WITH_TUTORIAL = 'reset1'
const RESET_WITHOUT_TUTORIAL = 'reset2'
const MAX_COMMAND_LENGTH = Math.max(
  RESET_WITH_TUTORIAL.length,
  RESET_WITHOUT_TUTORIAL.length,
)

const APP_STORAGE_KEYS = [
  GENERAL_SETTINGS_STORAGE_KEY,
  MATCH_SETTINGS_STORAGE_KEY,
  MATCH_STATE_STORAGE_KEY,
  SERVICE_COURT_POSITION_STORAGE_KEY,
  TUTORIAL_STORAGE_KEY,
]

export const isLocalDevelopmentHost = (hostname: string) =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '::1' ||
  hostname === '[::1]'

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))

export function resetLocalApp(
  showTutorial: boolean,
  storage: Pick<Storage, 'removeItem' | 'setItem'> = localStorage,
  reload: () => void = () => window.location.reload(),
) {
  APP_STORAGE_KEYS.forEach((key) => storage.removeItem(key))

  if (!showTutorial) {
    storage.setItem(
      TUTORIAL_STORAGE_KEY,
      JSON.stringify({ dismissed: true, version: TUTORIAL_VERSION }),
    )
  }

  reload()
}

export function registerLocalResetCommands({
  hostname = window.location.hostname,
  reload,
  storage = localStorage,
  target = window,
}: {
  hostname?: string
  reload?: () => void
  storage?: Pick<Storage, 'removeItem' | 'setItem'>
  target?: Pick<Window, 'addEventListener' | 'removeEventListener'>
} = {}) {
  if (!isLocalDevelopmentHost(hostname)) return () => undefined

  let buffer = ''
  const handleKeyDown = (event: Event) => {
    if (!(event instanceof KeyboardEvent)) return
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      isEditableTarget(event.target)
    ) {
      buffer = ''
      return
    }

    if (event.key.length !== 1) {
      if (event.key === 'Escape') buffer = ''
      return
    }

    buffer = `${buffer}${event.key.toLowerCase()}`.slice(-MAX_COMMAND_LENGTH)
    if (buffer === RESET_WITH_TUTORIAL) {
      resetLocalApp(true, storage, reload)
      buffer = ''
    } else if (buffer === RESET_WITHOUT_TUTORIAL) {
      resetLocalApp(false, storage, reload)
      buffer = ''
    }
  }

  target.addEventListener('keydown', handleKeyDown)
  return () => target.removeEventListener('keydown', handleKeyDown)
}