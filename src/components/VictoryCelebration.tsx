import { useEffect, useState } from 'react'
import { Box, Text, Title } from '@mantine/core'
import confetti from 'canvas-confetti'

interface VictoryCelebrationProps {
  winnerName: string
  show: boolean
  onComplete: () => void
}

export const VictoryCelebration = ({
  winnerName,
  show,
  onComplete,
}: VictoryCelebrationProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) {
      setVisible(false)
      return
    }

    setVisible(true)

    // Fire confetti from both sides
    const duration = 4000
    const animationEnd = Date.now() + duration
    const colors = ['#ffd700', '#ff6b00', '#9932cc', '#00ff88', '#00bfff']

    const frame = () => {
      // Left side burst
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
        zIndex: 10000,
      })
      
      // Right side burst
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
        zIndex: 10000,
      })

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame)
      }
    }

    // Initial big burst from center
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors,
      zIndex: 10000,
      startVelocity: 45,
      gravity: 0.8,
      scalar: 1.2,
    })

    frame()

    // Hide after animation
    const hideTimer = setTimeout(() => {
      setVisible(false)
      onComplete()
    }, duration + 1000)

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
    </Box>
  )
}
