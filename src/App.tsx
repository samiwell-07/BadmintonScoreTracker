import { Box, Container, SimpleGrid, Stack } from '@mantine/core'
import { MatchHeader } from './components/MatchHeader'
import { PlayerScoreCard } from './components/PlayerScoreCard'
import { MatchSettingsCard } from './components/MatchSettingsCard'
import { MatchControlsCard } from './components/MatchControlsCard'
import { MatchInsightsCard } from './components/MatchInsightsCard'
import { useMatchController } from './hooks/useMatchController'
import { useThemeColors } from './hooks/useThemeColors'
import type { MatchState } from './types/match'
import type { MatchConfig } from './utils/match'

function App() {
  const { match, history, gamesNeeded, matchIsLive, actions } = useMatchController()
  const { colorScheme, pageBg, cardBg, mutedText, toggleColorMode } = useThemeColors()
  const {
    handleNameChange,
    handlePointChange,
    handleUndo,
    handleResetGame,
    handleResetMatch,
    handleSwapEnds,
    handleServerToggle,
    pushUpdate,
  } = actions

  const matchConfig: MatchConfig = {
    raceTo: match.raceTo,
    maxPoint: match.maxPoint,
    winByTwo: match.winByTwo,
  }

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
          <MatchHeader
            cardBg={cardBg}
            mutedText={mutedText}
            onUndo={handleUndo}
            onToggleColorMode={toggleColorMode}
            colorScheme={colorScheme}
            canUndo={history.length > 0}
          />

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {match.players.map((player, index) => {
              const opponent = match.players[(index + 1) % match.players.length]
              const isServer = match.server === player.id

              return (
                <PlayerScoreCard
                  key={`${player.id}-${player.name}`}
                  player={player}
                  opponent={opponent}
                  cardBg={cardBg}
                  mutedText={mutedText}
                  isServer={isServer}
                  matchWinner={match.matchWinner}
                  gamesNeeded={gamesNeeded}
                  matchConfig={matchConfig}
                  matchIsLive={matchIsLive}
                  onNameChange={handleNameChange}
                  onPointChange={handlePointChange}
                />
              )
            })}
          </SimpleGrid>

          <MatchSettingsCard
            cardBg={cardBg}
            mutedText={mutedText}
            match={match}
            onRaceToChange={handleRaceToChange}
            onBestOfChange={handleBestOfChange}
            onWinByTwoToggle={handleWinByTwoToggle}
          />

          <MatchControlsCard
            cardBg={cardBg}
            onSwapEnds={handleSwapEnds}
            onToggleServer={handleServerToggle}
            onResetGame={handleResetGame}
            onResetMatch={handleResetMatch}
          />

          <MatchInsightsCard
            cardBg={cardBg}
            match={match}
            gamesNeeded={gamesNeeded}
            matchIsLive={matchIsLive}
          />
        </Stack>
      </Container>
    </Box>
  )
}

export default App
