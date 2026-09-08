import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  TutorialHandCue,
} from './TutorialHandCue'
import {
  getTutorialCueMotion,
  type TutorialTargetRect,
} from './tutorialCueGeometry'

const viewport = { height: 568, width: 320 }

describe('TutorialHandCue', () => {
  it('demonstrates a downward swipe across the target midpoint', () => {
    const targetRect: TutorialTargetRect = {
      top: 0,
      right: 160,
      bottom: 568,
      left: 0,
    }
    const motion = getTutorialCueMotion(
      targetRect,
      'swipe-down',
      viewport,
    )

    expect(motion.startY).toBeLessThan(284)
    expect(motion.endY).toBeGreaterThan(284)
    expect(motion.endY).toBeGreaterThan(motion.startY)
  })

  it('demonstrates both transfers across the center divider', () => {
    const leftMotion = getTutorialCueMotion(
      { top: 0, right: 320, bottom: 568, left: 160 },
      'swipe-left',
      viewport,
    )
    const rightMotion = getTutorialCueMotion(
      { top: 0, right: 160, bottom: 568, left: 0 },
      'swipe-right',
      viewport,
    )

    expect(leftMotion.startX).toBeGreaterThan(160)
    expect(leftMotion.endX).toBeLessThan(160)
    expect(rightMotion.startX).toBeLessThan(160)
    expect(rightMotion.endX).toBeGreaterThan(160)
  })

  it('keeps cue endpoints visible in a 320 by 568 viewport', () => {
    const motion = getTutorialCueMotion(
      { top: -40, right: 360, bottom: 640, left: -40 },
      'swipe-right',
      viewport,
    )

    expect(motion.startX).toBeGreaterThanOrEqual(24)
    expect(motion.endX).toBeLessThanOrEqual(296)
    expect(motion.startY).toBeGreaterThanOrEqual(24)
    expect(motion.endY).toBeLessThanOrEqual(544)
  })

  it('renders as a pointer-transparent visual aid', () => {
    const { container } = render(
      <TutorialHandCue
        cue="tap"
        targetRect={{ top: 20, right: 120, bottom: 120, left: 20 }}
      />,
    )

    const cue = container.querySelector('[data-cue="tap"]')
    expect(cue).toHaveAttribute('aria-hidden', 'true')
    expect(cue).toHaveStyle({ pointerEvents: 'none' })
    expect(container.querySelector('.lucide-pointer')).toBeInTheDocument()
  })

})