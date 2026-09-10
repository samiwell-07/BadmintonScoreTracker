import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_GENERAL_SETTINGS,
  GENERAL_SETTINGS_STORAGE_KEY,
} from './features/scoreboard/generalSettings'
import { MATCH_SETTINGS_STORAGE_KEY } from './features/scoreboard/matchSettings'
import {
  MATCH_STATE_STORAGE_KEY,
  createFreshMatchState,
} from './features/scoreboard/matchState'
import {
  SERVICE_COURT_POSITION_STORAGE_KEY,
  SERVICE_COURT_WIDTH_STORAGE_KEY,
} from './features/scoreboard/serviceCourtModel'
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
  SERVICE_COURT_WIDTH_STORAGE_KEY,
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

const seedPresetState = () => {
  const matchState = createFreshMatchState()
  matchState.sides.left.name = 'Falcons'
  matchState.sides.right.name = 'Shuttles'
  matchState.sides.left.playerNames = ['Alex', 'Blake']
  matchState.sides.right.playerNames = ['Casey', 'Drew']
  matchState.sides.left.score = 7
  matchState.sides.right.score = 5
  matchState.servingSide = 'right'
  matchState.doublesService = {
    leftCourtPlayerIndexes: { left: 0, right: 1 },
    servingPlayerIndex: 1,
  }
  localStorage.setItem(MATCH_STATE_STORAGE_KEY, JSON.stringify(matchState))
  localStorage.setItem(
    GENERAL_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      ...DEFAULT_GENERAL_SETTINGS,
      keepScreenAwakeEnabled: false,
      raiseBottomHistoryControlEnabled: true,
    }),
  )
  localStorage.setItem(MATCH_SETTINGS_STORAGE_KEY, 'preserved-settings')
  localStorage.setItem(TUTORIAL_STORAGE_KEY, 'preserved-tutorial')
  localStorage.setItem('unrelated-key', 'keep')
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

  it('addplayer preserves the match and enables numbered player mode', () => {
    const reload = vi.fn()
    seedPresetState()
    const unregister = registerLocalResetCommands({
      hostname: 'localhost',
      reload,
    })

    typeCommand('AddPlayer')

    const matchState = JSON.parse(localStorage.getItem(MATCH_STATE_STORAGE_KEY)!)
    const settings = JSON.parse(
      localStorage.getItem(GENERAL_SETTINGS_STORAGE_KEY)!,
    )
    expect(matchState.sides.left).toMatchObject({
      name: 'Falcons',
      playerNames: ['1', '2'],
      score: 7,
    })
    expect(matchState.sides.right).toMatchObject({
      name: 'Shuttles',
      playerNames: ['3', '4'],
      score: 5,
    })
    expect(matchState.servingSide).toBe('right')
    expect(matchState.doublesService).toEqual({
      leftCourtPlayerIndexes: { left: 0, right: 1 },
      servingPlayerIndex: 1,
    })
    expect(settings).toMatchObject({
      keepScreenAwakeEnabled: false,
      playerServeIndicatorEnabled: true,
      raiseBottomHistoryControlEnabled: true,
      teamServeIndicatorEnabled: false,
    })
    expect(localStorage.getItem(MATCH_SETTINGS_STORAGE_KEY))
      .toBe('preserved-settings')
    expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('preserved-tutorial')
    expect(localStorage.getItem('unrelated-key')).toBe('keep')
    expect(reload).toHaveBeenCalledOnce()
    unregister()
  })

  it('addteam preserves the match and enables numbered team mode', () => {
    const reload = vi.fn()
    seedPresetState()
    const unregister = registerLocalResetCommands({
      hostname: '127.0.0.1',
      reload,
    })

    typeCommand('addteam')

    const matchState = JSON.parse(localStorage.getItem(MATCH_STATE_STORAGE_KEY)!)
    const settings = JSON.parse(
      localStorage.getItem(GENERAL_SETTINGS_STORAGE_KEY)!,
    )
    expect(matchState.sides.left).toMatchObject({
      name: '1',
      playerNames: ['Alex', 'Blake'],
      score: 7,
    })
    expect(matchState.sides.right).toMatchObject({
      name: '2',
      playerNames: ['Casey', 'Drew'],
      score: 5,
    })
    expect(matchState.servingSide).toBe('right')
    expect(matchState.doublesService).toEqual({
      leftCourtPlayerIndexes: { left: 0, right: 1 },
      servingPlayerIndex: 1,
    })
    expect(settings).toMatchObject({
      keepScreenAwakeEnabled: false,
      playerServeIndicatorEnabled: false,
      raiseBottomHistoryControlEnabled: true,
      teamServeIndicatorEnabled: true,
    })
    expect(localStorage.getItem(MATCH_SETTINGS_STORAGE_KEY))
      .toBe('preserved-settings')
    expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('preserved-tutorial')
    expect(localStorage.getItem('unrelated-key')).toBe('keep')
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