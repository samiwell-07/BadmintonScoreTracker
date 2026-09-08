import { useEffect, useRef, useState } from 'react'
import {
  CenterControl,
  type CenterControlAction,
} from './CenterControl'
import { GameResultDialog } from './GameResultDialog'
import { MatchSettingsDialog } from './MatchSettingsDialog'
import { ResetMatchDialog } from './ResetMatchDialog'
import { ScoreSide } from './ScoreSide'
import { ServiceCourt } from './ServiceCourt'
import { SetHistoryControl } from './SetHistoryControl'
import {
  applyDoublesRally,
  assignDoublesServer,
  createDoublesServiceState,
  getPlayerForScore,
  setDoublesServer,
  swapDoublesTeamPositions,
} from './doublesService'
import { getGameWinner } from './gameRules'
import {
  loadGeneralSettings,
  saveGeneralSettings,
  type GeneralSettings,
} from './generalSettings'
import {
  DEFAULT_MATCH_SETTINGS,
  loadMatchSettings,
  saveMatchSettings,
  type MatchSettings,
} from './matchSettings'
import {
  createFreshMatchState,
  loadMatchState,
  saveMatchState,
} from './matchState'
import { createCourtViewModel } from './serviceCourtModel'
import { useScreenWakeLock } from './screenWakeLock'
import type {
  CompletedSet,
  DoublesServiceState,
  MatchState,
  PlayerIndex,
  SideId,
} from './scoreboard.types'
import { TutorialOverlay } from '../tutorial/TutorialOverlay'
import { TutorialExitDialog } from '../tutorial/TutorialExitDialog'
import { TutorialWelcome } from '../tutorial/TutorialWelcome'
import {
  dismissTutorial,
  loadTutorialPreference,
} from '../tutorial/tutorialPersistence'
import {
  TUTORIAL_STEPS,
  canAdvanceTutorial,
  type TutorialAction,
} from '../tutorial/tutorialState'
import './scoreboard.css'
import '../tutorial/tutorial.css'

const countSetWins = (sets: CompletedSet[], side: SideId) =>
  sets.filter((set) => set.winner === side).length

const getSideDisplayName = (
  side: MatchState['sides'][SideId],
  usePlayerNames: boolean,
) =>
  usePlayerNames
    ? `${side.playerNames[0]} and ${side.playerNames[1]}`
    : side.name

const finalizeScoreChange = (
  current: MatchState,
  sides: MatchState['sides'],
  servingSide: SideId,
  rules: MatchSettings,
  doublesService: DoublesServiceState | null,
  usePlayerNames: boolean,
): MatchState => {
  const winner = getGameWinner(
    sides.left.score,
    sides.right.score,
    rules,
  )

  if (!winner) {
    return {
      ...current,
      sides,
      servingSide,
      activeRules: rules,
      doublesService,
    }
  }

  const completedSet: CompletedSet = {
    setNumber: current.completedSets.length + 1,
    leftName: getSideDisplayName(sides.left, usePlayerNames),
    rightName: getSideDisplayName(sides.right, usePlayerNames),
    leftScore: sides.left.score,
    rightScore: sides.right.score,
    winner,
    rules,
    previousLeftScore: current.sides.left.score,
    previousRightScore: current.sides.right.score,
    previousDoublesService: current.doublesService,
    previousServingSide: current.servingSide,
  }
  const completedSets = [...current.completedSets, completedSet]
  const isMatchWon =
    countSetWins(completedSets, winner) >= rules.gamesToWin

  return {
    ...current,
    sides,
    servingSide,
    completedSets,
    phase: isMatchWon ? 'matchWon' : 'gameWon',
    matchWinner: isMatchWon ? winner : null,
    resultDialogOpen: true,
    activeRules: rules,
    doublesService,
  }
}

type ServiceSelection =
  | { mode: 'team' }
  | {
      mode: 'leftCourt'
      side: SideId
      leftCourtPlayerIndexes: Partial<Record<SideId, PlayerIndex>>
    }
  | {
      mode: 'server'
      leftCourtPlayerIndexes: Record<SideId, PlayerIndex>
    }

type TutorialMode = 'offer' | 'running' | null

interface TutorialSnapshot {
  generalSettings: GeneralSettings
  isCenterControlOpen: boolean
  isHistoryOpen: boolean
  isResetDialogOpen: boolean
  isSettingsDialogOpen: boolean
  matchSettings: MatchSettings
  matchState: MatchState
  selectedSetNumber: number | null
  serviceSelection: ServiceSelection | null
}

const TUTORIAL_RULES: MatchSettings = {
  pointsToWin: 2,
  winByTwo: false,
  maximumScore: 3,
  gamesToWin: 2,
}

const createTutorialMatch = (leftScore = 0, rightScore = 0): MatchState => {
  const state = createFreshMatchState()
  state.sides.left.name = 'Left Team'
  state.sides.right.name = 'Right Team'
  state.sides.left.playerNames = ['Alex', 'Blake']
  state.sides.right.playerNames = ['Casey', 'Drew']
  state.sides.left.score = leftScore
  state.sides.right.score = rightScore
  state.activeRules = leftScore || rightScore ? TUTORIAL_RULES : null
  return state
}

const createTutorialCompletedSet = (): CompletedSet => ({
  setNumber: 1,
  leftName: 'Left Team',
  rightName: 'Right Team',
  leftScore: 21,
  rightScore: 18,
  winner: 'left',
  rules: DEFAULT_MATCH_SETTINGS,
  previousLeftScore: 20,
  previousRightScore: 18,
  previousDoublesService: null,
  previousServingSide: 'right',
})

const createTutorialHistoryMatch = (): MatchState => ({
  ...createTutorialMatch(),
  activeRules: TUTORIAL_RULES,
  completedSets: [createTutorialCompletedSet()],
})

const createTutorialResultMatch = (): MatchState => ({
  ...createTutorialMatch(21, 18),
  activeRules: DEFAULT_MATCH_SETTINGS,
  completedSets: [createTutorialCompletedSet()],
  phase: 'gameWon',
  resultDialogOpen: true,
  servingSide: 'left',
})

export function Scoreboard() {
  const [matchState, setMatchState] = useState(loadMatchState)
  const [isCenterControlOpen, setIsCenterControlOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [serviceSelection, setServiceSelection] =
    useState<ServiceSelection | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedSetNumber, setSelectedSetNumber] = useState<number | null>(null)
  const [matchSettings, setMatchSettings] = useState(loadMatchSettings)
  const [generalSettings, setGeneralSettings] = useState(loadGeneralSettings)
  const [tutorialMode, setTutorialMode] = useState<TutorialMode>(() =>
    loadTutorialPreference().dismissed ? null : 'offer',
  )
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0)
  const [isTutorialExitOpen, setIsTutorialExitOpen] = useState(false)
  const tutorialSnapshot = useRef<TutorialSnapshot | null>(null)

  useScreenWakeLock(generalSettings.keepScreenAwakeEnabled)

  useEffect(() => {
    if (tutorialMode !== 'running') {
      saveMatchState(matchState)
    }
  }, [matchState, tutorialMode])

  useEffect(() => {
    if (!serviceSelection) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setServiceSelection(null)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [serviceSelection])

  const restoreTutorialSnapshot = () => {
    const snapshot = tutorialSnapshot.current
    if (!snapshot) return

    setMatchState(snapshot.matchState)
    setGeneralSettings(snapshot.generalSettings)
    setMatchSettings(snapshot.matchSettings)
    setIsCenterControlOpen(snapshot.isCenterControlOpen)
    setIsResetDialogOpen(snapshot.isResetDialogOpen)
    setIsSettingsDialogOpen(snapshot.isSettingsDialogOpen)
    setServiceSelection(snapshot.serviceSelection)
    setIsHistoryOpen(snapshot.isHistoryOpen)
    setSelectedSetNumber(snapshot.selectedSetNumber)
    tutorialSnapshot.current = null
  }

  const resetTutorialViewport = () => {
    const resetScrollOffsets = () => {
      const scrollContainers = [
        document.documentElement,
        document.body,
        document.getElementById('root'),
        document.querySelector<HTMLElement>('.scoreboard'),
      ]

      scrollContainers.forEach((element) => {
        if (!element) return
        element.scrollTop = 0
        element.scrollLeft = 0
      })
      window.scrollTo(0, 0)
    }

    resetScrollOffsets()
    window.requestAnimationFrame(resetScrollOffsets)
  }

  const finishTutorial = () => {
    restoreTutorialSnapshot()
    dismissTutorial()
    setTutorialMode(null)
    setTutorialStepIndex(0)
    setIsTutorialExitOpen(false)
    resetTutorialViewport()
  }

  const skipAllTutorial = () => {
    if (tutorialMode === 'running') {
      restoreTutorialSnapshot()
    }
    dismissTutorial()
    setTutorialMode(null)
    setTutorialStepIndex(0)
    setIsTutorialExitOpen(false)
    resetTutorialViewport()
  }

  const prepareTutorialStep = (stepIndex: number) => {
    const action = TUTORIAL_STEPS[stepIndex]?.action
    const closePracticeUi = () => {
      setIsCenterControlOpen(false)
      setIsResetDialogOpen(false)
      setIsSettingsDialogOpen(false)
      setServiceSelection(null)
      setIsHistoryOpen(false)
      setSelectedSetNumber(null)
    }

    if (action === 'add-left') {
      closePracticeUi()
      setGeneralSettings((current) => ({
        ...current,
        playerServeIndicatorEnabled: false,
      }))
      setMatchState(createTutorialMatch())
    } else if (action === 'remove-left') {
      setMatchState(createTutorialMatch(1, 1))
    } else if (action === 'transfer-right-left') {
      setMatchState(createTutorialMatch(0, 1))
    } else if (action === 'edit-name') {
      closePracticeUi()
      setMatchState(createTutorialMatch(1, 0))
    } else if (action === 'open-menu') {
      setIsCenterControlOpen(false)
    } else if (action === 'service') {
      closePracticeUi()
      setGeneralSettings((current) => ({
        ...current,
        playerServeIndicatorEnabled: false,
      }))
      setMatchState(createTutorialMatch())
      setIsCenterControlOpen(true)
    } else if (action === 'team-service') {
      setGeneralSettings((current) => ({
        ...current,
        playerServeIndicatorEnabled: false,
      }))
      setServiceSelection({ mode: 'team' })
    } else if (action === 'open-history') {
      closePracticeUi()
      setMatchState(createTutorialHistoryMatch())
    } else if (action === 'select-history') {
      setMatchState(createTutorialHistoryMatch())
      setIsHistoryOpen(true)
      setSelectedSetNumber(null)
    } else if (action === 'back-history') {
      setMatchState(createTutorialHistoryMatch())
      setIsHistoryOpen(false)
      setSelectedSetNumber(1)
    } else if (action === 'next-game') {
      closePracticeUi()
      setMatchState(createTutorialResultMatch())
    }
  }

  const startTutorial = () => {
    tutorialSnapshot.current = {
      matchState,
      generalSettings,
      matchSettings,
      isCenterControlOpen,
      isResetDialogOpen,
      isSettingsDialogOpen,
      serviceSelection,
      isHistoryOpen,
      selectedSetNumber,
    }
    setTutorialStepIndex(0)
    setTutorialMode('running')
    setIsTutorialExitOpen(false)
    setGeneralSettings({
      ...generalSettings,
      playerServeIndicatorEnabled: false,
      teamServeIndicatorEnabled: true,
    })
    setMatchSettings(TUTORIAL_RULES)
    prepareTutorialStep(0)
  }

  const completeTutorialAction = (action: TutorialAction) => {
    if (
      tutorialMode !== 'running' ||
      !canAdvanceTutorial(tutorialStepIndex, action)
    ) {
      return
    }

    if (tutorialStepIndex === TUTORIAL_STEPS.length - 1) {
      finishTutorial()
    } else {
      const nextStepIndex = tutorialStepIndex + 1
      prepareTutorialStep(nextStepIndex)
      setTutorialStepIndex(nextStepIndex)
    }
  }

  const selectedSet = selectedSetNumber === null
    ? null
    : matchState.completedSets.find(
        (set) => set.setNumber === selectedSetNumber,
      ) ?? null
  const displaySides = selectedSet
    ? {
        left: {
          id: 'left' as const,
          name: selectedSet.leftName,
          playerNames: matchState.sides.left.playerNames,
          score: selectedSet.leftScore,
        },
        right: {
          id: 'right' as const,
          name: selectedSet.rightName,
          playerNames: matchState.sides.right.playerNames,
          score: selectedSet.rightScore,
        },
      }
    : matchState.sides
  const isFrozen = matchState.phase !== 'playing'
  const isReadOnly = isFrozen || selectedSet !== null
  const rulesLocked =
    matchState.sides.left.score > 0 ||
    matchState.sides.right.score > 0 ||
    matchState.completedSets.length > 0

  const addPoint = (side: SideId) => {
    setMatchState((current) => {
      if (current.phase !== 'playing' || selectedSetNumber !== null) {
        return current
      }

      const rules = current.activeRules ?? matchSettings
      const sides = {
        ...current.sides,
        [side]: {
          ...current.sides[side],
          score: current.sides[side].score + 1,
        },
      }
      const scoresAfterRally = {
        left: sides.left.score,
        right: sides.right.score,
      }
      const doublesService = current.doublesService
        ? applyDoublesRally(
            current.doublesService,
            current.servingSide,
            side,
            scoresAfterRally,
          )
        : null

      return finalizeScoreChange(
        current,
        sides,
        side,
        rules,
        doublesService,
        generalSettings.playerServeIndicatorEnabled,
      )
    })
    completeTutorialAction(side === 'left' ? 'add-left' : 'add-right')
  }

  const removePoint = (side: SideId) => {
    setMatchState((current) => {
      if (
        current.phase !== 'playing' ||
        current.sides[side].score === 0 ||
        selectedSetNumber !== null
      ) {
        return current
      }

      const nextScore = current.sides[side].score - 1
      const otherSide: SideId = side === 'left' ? 'right' : 'left'
      const shouldUnlockRules =
        nextScore === 0 &&
        current.sides[otherSide].score === 0 &&
        current.completedSets.length === 0

      return {
        ...current,
        sides: {
          ...current.sides,
          [side]: {
            ...current.sides[side],
            score: nextScore,
          },
        },
        servingSide: null,
        doublesService: current.doublesService
          ? { ...current.doublesService, servingPlayerIndex: null }
          : null,
        activeRules: shouldUnlockRules ? null : current.activeRules,
      }
    })
    if (side === 'left') {
      completeTutorialAction('remove-left')
    }
  }

  const transferPoint = (source: SideId, destination: SideId) => {
    setMatchState((current) => {
      if (current.phase !== 'playing' || selectedSetNumber !== null) {
        return current
      }

      if (current.sides[source].score === 0) {
        return {
          ...current,
          servingSide: destination,
          doublesService: current.doublesService
            ? setDoublesServer(
                current.doublesService,
                destination,
                current.sides[destination].score,
              )
            : null,
        }
      }

      const rules = current.activeRules ?? matchSettings
      const sides = {
        ...current.sides,
        [source]: {
          ...current.sides[source],
          score: current.sides[source].score - 1,
        },
        [destination]: {
          ...current.sides[destination],
          score: current.sides[destination].score + 1,
        },
      }

      const doublesService = current.doublesService
        ? setDoublesServer(
            current.doublesService,
            destination,
            sides[destination].score,
          )
        : null

      return finalizeScoreChange(
        current,
        sides,
        destination,
        rules,
        doublesService,
        generalSettings.playerServeIndicatorEnabled,
      )
    })
    if (source === 'right' && destination === 'left') {
      completeTutorialAction('transfer-right-left')
    } else if (source === 'left' && destination === 'right') {
      completeTutorialAction('transfer-left-right')
    }
  }

  const updateName = (side: SideId, name: string) => {
    setMatchState((current) =>
      current.phase === 'playing' && selectedSetNumber === null
        ? {
            ...current,
            sides: {
              ...current.sides,
              [side]: { ...current.sides[side], name },
            },
          }
        : current,
    )
  }

  const updatePlayerName = (
    side: SideId,
    playerIndex: PlayerIndex,
    playerName: string,
  ) => {
    setMatchState((current) => {
      if (current.phase !== 'playing' || selectedSetNumber !== null) {
        return current
      }

      const playerNames = [...current.sides[side].playerNames] as [
        string,
        string,
      ]
      playerNames[playerIndex] = playerName

      return {
        ...current,
        sides: {
          ...current.sides,
          [side]: { ...current.sides[side], playerNames },
        },
      }
    })
  }

  const swapTeams = () => {
    setMatchState((current) => {
      if (current.phase !== 'playing' || selectedSetNumber !== null) {
        return current
      }

      const swapSide = (side: SideId | null) =>
        side === 'left' ? 'right' : side === 'right' ? 'left' : null

      return {
        ...current,
        sides: {
          left: { ...current.sides.right, id: 'left' },
          right: { ...current.sides.left, id: 'right' },
        },
        servingSide: swapSide(current.servingSide),
        doublesService: current.doublesService
          ? {
              leftCourtPlayerIndexes: {
                left: current.doublesService.leftCourtPlayerIndexes.right,
                right: current.doublesService.leftCourtPlayerIndexes.left,
              },
              servingPlayerIndex: current.doublesService.servingPlayerIndex,
            }
          : null,
        completedSets: current.completedSets.map((set) => ({
          ...set,
          leftName: set.rightName,
          rightName: set.leftName,
          leftScore: set.rightScore,
          rightScore: set.leftScore,
          winner: swapSide(set.winner)!,
        })),
      }
    })
  }

  const beginNextGame = () => {
    setMatchState((current) => ({
      ...current,
      sides: {
        left: { ...current.sides.left, score: 0 },
        right: { ...current.sides.right, score: 0 },
      },
      servingSide: null,
      doublesService: null,
      phase: 'playing',
      matchWinner: null,
      resultDialogOpen: false,
    }))
  }

  const startNewMatch = () => {
    setMatchState((current) => ({
      ...createFreshMatchState(),
      sides: {
        left: { ...current.sides.left, score: 0 },
        right: { ...current.sides.right, score: 0 },
      },
    }))
    setSelectedSetNumber(null)
    setIsHistoryOpen(false)
  }

  const resetMatch = (resetCompletedSets: boolean) => {
    const mustResetCompletedSets =
      resetCompletedSets || matchState.phase === 'matchWon'

    if (mustResetCompletedSets) {
      startNewMatch()
    } else {
      setMatchState((current) => ({
        ...current,
        sides: {
          left: { ...current.sides.left, score: 0 },
          right: { ...current.sides.right, score: 0 },
        },
        servingSide: null,
        doublesService: null,
        phase: 'playing',
        matchWinner: null,
        resultDialogOpen: false,
        activeRules:
          current.completedSets.length > 0 ? current.activeRules : null,
      }))
      setSelectedSetNumber(null)
    }

    setIsResetDialogOpen(false)
  }

  const undoWinningPoint = () => {
    setMatchState((current) => {
      const completedSet = current.completedSets.at(-1)
      if (!completedSet || current.phase === 'playing') {
        return current
      }

      const leftScore =
        completedSet.previousLeftScore ??
        completedSet.leftScore - (completedSet.winner === 'left' ? 1 : 0)
      const rightScore =
        completedSet.previousRightScore ??
        completedSet.rightScore - (completedSet.winner === 'right' ? 1 : 0)
      const remainingSets = current.completedSets.slice(0, -1)

      return {
        ...current,
        sides: {
          left: {
            ...current.sides.left,
            score: leftScore,
          },
          right: {
            ...current.sides.right,
            score: rightScore,
          },
        },
        servingSide: completedSet.previousServingSide ?? null,
        doublesService: completedSet.previousDoublesService ?? null,
        completedSets: remainingSets,
        phase: 'playing',
        matchWinner: null,
        resultDialogOpen: false,
        activeRules:
          leftScore === 0 && rightScore === 0 && remainingSets.length === 0
            ? null
            : current.activeRules,
      }
    })
  }

  const handleCenterAction = (action: CenterControlAction) => {
    if (action === 'swap') {
      swapTeams()
    }

    if (action === 'reset') {
      setIsCenterControlOpen(false)
      setIsResetDialogOpen(true)
    }

    if (action === 'service' && !isFrozen) {
      setIsCenterControlOpen(false)
      setServiceSelection(
        generalSettings.playerServeIndicatorEnabled
          ? {
              mode: 'leftCourt',
              side: 'left',
              leftCourtPlayerIndexes: {},
            }
          : { mode: 'team' },
      )
    }

    if (action === 'settings') {
      setIsCenterControlOpen(false)
      setIsSettingsDialogOpen(true)
    }

    if (action === 'service') {
      completeTutorialAction('service')
    }
  }

  const selectService = (side: SideId) => {
    setMatchState((current) =>
      current.phase === 'playing'
        ? {
            ...current,
            servingSide: side,
            doublesService: current.doublesService
              ? setDoublesServer(
                  current.doublesService,
                  side,
                  current.sides[side].score,
                )
              : null,
          }
        : current,
    )
    setServiceSelection(null)
    completeTutorialAction('team-service')
  }

  const selectServicePlayer = (side: SideId, playerIndex: PlayerIndex) => {
    if (!serviceSelection || serviceSelection.mode === 'team') {
      return
    }

    if (serviceSelection.mode === 'leftCourt') {
      const leftCourtPlayerIndexes = {
        ...serviceSelection.leftCourtPlayerIndexes,
        [side]: playerIndex,
      }

      if (side === 'left') {
        setServiceSelection({
          mode: 'leftCourt',
          side: 'right',
          leftCourtPlayerIndexes,
        })
      } else {
        setServiceSelection({
          mode: 'server',
          leftCourtPlayerIndexes:
            leftCourtPlayerIndexes as Record<SideId, PlayerIndex>,
        })
      }
      return
    }

    const expectedPlayer = getPlayerForScore(
      serviceSelection.leftCourtPlayerIndexes[side],
      matchState.sides[side].score,
    )
    if (playerIndex !== expectedPlayer) {
      return
    }

    setMatchState((current) => ({
      ...current,
      servingSide: side,
      doublesService: createDoublesServiceState(
        serviceSelection.leftCourtPlayerIndexes,
        side,
        {
          left: current.sides.left.score,
          right: current.sides.right.score,
        },
      ),
    }))
    setServiceSelection(null)
  }

  const swapCourtPlayers = (side: SideId) => {
    setMatchState((current) => {
      if (current.phase !== 'playing' || !current.doublesService) {
        return current
      }

      return {
        ...current,
        doublesService: swapDoublesTeamPositions(
          current.doublesService,
          side,
          current.servingSide,
          current.sides[side].score,
        ),
      }
    })
  }

  const assignCourtServer = (side: SideId, playerIndex: PlayerIndex) => {
    setMatchState((current) => {
      if (current.phase !== 'playing' || !current.doublesService) {
        return current
      }

      return {
        ...current,
        servingSide: side,
        doublesService: assignDoublesServer(
          current.doublesService,
          side,
          playerIndex,
          current.sides[side].score,
        ),
      }
    })
  }

  const updateMatchSettings = (settings: MatchSettings) => {
    setMatchSettings(settings)
    saveMatchSettings(settings)
    setIsSettingsDialogOpen(false)
  }

  const updateGeneralSettings = (settings: GeneralSettings) => {
    setGeneralSettings(settings)
    saveGeneralSettings(settings)
    setIsSettingsDialogOpen(false)
  }

  const handleCenterOpenChange = (isOpen: boolean) => {
    setIsCenterControlOpen(isOpen)
    if (isOpen) {
      completeTutorialAction('open-menu')
    }
  }

  const latestCompletedSet = matchState.completedSets.at(-1)
  const showPlayerMode =
    generalSettings.playerServeIndicatorEnabled && selectedSet === null
  const showServiceCourt =
    generalSettings.playerServeIndicatorEnabled &&
    serviceSelection === null &&
    selectedSet === null &&
    tutorialMode !== 'running'
  const serviceCourtModel = createCourtViewModel({
    doublesService: matchState.doublesService,
    playerMode: generalSettings.playerServeIndicatorEnabled,
    servingSide: matchState.servingSide,
    sides: matchState.sides,
  })
  const matchWinnerName = matchState.matchWinner
    ? latestCompletedSet
      ? matchState.matchWinner === 'left'
        ? latestCompletedSet.leftName
        : latestCompletedSet.rightName
      : getSideDisplayName(
          matchState.sides[matchState.matchWinner],
          generalSettings.playerServeIndicatorEnabled,
        )
    : ''
  const isSelectingService = serviceSelection !== null
  const getPlayerSelection = (side: SideId) => {
    if (!serviceSelection || serviceSelection.mode === 'team') {
      return null
    }

    if (serviceSelection.mode === 'leftCourt') {
      return serviceSelection.side === side
        ? {
            choices: [0, 1] as PlayerIndex[],
            prompt: 'Choose the player on the left / odd court',
          }
        : null
    }

    return {
      choices: [
        getPlayerForScore(
          serviceSelection.leftCourtPlayerIndexes[side],
          matchState.sides[side].score,
        ),
      ],
      prompt: 'Choose the current server',
    }
  }

  return (
    <main
      className={`scoreboard${isCenterControlOpen ? ' scoreboard--menu-open' : ''}${isFrozen ? ' scoreboard--frozen' : ''}${selectedSet ? ' scoreboard--archive' : ''}`}
      aria-label="Badminton score tracker"
    >
      <ScoreSide
        isReadOnly={isReadOnly}
        isSelectingService={isSelectingService}
        isServing={!isReadOnly && matchState.servingSide === 'left'}
        playerNames={displaySides.left.playerNames}
        playerSelection={getPlayerSelection('left')}
        servingPlayerIndex={matchState.doublesService?.servingPlayerIndex}
        showPlayerServeIndicator={
          showPlayerMode
        }
        showTeamServeIndicator={generalSettings.teamServeIndicatorEnabled}
        showTeamServiceTarget={serviceSelection?.mode === 'team'}
        side="left"
        name={displaySides.left.name}
        score={displaySides.left.score}
        onAddPoint={() => addPoint('left')}
        onRemovePoint={() => removePoint('left')}
        onNameChange={(name) => updateName('left', name)}
        onNameEditStart={() => completeTutorialAction('edit-name')}
        onPlayerNameChange={(playerIndex, playerName) =>
          updatePlayerName('left', playerIndex, playerName)
        }
        onSelectService={() => selectService('left')}
        onSelectPlayer={(playerIndex) =>
          selectServicePlayer('left', playerIndex)
        }
        onTransferPoint={(destination) => transferPoint('left', destination)}
      />
      <ScoreSide
        isReadOnly={isReadOnly}
        isSelectingService={isSelectingService}
        isServing={!isReadOnly && matchState.servingSide === 'right'}
        playerNames={displaySides.right.playerNames}
        playerSelection={getPlayerSelection('right')}
        servingPlayerIndex={matchState.doublesService?.servingPlayerIndex}
        showPlayerServeIndicator={
          showPlayerMode
        }
        showTeamServeIndicator={generalSettings.teamServeIndicatorEnabled}
        showTeamServiceTarget={serviceSelection?.mode === 'team'}
        side="right"
        name={displaySides.right.name}
        score={displaySides.right.score}
        onAddPoint={() => addPoint('right')}
        onRemovePoint={() => removePoint('right')}
        onNameChange={(name) => updateName('right', name)}
        onNameEditStart={() => completeTutorialAction('edit-name')}
        onPlayerNameChange={(playerIndex, playerName) =>
          updatePlayerName('right', playerIndex, playerName)
        }
        onSelectService={() => selectService('right')}
        onSelectPlayer={(playerIndex) =>
          selectServicePlayer('right', playerIndex)
        }
        onTransferPoint={(destination) => transferPoint('right', destination)}
      />
      {showServiceCourt && (
        <ServiceCourt
          canEdit={
            matchState.phase === 'playing' && matchState.doublesService !== null
          }
          leftName={matchState.sides.left.name}
          model={serviceCourtModel}
          onAssignServer={assignCourtServer}
          onSwapPlayers={swapCourtPlayers}
          rightName={matchState.sides.right.name}
        />
      )}
      {matchState.phase === 'matchWon' && !matchState.resultDialogOpen && (
        <button
          type="button"
          className="scoreboard__match-complete"
          aria-label={`Match complete: ${matchWinnerName} wins. Reopen result`}
          onClick={() =>
            setMatchState((current) => ({
              ...current,
              resultDialogOpen: true,
            }))
          }
        >
          Match complete: {matchWinnerName} wins
        </button>
      )}
      {!selectedSet && (
        <CenterControl
          disabledActions={isFrozen ? ['swap', 'service'] : []}
          isOpen={isCenterControlOpen}
          onAction={handleCenterAction}
          onOpenChange={handleCenterOpenChange}
        />
      )}
      <SetHistoryControl
        completedSets={matchState.completedSets}
        isOpen={isHistoryOpen}
        raiseCircle={generalSettings.raiseBottomHistoryControlEnabled}
        selectedSetNumber={selectedSetNumber}
        onBack={() => {
          setSelectedSetNumber(null)
          completeTutorialAction('back-history')
        }}
        onSelect={(setNumber) => {
          setSelectedSetNumber(setNumber)
          setIsHistoryOpen(false)
          completeTutorialAction('select-history')
        }}
        onToggle={() => {
          setIsHistoryOpen((isOpen) => !isOpen)
          completeTutorialAction('open-history')
        }}
      />
      {isResetDialogOpen && (
        <ResetMatchDialog
          forceResetCompletedSets={matchState.phase === 'matchWon'}
          onCancel={() => {
            setIsResetDialogOpen(false)
          }}
          onConfirm={resetMatch}
        />
      )}
      {isSettingsDialogOpen && (
        <MatchSettingsDialog
          generalSettings={generalSettings}
          isLocked={rulesLocked}
          settings={matchSettings}
          onCancel={() => {
            setIsSettingsDialogOpen(false)
          }}
          onSave={updateMatchSettings}
          onSaveGeneralSettings={updateGeneralSettings}
          onStartTutorial={startTutorial}
        />
      )}
      {latestCompletedSet &&
        matchState.phase !== 'playing' &&
        matchState.resultDialogOpen && (
          <GameResultDialog
            completedSet={latestCompletedSet}
            leftSetsWon={countSetWins(matchState.completedSets, 'left')}
            phase={matchState.phase}
            rightSetsWon={countSetWins(matchState.completedSets, 'right')}
            tutorialSafeShare={tutorialMode === 'running'}
            onCloseMatch={() =>
              setMatchState((current) => ({
                ...current,
                resultDialogOpen: false,
              }))
            }
            onNewMatch={startNewMatch}
            onNextGame={() => {
              beginNextGame()
              completeTutorialAction('next-game')
            }}
            onTutorialAction={(action) =>
              completeTutorialAction(
                action === 'copy' ? 'copy-result' : 'share-result',
              )
            }
            onUndoWinningPoint={() => {
              undoWinningPoint()
              completeTutorialAction('undo-result')
            }}
          />
        )}
      {tutorialMode === 'offer' && (
        <TutorialWelcome
          onSkipAll={skipAllTutorial}
          onStart={startTutorial}
        />
      )}
      {tutorialMode === 'running' && TUTORIAL_STEPS[tutorialStepIndex] && (
        <TutorialOverlay
          step={TUTORIAL_STEPS[tutorialStepIndex]}
          stepIndex={tutorialStepIndex}
          totalSteps={TUTORIAL_STEPS.length}
          onFinish={finishTutorial}
          onBack={() => {
            const previousStepIndex = Math.max(0, tutorialStepIndex - 1)
            prepareTutorialStep(previousStepIndex)
            setTutorialStepIndex(previousStepIndex)
          }}
          onRequestExit={() => setIsTutorialExitOpen(true)}
          onSkipAll={skipAllTutorial}
        />
      )}
      {tutorialMode === 'running' && isTutorialExitOpen && (
        <TutorialExitDialog
          onContinue={() => setIsTutorialExitOpen(false)}
          onSkipAll={skipAllTutorial}
        />
      )}
    </main>
  )
}