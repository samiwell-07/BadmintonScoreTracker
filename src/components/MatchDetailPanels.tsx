import { memo, lazy, Suspense, useState } from 'react'
import type { CompletedMatchSummary, MatchState } from '../types/match'
import type { Translations } from '../i18n/translations'
import { MatchSettingsCard } from './MatchSettingsCard'
import { MatchControlsCard } from './MatchControlsCard'
import { MatchStatsPanel } from './MatchStatsPanel'

const MatchInsightsCardLazy = lazy(() =>
  import('./MatchInsightsCard').then(({ MatchInsightsCard }) => ({
    default: MatchInsightsCard,
  })),
)

const GameHistoryCardLazy = lazy(() =>
  import('./GameHistoryCard').then(({ GameHistoryCard }) => ({
    default: GameHistoryCard,
  })),
)

interface MatchDetailPanelsProps {
  cardBg: string
  mutedText: string
  match: MatchState
  gamesNeeded: number
  matchIsLive: boolean
  elapsedMs: number
  completedMatches: CompletedMatchSummary[]
  onRaceToChange: (value: number) => void
  onBestOfChange: (bestOf: MatchState['bestOf']) => void
  onWinByTwoToggle: (checked: boolean) => void
  onDoublesToggle: (checked: boolean) => void
  onSwapEnds: () => void
  onToggleServer: () => void
  onResetGame: () => void
  onResetMatch: () => void
  onToggleClock: () => void
  onClearHistory: () => void
  t: Translations
}

const MatchDetailPanelsComponent = ({
  cardBg,
  mutedText,
  match,
  gamesNeeded,
  matchIsLive,
  elapsedMs,
  completedMatches,
  onRaceToChange,
  onBestOfChange,
  onWinByTwoToggle,
  onDoublesToggle,
  onSwapEnds,
  onToggleServer,
  onResetGame,
  onResetMatch,
  onToggleClock,
  onClearHistory,
  t,
}: MatchDetailPanelsProps) => {
  const [statsMode, setStatsMode] = useState(false)

  if (statsMode) {
    return (
      <MatchStatsPanel
        cardBg={cardBg}
        mutedText={mutedText}
        matchHistory={completedMatches}
        onExit={() => setStatsMode(false)}
        t={t}
      />
    )
  }

  return (
    <>
      <MatchSettingsCard
        cardBg={cardBg}
        mutedText={mutedText}
        match={match}
        onRaceToChange={onRaceToChange}
        onBestOfChange={onBestOfChange}
        onWinByTwoToggle={onWinByTwoToggle}
        onDoublesToggle={onDoublesToggle}
        t={t}
      />

      <MatchControlsCard
        cardBg={cardBg}
        onSwapEnds={onSwapEnds}
        onToggleServer={onToggleServer}
        onResetGame={onResetGame}
        onResetMatch={onResetMatch}
        t={t}
      />

      <Suspense fallback={null}>
        <MatchInsightsCardLazy
          cardBg={cardBg}
          mutedText={mutedText}
          match={match}
          gamesNeeded={gamesNeeded}
          matchIsLive={matchIsLive}
          elapsedMs={elapsedMs}
          clockRunning={match.clockRunning}
          onToggleClock={onToggleClock}
          t={t}
        />
      </Suspense>

      <Suspense fallback={null}>
        <GameHistoryCardLazy
          cardBg={cardBg}
          mutedText={mutedText}
          games={match.completedGames}
          tags={match.tags}
          notes={match.notes ?? []}
          onClearHistory={onClearHistory}
          onShowStats={() => setStatsMode(true)}
          t={t}
        />
      </Suspense>
    </>
  )
}

export const MatchDetailPanels = memo(MatchDetailPanelsComponent)
MatchDetailPanels.displayName = 'MatchDetailPanels'
