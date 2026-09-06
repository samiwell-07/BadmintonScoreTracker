import { afterEach, describe, expect, it, vi } from 'vitest'
import { GENERAL_SETTINGS_STORAGE_KEY } from './features/scoreboard/generalSettings'
import { MATCH_SETTINGS_STORAGE_KEY } from './features/scoreboard/matchSettings'
import { MATCH_STATE_STORAGE_KEY } from './features/scoreboard/matchState'
import { SERVICE_COURT_POSITION_STORAGE_KEY } from './features/scoreboard/serviceCourtModel'
import {
  TUTORIAL_STORAGE_KEY,
  TUTORIAL_VERSION,
} from './features/tutorial/tutorialPersistence'
import {
  isLocalDevelopmentHost,
  registerLocalResetCommands,
} from './localResetCommands'

const appKeys = [
  GENERAL_SETTINGS_STORAGE_KEY,
  MATCH_SETTINGS_STORAGE_KEY,
  MATCH_STATE_STORAGE_KEY,
  SERVICE_COURT_POSITION_STORAGE_KEY,
  TUTORIAL_STORAGE_KEY,
]

const seedStorage = () => {
  appKeys.forEach((key) => localStorage.setItem(key, 'saved'))
  localStorage.setItem('unrelated-key', 'keep')
}

const typeCommand = (command: string, target: EventTarget = window) => {
  for (const key of command) {
    target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }))
  }
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('local reset commands', () => {
  it('recognizes localhost addresses only', () => {
    expect(isLocalDevelopmentHost('localhost')).toBe(true)
    expect(isLocalDevelopmentHost('127.0.0.1')).toBe(true)
    expect(isLocalDevelopmentHost('::1')).toBe(true)
    expect(isLocalDevelopmentHost('[::1]')).toBe(true)
    expect(isLocalDevelopmentHost('badminton.srouji.org')).toBe(false)
  })

  it('reset1 clears app state and restores the tutorial offer', () => {
    const reload = vi.fn()
    seedStorage()
    const unregister = registerLocalResetCommands({
      hostname: 'localhost',
      reload,
    })

    typeCommand('reset1')

    appKeys.forEach((key) => expect(localStorage.getItem(key)).toBeNull())
    expect(localStorage.getItem('unrelated-key')).toBe('keep')
    expect(reload).toHaveBeenCalledOnce()
    unregister()
  })

  it('reset2 clears app state and keeps the tutorial dismissed', () => {
    const reload = vi.fn()
    seedStorage()
    const unregister = registerLocalResetCommands({
      hostname: '127.0.0.1',
      reload,
    })

    typeCommand('reset2')

    expect(JSON.parse(localStorage.getItem(TUTORIAL_STORAGE_KEY)!)).toEqual({
      dismissed: true,
      version: TUTORIAL_VERSION,
    })
    appKeys
      .filter((key) => key !== TUTORIAL_STORAGE_KEY)
      .forEach((key) => expect(localStorage.getItem(key)).toBeNull())
    expect(reload).toHaveBeenCalledOnce()
    unregister()
  })

  it('does not activate from editable fields or production hosts', () => {
    const reload = vi.fn()
    const input = document.createElement('input')
    document.body.append(input)
    seedStorage()
    const unregisterLocal = registerLocalResetCommands({
      hostname: 'localhost',
      reload,
    })

    typeCommand('reset1', input)
    expect(reload).not.toHaveBeenCalled()
    expect(localStorage.getItem(MATCH_STATE_STORAGE_KEY)).toBe('saved')
    unregisterLocal()

    const unregisterProduction = registerLocalResetCommands({
      hostname: 'badminton.srouji.org',
      reload,
    })
    typeCommand('reset1')
    expect(reload).not.toHaveBeenCalled()
    unregisterProduction()
  })
})