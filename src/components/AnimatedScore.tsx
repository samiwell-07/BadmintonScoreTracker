import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { Title } from '@mantine/core'

interface AnimatedScoreProps {
  value: number
  style?: CSSProperties
  reducedMotion?: boolean
}

export const AnimatedScore = ({ value, style, reducedMotion = false }: AnimatedScoreProps) => {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const prevValue = useRef(value)

  useEffect(() => {
    if (value !== prevValue.current) {
      if (reducedMotion) {
        // No animation, just update
        setDisplayValue(value)
      } else {
        // Animate
        setDirection(value > prevValue.current ? 'up' : 'down')
        setIsAnimating(true)

        // After exit animation, update value and enter
        const exitTimer = setTimeout(() => {
          setDisplayValue(value)
        }, 100)

        // Complete animation
        const completeTimer = setTimeout(() => {
          setIsAnimating(false)
        }, 200)

        prevValue.current = value

        return () => {
          clearTimeout(exitTimer)
          clearTimeout(completeTimer)
        }
      }
      prevValue.current = value
    }
  }, [value, reducedMotion])

  const animationStyle: CSSProperties = reducedMotion
    ? {}
    : {
        transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
        transform: isAnimating
          ? direction === 'up'
            ? 'translateY(-8px)'
            : 'translateY(8px)'
          : 'translateY(0)',
        opacity: isAnimating ? 0.7 : 1,
      }

  return (
    <Title
      order={1}
      style={{
        ...style,
        ...animationStyle,
        display: 'inline-block',
      }}
    >
      {displayValue}
    </Title>
  )
}
