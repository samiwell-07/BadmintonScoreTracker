import { Button, Card, SimpleGrid, Stack, Text } from '@mantine/core'
import type { PlayerId, PlayerState } from '../types/match'
import type { Translations } from '../i18n/translations'
import { AnimatedScore } from './AnimatedScore'
import { useDeviceDetect } from '../hooks/useDeviceDetect'

interface SimpleScoreViewProps {
  players: PlayerState[]
  cardBg: string
  mutedText: string
  matchIsLive: boolean
  onPointChange: (playerId: PlayerId, delta: number) => void
  onExit: () => void
  t: Translations
  reducedMotion?: boolean
}

export const SimpleScoreView = ({
  players,
  cardBg,
  mutedText,
  matchIsLive,
  onPointChange,
  onExit,
  t,
  reducedMotion = false,
}: SimpleScoreViewProps) => {
  const { isLandscape, screenSize } = useDeviceDetect()
  
  // In landscape, always use side-by-side layout
  const useLandscapeLayout = isLandscape || screenSize !== 'small'
  
  return (
  <Stack gap="lg" align="center" w="100%" style={{ maxWidth: '100%' }}>
    <Button size="sm" color="teal" onClick={onExit}>
      {t.common.showFullView}
    </Button>
    <SimpleGrid 
      cols={useLandscapeLayout ? 2 : 1} 
      spacing="lg" 
      w="100%" 
      style={{ maxWidth: '100%' }}
    >
      {players.map((player) => (
        <Card
          key={player.id}
          radius="lg"
          withBorder
          shadow="lg"
          p={0}
          style={{
            backgroundColor: cardBg,
            maxWidth: '100%',
            overflow: 'hidden',
            cursor: matchIsLive ? 'pointer' : 'default',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            minHeight: isLandscape ? '40vh' : '200px',
          }}
          onClick={() => matchIsLive && onPointChange(player.id, 1)}
          onKeyDown={(e) => {
            if (matchIsLive && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              onPointChange(player.id, 1)
            }
          }}
          tabIndex={matchIsLive ? 0 : -1}
          role="button"
          aria-label={`Add point to ${player.name}`}
          className={matchIsLive ? 'tap-to-score' : ''}
        >
          <Stack
            gap="sm"
            align="center"
            justify="center"
            style={{ maxWidth: '100%', height: '100%', padding: 'clamp(1rem, 4vw, 2rem)' }}
          >
            <Text
              size="xl"
              fw={700}
              style={{
                maxWidth: '100%',
                textAlign: 'center',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {player.name}
            </Text>
            <AnimatedScore
              value={player.points}
              style={{ 
                fontSize: isLandscape ? 'clamp(4rem, 15vw, 10rem)' : 'clamp(4rem, 20vw, 8rem)', 
                lineHeight: 1, 
                fontWeight: 700 
              }}
              reducedMotion={reducedMotion}
            />
            <Text size="sm" c={mutedText} ta="center">
              {matchIsLive ? t.simpleScore.tapToScore : t.simpleScore.hint}
            </Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  </Stack>
  )
}
