import { useEffect, useState } from 'react'
import { Box, Container, Stack } from '@mantine/core'
import { MatchHeader } from './components/MatchHeader'
import { useMatchController } from './hooks/useMatchController'
import { useThemeColors } from './hooks/useThemeColors'
import type { MatchState } from './types/match'
import type { MatchConfig } from './utils/match'
import { PlayerGridSection } from './components/PlayerGridSection'
import { MatchDetailPanels } from './components/MatchDetailPanels'
import { ScoreOnlyOverlays } from './components/ScoreOnlyOverlays'

function App() {
  const { match, history, gamesNeeded, matchIsLive, actions } = useMatchController()
  const { colorScheme, pageBg, cardBg, mutedText, toggleColorMode } = useThemeColors()
  const [scoreOnlyMode, setScoreOnlyMode] = useState(false)
  const {
    handleNameChange,
    handlePointChange,
    handleUndo,
    handleResetGame,
    handleResetMatch,
    handleSwapEnds,
    handleServerToggle,
    handleSetServer,
    handleSavePlayerName,
    handleApplySavedName,
    handleClockToggle,
    pushUpdate,
  } = actions

  const matchConfig: MatchConfig = {
    raceTo: match.raceTo,
    maxPoint: match.maxPoint,
    winByTwo: match.winByTwo,
  }

  const handleScoreOnlyToggle = () => setScoreOnlyMode((previous) => !previous)

  const [displayElapsedMs, setDisplayElapsedMs] = useState(match.clockElapsedMs)

  useEffect(() => {
    document.title = 'Badminton Score Tracker'
  }, [])

  useEffect(() => {
    if (!match.clockRunning || !match.clockStartedAt) {
      setDisplayElapsedMs(match.clockElapsedMs)
      return
    }

    const startOffset = match.clockElapsedMs
    const startedAt = match.clockStartedAt

    const update = () => {
      setDisplayElapsedMs(startOffset + (Date.now() - startedAt))
    }

    update()
    const intervalId = window.setInterval(update, 1000)
    return () => window.clearInterval(intervalId)
  }, [match.clockRunning, match.clockStartedAt, match.clockElapsedMs])

  const handleRaceToChange = (value: number) => {
    pushUpdate((state) => ({
      ...state,
      raceTo:
        !value || Number.isNaN(value) || value < 11
          ? 21
          : Math.min(value, state.maxPoint),
    }))
  }

  const handleBestOfChange = (nextBestOf: MatchState['bestOf']) => {
    pushUpdate((state) => {
      const nextGamesNeeded = Math.ceil(nextBestOf / 2)
      const updatedPlayers = state.players.map((player) => ({
        ...player,
        games: Math.min(player.games, nextGamesNeeded),
      }))
      const pendingWinner =
        updatedPlayers.find((player) => player.games >= nextGamesNeeded)?.id ?? null

      return {
        ...state,
        bestOf: nextBestOf,
        players: updatedPlayers,
        matchWinner: pendingWinner,
      }
    })
  }

  const handleWinByTwoToggle = (checked: boolean) => {
    pushUpdate((state) => ({
      ...state,
      winByTwo: checked,
    }))
  }

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: pageBg, paddingInline: '0.75rem' }}>
      <Container size="lg" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
        <Stack gap="lg">
          {!scoreOnlyMode && (
            <MatchHeader
              cardBg={cardBg}
              mutedText={mutedText}
              onUndo={handleUndo}
              onToggleColorMode={toggleColorMode}
              colorScheme={colorScheme}
              canUndo={history.length > 0}
              scoreOnlyMode={scoreOnlyMode}
              onToggleScoreOnly={handleScoreOnlyToggle}
            />
          )}
          <PlayerGridSection
            players={match.players}
            cardBg={cardBg}
            mutedText={mutedText}
            server={match.server}
            matchWinner={match.matchWinner}
            gamesNeeded={gamesNeeded}
            matchConfig={matchConfig}
            matchIsLive={matchIsLive}
            savedNames={match.savedNames}
            onNameChange={handleNameChange}
            onPointChange={handlePointChange}
            onApplySavedName={handleApplySavedName}
            onSaveName={handleSavePlayerName}
          />

          {!scoreOnlyMode && (
            <MatchDetailPanels
              cardBg={cardBg}
              mutedText={mutedText}
              match={match}
              gamesNeeded={gamesNeeded}
              matchIsLive={matchIsLive}
              elapsedMs={displayElapsedMs}
              onRaceToChange={handleRaceToChange}
              onBestOfChange={handleBestOfChange}
              onWinByTwoToggle={handleWinByTwoToggle}
              onSwapEnds={handleSwapEnds}
              onToggleServer={handleServerToggle}
              onResetGame={handleResetGame}
              onResetMatch={handleResetMatch}
              onToggleClock={handleClockToggle}
            />
          )}

          <ScoreOnlyOverlays
            active={scoreOnlyMode}
            mutedText={mutedText}
            players={match.players}
            server={match.server}
            onExitScoreOnly={handleScoreOnlyToggle}
            onSetServer={handleSetServer}
            onToggleServer={handleServerToggle}
          />
        </Stack>
      </Container>
    </Box>
  )
}

export default App
