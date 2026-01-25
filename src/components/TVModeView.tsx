import { Box, Button, Group, Text, Badge } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import type { PlayerId, PlayerState } from '../types/match'
import type { Translations } from '../i18n/translations'
import { AnimatedScore } from './AnimatedScore'
import { didWinGame, type MatchConfig } from '../utils/match'

interface TVModeViewProps {
  players: PlayerState[]
  server: PlayerId
  gamesNeeded: number
  matchConfig: MatchConfig
  matchIsLive: boolean
  matchWinner: PlayerId | null
  onPointChange: (playerId: PlayerId, delta: number) => void
  onExit: () => void
  t: Translations
  reducedMotion?: boolean
}

const isGamePointFor = (player: PlayerState, opponent: PlayerState, config: MatchConfig): boolean => {
  // Player is at game point if winning one more point would win the game
  return didWinGame(player.points + 1, opponent.points, config) && !didWinGame(player.points, opponent.points, config)
}

const isMatchPointFor = (player: PlayerState, opponent: PlayerState, gamesNeeded: number, config: MatchConfig): boolean => {
  // Match point = game point AND winning this game would win the match
  return isGamePointFor(player, opponent, config) && player.games === gamesNeeded - 1
}

export const TVModeView = ({
  players,
  server,
  gamesNeeded,
  matchConfig,
  matchIsLive,
  matchWinner,
  onPointChange,
  onExit,
  reducedMotion = false,
}: TVModeViewProps) => {
  const playerA = players.find((p) => p.id === 'playerA')!
  const playerB = players.find((p) => p.id === 'playerB')!

  const getPlayerStatus = (player: PlayerState, opponent: PlayerState) => {
    if (matchWinner === player.id) return 'winner'
    if (isMatchPointFor(player, opponent, gamesNeeded, matchConfig)) return 'matchPoint'
    if (isGamePointFor(player, opponent, matchConfig)) return 'gamePoint'
    return null
  }

  const statusA = getPlayerStatus(playerA, playerB)
  const statusB = getPlayerStatus(playerB, playerA)

  return (
    <Box
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Exit button */}
      <Box style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10000 }}>
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          onClick={onExit}
          leftSection={<IconX size={16} />}
        >
          Exit TV Mode
        </Button>
      </Box>

      {/* Live indicator */}
      {matchIsLive && (
        <Box style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10000 }}>
          <Badge color="red" size="lg" variant="filled" style={{ animation: 'pulse 2s infinite' }}>
            ● LIVE
          </Badge>
        </Box>
      )}

      {/* Main scoreboard */}
      <Group
        grow
        gap={0}
        style={{
          flex: 1,
          alignItems: 'stretch',
        }}
      >
        {/* Player A */}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: statusA === 'winner' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
            cursor: matchIsLive ? 'pointer' : 'default',
            transition: 'background-color 0.2s',
          }}
          onClick={() => matchIsLive && onPointChange('playerA', 1)}
        >
          <Text
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {playerA.name}
          </Text>
          
          {server === 'playerA' && (
            <Badge color="yellow" size="xl" mb="md">● SERVING</Badge>
          )}
          
          <AnimatedScore
            value={playerA.points}
            style={{
              fontSize: 'clamp(8rem, 25vw, 20rem)',
              fontWeight: 800,
              lineHeight: 1,
              color: statusA === 'winner' ? '#22c55e' : '#fff',
            }}
            reducedMotion={reducedMotion}
          />
          
          <Text style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', marginTop: '1rem', opacity: 0.7 }}>
            Games: {playerA.games}
          </Text>
          
          {statusA && statusA !== 'winner' && (
            <Badge
              color={statusA === 'matchPoint' ? 'red' : 'orange'}
              size="xl"
              mt="md"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}
            >
              {statusA === 'matchPoint' ? 'MATCH POINT' : 'GAME POINT'}
            </Badge>
          )}
          
          {statusA === 'winner' && (
            <Badge color="green" size="xl" mt="md" style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>
              🏆 WINNER
            </Badge>
          )}
        </Box>

        {/* Divider */}
        <Box
          style={{
            width: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            alignSelf: 'stretch',
          }}
        />

        {/* Player B */}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: statusB === 'winner' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
            cursor: matchIsLive ? 'pointer' : 'default',
            transition: 'background-color 0.2s',
          }}
          onClick={() => matchIsLive && onPointChange('playerB', 1)}
        >
          <Text
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {playerB.name}
          </Text>
          
          {server === 'playerB' && (
            <Badge color="yellow" size="xl" mb="md">● SERVING</Badge>
          )}
          
          <AnimatedScore
            value={playerB.points}
            style={{
              fontSize: 'clamp(8rem, 25vw, 20rem)',
              fontWeight: 800,
              lineHeight: 1,
              color: statusB === 'winner' ? '#22c55e' : '#fff',
            }}
            reducedMotion={reducedMotion}
          />
          
          <Text style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', marginTop: '1rem', opacity: 0.7 }}>
            Games: {playerB.games}
          </Text>
          
          {statusB && statusB !== 'winner' && (
            <Badge
              color={statusB === 'matchPoint' ? 'red' : 'orange'}
              size="xl"
              mt="md"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}
            >
              {statusB === 'matchPoint' ? 'MATCH POINT' : 'GAME POINT'}
            </Badge>
          )}
          
          {statusB === 'winner' && (
            <Badge color="green" size="xl" mt="md" style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>
              🏆 WINNER
            </Badge>
          )}
        </Box>
      </Group>

      {/* Bottom info bar */}
      <Box
        style={{
          padding: '1rem 2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
        }}
      >
        <Text style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', opacity: 0.7 }}>
          Race to {matchConfig.raceTo} • First to {gamesNeeded} games
        </Text>
      </Box>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  )
}
