import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Burger,
  Button,
  CloseButton,
  Container,
  Drawer,
  Group,
  Stack,
  Text,
} from '@mantine/core'
import { MatchHeader } from './components/MatchHeader'
import { PlayerGridSection } from './components/PlayerGridSection'
import { MatchSettingsCard } from './components/MatchSettingsCard'
import { MatchControlsCard } from './components/MatchControlsCard'
import { ScoreOnlyOverlays } from './components/ScoreOnlyOverlays'
import { CoachScoreEntryCard } from './components/CoachScoreEntryCard'
import { ProfilerWrapper } from './components/ProfilerWrapper'
import { VictoryCelebration } from './components/VictoryCelebration'
import { OnboardingTour, useOnboardingTour } from './components/OnboardingTour'
import { DataManagementCard } from './components/DataManagementCard'
import { AppSettingsCard, readAppSettings, saveAppSettings } from './components/AppSettingsCard'
import {
  SimpleScoreViewSkeleton,
  MatchInsightsSkeleton,
  GameHistorySkeleton,
  MatchStatsSkeleton,
  DoublesCourtSkeleton,
} from './components/SkeletonLoaders'
import { useMatchController } from './hooks/useMatchController'
import { useThemeColors } from './hooks/useThemeColors'
import { useLanguage } from './hooks/useLanguage'
import { useHeartbeatSound } from './hooks/useHeartbeatSound'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useScoreAnnouncer } from './hooks/useScoreAnnouncer'
import { useReducedMotion } from './hooks/useReducedMotion'
import { perfMonitor } from './utils/performance'
import type { MatchState, PlayerId } from './types/match'
import type { MatchConfig } from './utils/match'

// App version for display
export const APP_VERSION = '1.0.0'

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
const MatchInsightsCard = lazy(() =>
  import('./components/MatchInsightsCard').then(({ MatchInsightsCard }) => ({
    default: MatchInsightsCard,
  })),
)
const GameHistoryCard = lazy(() =>
  import('./components/GameHistoryCard').then(({ GameHistoryCard }) => ({
    default: GameHistoryCard,
  })),
)
const MatchStatsPanel = lazy(() =>
  import('./components/MatchStatsPanel').then(({ MatchStatsPanel }) => ({
    default: MatchStatsPanel,
  })),
)

function App() {
  const { language, toggleLanguage, t } = useLanguage()
  const { match, history, gamesNeeded, matchIsLive, completedMatches, actions } =
    useMatchController(t)
  const { colorScheme, pageBg, cardBg, mutedText, toggleColorMode } = useThemeColors()
  const prefersReducedMotion = useReducedMotion()
  const [scoreOnlyMode, setScoreOnlyMode] = useState(() =>
    readStoredBoolean(STORAGE_KEYS.scoreOnly),
  )
  const [simpleScoreMode, setSimpleScoreMode] = useState(() =>
    readStoredBoolean(STORAGE_KEYS.simpleScore),
  )
  type MenuSection = 'score' | 'settings' | 'history' | 'coach'
  const [menuOpened, setMenuOpened] = useState(false)
  const [menuSection, setMenuSection] = useState<MenuSection>('score')
  const statsSectionRef = useRef<HTMLDivElement | null>(null)
  
  // Onboarding tour
  const {
    isOpen: isOnboardingOpen,
    completeOnboarding,
    skipOnboarding,
    openOnboarding,
  } = useOnboardingTour()

  // App settings (sound/haptic)
  const [soundEnabled, setSoundEnabled] = useState(() => readAppSettings().soundEffectsEnabled)
  const [hapticEnabled, setHapticEnabled] = useState(() => readAppSettings().hapticFeedbackEnabled)

  const handleSoundToggle = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled)
    saveAppSettings({ soundEffectsEnabled: enabled })
  }, [])

  const handleHapticToggle = useCallback((enabled: boolean) => {
    setHapticEnabled(enabled)
    saveAppSettings({ hapticFeedbackEnabled: enabled })
  }, [])

  // Screen reader announcements for score changes
  const { AnnouncerRegion } = useScoreAnnouncer({
    players: match.players,
    language,
  })

  const {
    handleNameChange,
    handlePointChange,
    handleSetScores,
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
    handleToggleFavoritePlayer,
    pushUpdate,
  } = actions

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPointChange: handlePointChange,
    onUndo: handleUndo,
    onToggleServer: handleServerToggle,
    onSwapEnds: handleSwapEnds,
    onToggleClock: handleClockToggle,
    matchIsLive,
    enabled: !menuOpened && !isOnboardingOpen,
  })

  const [showVictoryCelebration, setShowVictoryCelebration] = useState(false)
  const [celebrationWinnerName, setCelebrationWinnerName] = useState('')
  const prevMatchWinnerRef = useRef<PlayerId | null>(null)

  // Trigger celebration when a favorite player wins
  useEffect(() => {
    const currentWinner = match.matchWinner
    const prevWinner = prevMatchWinnerRef.current

    if (currentWinner && currentWinner !== prevWinner) {
      const favorites = match.favoritePlayerIds ?? []
      if (favorites.includes(currentWinner)) {
        const winner = match.players.find((p) => p.id === currentWinner)
        if (winner) {
          setCelebrationWinnerName(winner.name)
          setShowVictoryCelebration(true)
        }
      }
    }

    prevMatchWinnerRef.current = currentWinner
  }, [match.matchWinner, match.favoritePlayerIds, match.players])

  const handleCelebrationComplete = useCallback(() => {
    setShowVictoryCelebration(false)
  }, [])

  const toggleMenu = useCallback(() => {
    setMenuOpened((previous) => !previous)
  }, [])
  const closeMenu = useCallback(() => {
    setMenuOpened(false)
  }, [])
  const selectSection = useCallback((section: MenuSection, close = false) => {
    setMenuSection(section)
    if (close) {
      setMenuOpened(false)
    }
  }, [])

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

  // Detect critical game point (deuce at raceTo-1 or higher, e.g., 20-20 in a 21-point game)
  const isCriticalPoint = useMemo(() => {
    if (match.matchWinner) return false // No heartbeat if match is over
    const playerA = match.players.find((p) => p.id === 'playerA')
    const playerB = match.players.find((p) => p.id === 'playerB')
    if (!playerA || !playerB) return false
    const minDeuceScore = match.raceTo - 1 // e.g., 20 for a 21-point game
    return (
      playerA.points >= minDeuceScore &&
      playerB.points >= minDeuceScore &&
      playerA.points === playerB.points
    )
  }, [match.players, match.raceTo, match.matchWinner])

  // Play heartbeat sound during critical points
  useHeartbeatSound(isCriticalPoint, soundEnabled)

  const winningStreaks = useMemo(() => {
    const streaks: Record<PlayerId, number> = { playerA: 0, playerB: 0 }
    if (history.length === 0) return streaks

    const currentPlayerA = match.players.find((p) => p.id === 'playerA')?.points ?? 0
    const currentPlayerB = match.players.find((p) => p.id === 'playerB')?.points ?? 0

    let lastA = currentPlayerA
    let lastB = currentPlayerB
    let streakPlayer: PlayerId | null = null
    let streakCount = 0

    for (const prevState of history) {
      const histA = prevState.players.find((p) => p.id === 'playerA')?.points ?? 0
      const histB = prevState.players.find((p) => p.id === 'playerB')?.points ?? 0

      const playerAScored = lastA > histA
      const playerBScored = lastB > histB

      // Skip entries where no points changed (settings changes, name changes, etc.)
      if (!playerAScored && !playerBScored) {
        lastA = histA
        lastB = histB
        continue
      }

      if (playerAScored && !playerBScored) {
        if (streakPlayer === null || streakPlayer === 'playerA') {
          streakPlayer = 'playerA'
          streakCount++
        } else {
          break
        }
      } else if (playerBScored && !playerAScored) {
        if (streakPlayer === null || streakPlayer === 'playerB') {
          streakPlayer = 'playerB'
          streakCount++
        } else {
          break
        }
      } else {
        // Both scored somehow - shouldn't happen, but break to be safe
        break
      }

      lastA = histA
      lastB = histB
    }

    if (streakPlayer) {
      streaks[streakPlayer] = streakCount
    }
    
    return streaks
  }, [history, match.players])

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

  const scrollStatsIntoView = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() =>
        statsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    } else {
      statsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const menuInterface = (
    <>
      {!menuOpened && (
        <Box
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 2100,
          }}
        >
          <Burger
            opened={false}
            onClick={toggleMenu}
            aria-label={t.menu.openLabel}
            aria-pressed={menuOpened}
            size="sm"
          />
        </Box>
      )}
      <Drawer
        opened={menuOpened}
        onClose={closeMenu}
        position="left"
        size="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        padding="md"
        withCloseButton={false}
      >
        {menuOpened && (
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text fw={600}>{t.menu.title}</Text>
              <CloseButton aria-label={t.menu.closeLabel} onClick={closeMenu} />
            </Group>
            <Stack gap="xs">
              {([
                ['score', t.menu.scoreSection],
                ['settings', t.menu.settingsSection],
                ['history', t.menu.historySection],
                ['coach', t.menu.coachSection],
              ] as const).map(([section, label]) => (
                <Button
                  key={section}
                  fullWidth
                  variant={menuSection === section ? 'filled' : 'light'}
                  onClick={() => selectSection(section, true)}
                >
                  {label}
                </Button>
              ))}
            </Stack>
          </Stack>
        )}
      </Drawer>
    </>
  )

  if (simpleScoreMode) {
    return (
      <ProfilerWrapper id="App-SimpleScoreMode">
        {menuInterface}
        <AnnouncerRegion />
        <Box
          style={{ minHeight: '100vh', backgroundColor: pageBg, paddingInline: '0.5rem', maxWidth: '100vw', overflow: 'hidden' }}
        >
          <Container size="md" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem', maxWidth: '100%' }}>
            <Suspense fallback={<SimpleScoreViewSkeleton cardBg={cardBg} />}>
              <ProfilerWrapper id="SimpleScoreView">
                <SimpleScoreView
                  players={match.players}
                  cardBg={cardBg}
                  mutedText={mutedText}
                  matchIsLive={matchIsLive}
                  onPointChange={handlePointChange}
                  onExit={() => setSimpleScoreMode(false)}
                  t={t}
                  reducedMotion={prefersReducedMotion}
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
      {menuInterface}
      <AnnouncerRegion />
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
        t={t}
      />
      {/* Heartbeat red pulse overlay for critical points */}
      {isCriticalPoint && !prefersReducedMotion && (
        <>
          <style>
            {`
              @keyframes heartbeatScreenPulse {
                0%, 100% {
                  opacity: 0;
                }
                50% {
                  opacity: 1;
                }
              }
            `}
          </style>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 0, 0, 0.15)',
              pointerEvents: 'none',
              zIndex: 9998,
              animation: 'heartbeatScreenPulse 1s ease-in-out infinite',
            }}
          />
        </>
      )}
      <Box
        style={{ minHeight: '100vh', backgroundColor: pageBg, paddingInline: '0.5rem', maxWidth: '100vw', overflow: 'hidden' }}
      >
        <Container size="lg" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem', maxWidth: '100%' }}>
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
            {menuSection === 'score' && (
                <Stack gap="lg">
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
                      winningStreaks={winningStreaks}
                      favoritePlayerIds={match.favoritePlayerIds ?? []}
                      onNameChange={handleNameChange}
                      onPointChange={handlePointChange}
                      onApplySavedName={handleApplySavedName}
                      onSaveName={handleSavePlayerName}
                      onTeammateNameChange={handleTeammateNameChange}
                      onSaveTeammateName={handleSaveTeammateName}
                      onSwapTeammates={handleSwapTeammates}
                      onToggleFavorite={handleToggleFavoritePlayer}
                      t={t}
                    />
                  </ProfilerWrapper>

                  {match.doublesMode && (
                    <Suspense fallback={<DoublesCourtSkeleton cardBg={cardBg} />}>
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

                  <Suspense fallback={<MatchInsightsSkeleton cardBg={cardBg} />}>
                    <ProfilerWrapper id="MatchInsightsCard-Main">
                      <MatchInsightsCard
                        cardBg={cardBg}
                        mutedText={mutedText}
                        match={match}
                        gamesNeeded={gamesNeeded}
                        matchIsLive={matchIsLive}
                        elapsedMs={displayElapsedMs}
                        clockRunning={match.clockRunning}
                        onToggleClock={handleClockToggle}
                        t={t}
                      />
                    </ProfilerWrapper>
                  </Suspense>
                </Stack>
              )}

            {menuSection === 'settings' && (
                <Stack gap="lg">
                  <MatchSettingsCard
                    cardBg={cardBg}
                    mutedText={mutedText}
                    match={match}
                    onRaceToChange={handleRaceToChange}
                    onBestOfChange={handleBestOfChange}
                    onWinByTwoToggle={handleWinByTwoToggle}
                    onDoublesToggle={handleDoublesModeToggle}
                    t={t}
                  />
                  <MatchControlsCard
                    cardBg={cardBg}
                    onSwapEnds={handleSwapEnds}
                    onToggleServer={handleServerToggle}
                    onResetGame={handleResetGame}
                    onResetMatch={handleResetMatch}
                    t={t}
                  />
                  <AppSettingsCard
                    cardBg={cardBg}
                    mutedText={mutedText}
                    soundEnabled={soundEnabled}
                    hapticEnabled={hapticEnabled}
                    onSoundToggle={handleSoundToggle}
                    onHapticToggle={handleHapticToggle}
                    onShowOnboarding={openOnboarding}
                    t={t}
                  />
                  <DataManagementCard
                    cardBg={cardBg}
                    mutedText={mutedText}
                    t={t}
                  />
                </Stack>
              )}

            {menuSection === 'history' && (
                <Stack gap="lg">
                  <Suspense fallback={<GameHistorySkeleton cardBg={cardBg} />}>
                    <GameHistoryCard
                      cardBg={cardBg}
                      mutedText={mutedText}
                      games={match.completedGames}
                      onClearHistory={handleClearHistory}
                      onShowStats={scrollStatsIntoView}
                      t={t}
                    />
                  </Suspense>
                  <div ref={statsSectionRef}>
                    <Suspense fallback={<MatchStatsSkeleton cardBg={cardBg} />}>
                      <MatchStatsPanel
                        cardBg={cardBg}
                        mutedText={mutedText}
                        matchHistory={completedMatches}
                        onExit={() => selectSection('score')}
                        t={t}
                      />
                    </Suspense>
                  </div>
                </Stack>
              )}

            {menuSection === 'coach' && (
                <Stack gap="lg">
                  <CoachScoreEntryCard
                    players={match.players}
                    cardBg={cardBg}
                    mutedText={mutedText}
                    savedNames={match.savedNames}
                    onSetScores={handleSetScores}
                    onNameChange={handleNameChange}
                    onSaveName={handleSavePlayerName}
                    onApplySavedName={handleApplySavedName}
                    t={t}
                  />
                </Stack>
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
      <VictoryCelebration
        show={showVictoryCelebration}
        winnerName={celebrationWinnerName}
        onComplete={handleCelebrationComplete}
      />
    </ProfilerWrapper>
  )
}

export default App
