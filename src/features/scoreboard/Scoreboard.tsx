import { useEffect, useState } from 'react'
import {
  CenterControl,
  type CenterControlAction,
} from './CenterControl'
import { GameResultDialog } from './GameResultDialog'
import { MatchSettingsDialog } from './MatchSettingsDialog'
import { ResetMatchDialog } from './ResetMatchDialog'
import { ScoreSide } from './ScoreSide'
import { SetHistoryControl } from './SetHistoryControl'
import {
  applyDoublesRally,
  createDoublesServiceState,
  getPlayerForScore,
  setDoublesServer,
} from './doublesService'
import { getGameWinner } from './gameRules'
import {
  loadGeneralSettings,
  saveGeneralSettings,
  type GeneralSettings,
} from './generalSettings'
import {
  loadMatchSettings,
  saveMatchSettings,
  type MatchSettings,
} from './matchSettings'
import {
  createFreshMatchState,
  loadMatchState,
  saveMatchState,
} from './matchState'
import type {
  CompletedSet,
  DoublesServiceState,
  MatchState,
  PlayerIndex,
  SideId,
} from './scoreboard.types'
import './scoreboard.css'

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

  useEffect(() => {
    saveMatchState(matchState)
  }, [matchState])

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

  const latestCompletedSet = matchState.completedSets.at(-1)
  const showPlayerMode =
    generalSettings.playerServeIndicatorEnabled && selectedSet === null
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
        hapticsEnabled={generalSettings.hapticsEnabled}
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
        hapticsEnabled={generalSettings.hapticsEnabled}
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
        onPlayerNameChange={(playerIndex, playerName) =>
          updatePlayerName('right', playerIndex, playerName)
        }
        onSelectService={() => selectService('right')}
        onSelectPlayer={(playerIndex) =>
          selectServicePlayer('right', playerIndex)
        }
        onTransferPoint={(destination) => transferPoint('right', destination)}
      />
      {matchState.phase === 'matchWon' && !matchState.resultDialogOpen && (
        <p
          className="scoreboard__match-complete"
          role="status"
          aria-label={`Match complete: ${matchWinnerName} wins`}
        >
          Match complete: {matchWinnerName} wins
        </p>
      )}
      {!selectedSet && (
        <CenterControl
          disabledActions={isFrozen ? ['swap', 'service'] : []}
          isOpen={isCenterControlOpen}
          onAction={handleCenterAction}
          onOpenChange={setIsCenterControlOpen}
        />
      )}
      <SetHistoryControl
        completedSets={matchState.completedSets}
        isOpen={isHistoryOpen}
        selectedSetNumber={selectedSetNumber}
        onBack={() => setSelectedSetNumber(null)}
        onSelect={(setNumber) => {
          setSelectedSetNumber(setNumber)
          setIsHistoryOpen(false)
        }}
        onToggle={() => setIsHistoryOpen((isOpen) => !isOpen)}
      />
      {isResetDialogOpen && (
        <ResetMatchDialog
          forceResetCompletedSets={matchState.phase === 'matchWon'}
          onCancel={() => setIsResetDialogOpen(false)}
          onConfirm={resetMatch}
        />
      )}
      {isSettingsDialogOpen && (
        <MatchSettingsDialog
          generalSettings={generalSettings}
          isLocked={rulesLocked}
          settings={matchSettings}
          onCancel={() => setIsSettingsDialogOpen(false)}
          onSave={updateMatchSettings}
          onSaveGeneralSettings={updateGeneralSettings}
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
            onCloseMatch={() =>
              setMatchState((current) => ({
                ...current,
                resultDialogOpen: false,
              }))
            }
            onNewMatch={startNewMatch}
            onNextGame={beginNextGame}
            onUndoWinningPoint={undoWinningPoint}
          />
        )}
    </main>
  )
}