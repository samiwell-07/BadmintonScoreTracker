import { useEffect, useState } from 'react'
import { Box, Button, Group, Text, Title } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import confetti from 'canvas-confetti'

interface VictoryCelebrationProps {
  winnerName: string
  show: boolean
  onComplete: () => void
  onRematch?: () => void
}

export const VictoryCelebration = ({
  winnerName,
  show,
  onComplete,
  onRematch,
}: VictoryCelebrationProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) {
      setVisible(false)
      return
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    setVisible(true)

    if (prefersReducedMotion) {
      // Skip confetti animation for reduced motion
      const hideTimer = setTimeout(() => {
        setVisible(false)
        onComplete()
      }, 2000)
      return () => clearTimeout(hideTimer)
    }

    // Fire confetti from both sides - optimized particle count
    const duration = 3000
    const animationEnd = Date.now() + duration
    const colors = ['#ffd700', '#ff6b00', '#9932cc', '#00ff88', '#00bfff']

    let frameCount = 0
    const frame = () => {
      frameCount++
      // Only fire every 3rd frame to reduce load
      if (frameCount % 3 === 0) {
        // Left side burst
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
          zIndex: 10000,
          disableForReducedMotion: true,
        })
        
        // Right side burst
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
          zIndex: 10000,
          disableForReducedMotion: true,
        })
      }

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame)
      }
    }

    // Initial burst from center - reduced particles
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { x: 0.5, y: 0.5 },
      colors,
      zIndex: 10000,
      startVelocity: 35,
      gravity: 1,
      scalar: 1,
      disableForReducedMotion: true,
    })

    frame()

    // Hide after animation
    const hideTimer = setTimeout(() => {
      setVisible(false)
      onComplete()
    }, duration + 500)

    return () => {
      clearTimeout(hideTimer)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={onComplete}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes victoryPulse {
          0%, 100% {
            transform: scale(1);
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4);
          }
          50% {
            transform: scale(1.05);
            text-shadow: 0 0 40px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 215, 0, 0.6);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <Text
        size="xl"
        fw={500}
        c="white"
        style={{
          animation: 'slideUp 0.5s ease-out',
          marginBottom: '1rem',
        }}
      >
        🏆 VICTORY! 🏆
      </Text>
      <Title
        order={1}
        style={{
          color: '#ffd700',
          fontSize: 'clamp(2rem, 8vw, 5rem)',
          textAlign: 'center',
          animation: 'victoryPulse 1.5s ease-in-out infinite',
          padding: '0 1rem',
        }}
      >
        {winnerName}
      </Title>
      <Text
        size="lg"
        c="dimmed"
        style={{
          animation: 'slideUp 0.7s ease-out',
          marginTop: '1.5rem',
        }}
      >
        Tap anywhere to dismiss
      </Text>
      
      {onRematch && (
        <Group mt="xl" style={{ animation: 'slideUp 0.8s ease-out' }}>
          <Button
            variant="filled"
            color="teal"
            size="lg"
            leftSection={<IconRefresh size={20} />}
            onClick={(e) => {
              e.stopPropagation()
              onRematch()
            }}
            styles={{
              root: {
                boxShadow: '0 4px 20px rgba(0, 200, 150, 0.4)',
              }
            }}
          >
            Quick Rematch
          </Button>
        </Group>
      )}
    </Box>
  )
}
