import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Container, Stack } from '@mantine/core'
import { MatchHeader } from './components/MatchHeader'
import { PlayerGridSection } from './components/PlayerGridSection'
import { ScoreOnlyOverlays } from './components/ScoreOnlyOverlays'
import { ProfilerWrapper } from './components/ProfilerWrapper'
import { useMatchController } from './hooks/useMatchController'
import { useThemeColors } from './hooks/useThemeColors'
import { useLanguage } from './hooks/useLanguage'
import { perfMonitor } from './utils/performance'
import type { MatchState } from './types/match'
import type { MatchConfig } from './utils/match'
const STORAGE_KEYS = {
  scoreOnly: 'scoreOnlyMode',
  simpleScore: 'simpleScoreMode',
} as const

const readStoredBoolean = (key: string, fallback = false) => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === 'true') return true
    if (raw === 'false') return false
    return fallback
  } catch {
    return fallback
  }
}

const useDebouncedBooleanStorage = (key: string, value: boolean, delay = 200) => {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handle = window.setTimeout(() => {
      try {
        window.localStorage.setItem(key, value ? 'true' : 'false')
      } catch {
        /* ignore storage issues */
      }
    }, delay)
    return () => window.clearTimeout(handle)
  }, [key, value, delay])
}

const MatchDetailPanels = lazy(() =>
  import('./components/MatchDetailPanels').then(({ MatchDetailPanels }) => ({
    default: MatchDetailPanels,
  })),
)
const DoublesCourtDiagram = lazy(() =>
  import('./components/DoublesCourtDiagram').then(({ DoublesCourtDiagram }) => ({
    default: DoublesCourtDiagram,
  })),
)
const SimpleScoreView = lazy(() =>
  import('./components/SimpleScoreView').then(({ SimpleScoreView }) => ({
    default: SimpleScoreView,
  })),
)

function App() {
  const { language, toggleLanguage, t } = useLanguage()
  const { match, history, gamesNeeded, matchIsLive, completedMatches, actions } =
    useMatchController(t)
  const { colorScheme, pageBg, cardBg, mutedText, toggleColorMode } = useThemeColors()
  const [scoreOnlyMode, setScoreOnlyMode] = useState(() =>
    readStoredBoolean(STORAGE_KEYS.scoreOnly),
  )
  const [simpleScoreMode, setSimpleScoreMode] = useState(() =>
    readStoredBoolean(STORAGE_KEYS.simpleScore),
  )
  const {
    handleNameChange,
    handlePointChange,
    handleUndo,
    handleResetGame,
    handleResetMatch,
    handleSwapEnds,
    handleServerToggle,
    handleSetServer,
    handleTeammateNameChange,
    handleDoublesModeToggle,
    handleSavePlayerName,
    handleSaveTeammateName,
    handleApplySavedName,
    handleClockToggle,
    handleSwapTeammates,
    handleClearHistory,
    pushUpdate,
  } = actions

  useDebouncedBooleanStorage(STORAGE_KEYS.scoreOnly, scoreOnlyMode)
  useDebouncedBooleanStorage(STORAGE_KEYS.simpleScore, simpleScoreMode)

  const matchConfig: MatchConfig = useMemo(
    () => ({
      raceTo: match.raceTo,
      maxPoint: match.maxPoint,
      winByTwo: match.winByTwo,
    }),
    [match.maxPoint, match.raceTo, match.winByTwo],
  )

  const handleScoreOnlyToggle = useCallback(() => {
    perfMonitor.recordUserFlow({ type: 'toggle-score-only-view', timestamp: performance.now() })
    setScoreOnlyMode((previous) => {
      const next = !previous
      if (next) {
        setSimpleScoreMode(false)
      }
      return next
    })
  }, [])

  const handleSimpleScoreToggle = useCallback(() => {
    perfMonitor.recordUserFlow({ type: 'toggle-simple-score-view', timestamp: performance.now() })
    setSimpleScoreMode((previous) => {
      const next = !previous
      if (next) {
        setScoreOnlyMode(false)
      }
      return next
    })
  }, [])

  const [displayElapsedMs, setDisplayElapsedMs] = useState(match.clockElapsedMs)

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

  const handleRaceToChange = useCallback(
    (value: number) => {
      pushUpdate((state) => ({
        ...state,
        raceTo:
          !value || Number.isNaN(value) || value < 11
            ? 21
            : Math.min(value, state.maxPoint),
      }))
    },
    [pushUpdate],
  )

  const handleBestOfChange = useCallback(
    (nextBestOf: MatchState['bestOf']) => {
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
    },
    [pushUpdate],
  )

  const handleWinByTwoToggle = useCallback(
    (checked: boolean) => {
      pushUpdate((state) => ({
        ...state,
        winByTwo: checked,
      }))
    },
    [pushUpdate],
  )

  if (simpleScoreMode) {
    return (
      <ProfilerWrapper id="App-SimpleScoreMode">
        <Box
          style={{ minHeight: '100vh', backgroundColor: pageBg, paddingInline: '0.75rem' }}
        >
          <Container size="md" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
            <Suspense fallback={<Stack gap="xs">{t.app.loadingScoreView}</Stack>}>
              <ProfilerWrapper id="SimpleScoreView">
                <SimpleScoreView
                  players={match.players}
                  cardBg={cardBg}
                  mutedText={mutedText}
                  matchIsLive={matchIsLive}
                  onPointChange={handlePointChange}
                  onExit={() => setSimpleScoreMode(false)}
                  t={t}
                />
              </ProfilerWrapper>
            </Suspense>
          </Container>
        </Box>
      </ProfilerWrapper>
    )
  }

  return (
    <ProfilerWrapper id="App-FullMode">
      <Box
        style={{ minHeight: '100vh', backgroundColor: pageBg, paddingInline: '0.75rem' }}
      >
        <Container size="lg" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
          <Stack gap="lg">
            {!scoreOnlyMode && (
              <ProfilerWrapper id="MatchHeader">
                <MatchHeader
                  cardBg={cardBg}
                  mutedText={mutedText}
                  onUndo={handleUndo}
                  onToggleColorMode={toggleColorMode}
                  colorScheme={colorScheme}
                  canUndo={history.length > 0}
                  scoreOnlyMode={scoreOnlyMode}
                  onToggleScoreOnly={handleScoreOnlyToggle}
                  simpleScoreMode={simpleScoreMode}
                  onToggleSimpleScore={handleSimpleScoreToggle}
                  language={language}
                  onToggleLanguage={toggleLanguage}
                  t={t}
                />
              </ProfilerWrapper>
            )}
            <ProfilerWrapper id="PlayerGridSection">
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
                doublesMode={match.doublesMode}
                teammateServerMap={match.teammateServerMap}
                onNameChange={handleNameChange}
                onPointChange={handlePointChange}
                onApplySavedName={handleApplySavedName}
                onSaveName={handleSavePlayerName}
                onTeammateNameChange={handleTeammateNameChange}
                onSaveTeammateName={handleSaveTeammateName}
                onSwapTeammates={handleSwapTeammates}
                t={t}
              />
            </ProfilerWrapper>

            {match.doublesMode && (
              <Suspense fallback={<Stack gap="xs">{t.app.loadingDoublesDiagram}</Stack>}>
                <ProfilerWrapper id="DoublesCourtDiagram">
                  <DoublesCourtDiagram
                    players={match.players}
                    server={match.server}
                    cardBg={cardBg}
                    mutedText={mutedText}
                    teammateServerMap={match.teammateServerMap}
                    t={t}
                  />
                </ProfilerWrapper>
              </Suspense>
            )}

            {!scoreOnlyMode && (
              <Suspense fallback={<Stack gap="xs">{t.app.loadingMatchDetails}</Stack>}>
                <ProfilerWrapper id="MatchDetailPanels">
                  <MatchDetailPanels
                    cardBg={cardBg}
                    mutedText={mutedText}
                    match={match}
                    gamesNeeded={gamesNeeded}
                    matchIsLive={matchIsLive}
                    elapsedMs={displayElapsedMs}
                    completedMatches={completedMatches}
                    onRaceToChange={handleRaceToChange}
                    onBestOfChange={handleBestOfChange}
                    onWinByTwoToggle={handleWinByTwoToggle}
                    onDoublesToggle={handleDoublesModeToggle}
                    onSwapEnds={handleSwapEnds}
                    onToggleServer={handleServerToggle}
                    onResetGame={handleResetGame}
                    onResetMatch={handleResetMatch}
                    onToggleClock={handleClockToggle}
                    onClearHistory={handleClearHistory}
                    onApplyProfile={handleApplySavedName}
                    onSaveProfile={handleSavePlayerName}
                    t={t}
                  />
                </ProfilerWrapper>
              </Suspense>
            )}

            <ScoreOnlyOverlays
              active={scoreOnlyMode && !simpleScoreMode}
              mutedText={mutedText}
              players={match.players}
              server={match.server}
              doublesMode={match.doublesMode}
              teammateServerMap={match.teammateServerMap}
              onExitScoreOnly={handleScoreOnlyToggle}
              onSetServer={handleSetServer}
              onToggleServer={handleServerToggle}
              t={t}
            />
          </Stack>
        </Container>
      </Box>
    </ProfilerWrapper>
  )
}

export default App
