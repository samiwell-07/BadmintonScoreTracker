import { fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TutorialOverlay } from './TutorialOverlay'
import type { TutorialStep } from './tutorialState'

const step: TutorialStep = {
  action: 'service',
  cue: 'tap',
  description: 'Choose service.',
  target: '[data-tutorial-id="moving-target"]',
  title: 'Choose service',
}

const createRect = (left: number, top: number): DOMRect =>
  ({
    bottom: top + 40,
    height: 40,
    left,
    right: left + 40,
    top,
    width: 40,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect

describe('TutorialOverlay', () => {
  afterEach(() => {
    document.querySelector('[data-tutorial-id="moving-target"]')?.remove()
    document.querySelector('[data-tutorial-id="cue-target"]')?.remove()
    document.querySelector('[data-tutorial-id="spotlight-target"]')?.remove()
  })

  it('follows the highlighted target while it transitions into position', async () => {
    Element.prototype.scrollIntoView = vi.fn()
    let targetRect = createRect(100, 0)
    const target = document.createElement('button')
    target.dataset.tutorialId = 'moving-target'
    target.getBoundingClientRect = () => targetRect
    document.body.append(target)

    const { container } = render(
      <TutorialOverlay
        step={step}
        stepIndex={10}
        totalSteps={20}
        onBack={vi.fn()}
        onFinish={vi.fn()}
        onRequestExit={vi.fn()}
        onSkipAll={vi.fn()}
      />,
    )

    await waitFor(() =>
      expect(
        container.querySelector('.tutorial-overlay__spotlight'),
      ).toHaveStyle({ left: '92px' }),
    )

    targetRect = createRect(220, 120)
    fireEvent(target, new Event('transitionrun', { bubbles: true }))

    await waitFor(() =>
      expect(
        container.querySelector('.tutorial-overlay__spotlight'),
      ).toHaveStyle({ left: '212px', top: '112px' }),
    )
    expect(container.querySelector('.tutorial-hand-cue')).toHaveStyle({
      '--tutorial-cue-start-x': '240px',
      '--tutorial-cue-start-y': '140px',
    })
  })

  it('does not let target focusing scroll the scoreboard', async () => {
    const scoreboard = document.createElement('main')
    scoreboard.className = 'scoreboard'
    const target = document.createElement('button')
    target.dataset.tutorialId = 'moving-target'
    target.getBoundingClientRect = () => createRect(100, 100)
    target.scrollIntoView = vi.fn(() => {
      scoreboard.scrollTop = 32
      scoreboard.scrollLeft = 16
    })
    scoreboard.append(target)
    document.body.append(scoreboard)

    render(
      <TutorialOverlay
        step={step}
        stepIndex={10}
        totalSteps={20}
        onBack={vi.fn()}
        onFinish={vi.fn()}
        onRequestExit={vi.fn()}
        onSkipAll={vi.fn()}
      />,
    )

    await waitFor(() => expect(target.scrollIntoView).toHaveBeenCalled())
    expect(scoreboard.scrollTop).toBe(0)
    expect(scoreboard.scrollLeft).toBe(0)
    scoreboard.remove()
  })

  it('places the hand on a separate cue target without changing the spotlight', async () => {
    Element.prototype.scrollIntoView = vi.fn()
    const target = document.createElement('button')
    target.dataset.tutorialId = 'moving-target'
    target.getBoundingClientRect = () => createRect(0, 0)
    const cueTarget = document.createElement('span')
    cueTarget.dataset.tutorialId = 'cue-target'
    cueTarget.getBoundingClientRect = () => createRect(100, 60)
    document.body.append(target, cueTarget)

    const { container } = render(
      <TutorialOverlay
        step={{ ...step, cueTarget: '[data-tutorial-id="cue-target"]' }}
        stepIndex={11}
        totalSteps={20}
        onBack={vi.fn()}
        onFinish={vi.fn()}
        onRequestExit={vi.fn()}
        onSkipAll={vi.fn()}
      />,
    )

    await waitFor(() =>
      expect(
        container.querySelector('.tutorial-overlay__spotlight'),
      ).toHaveStyle({ left: '0px', top: '0px' }),
    )
    expect(container.querySelector('.tutorial-hand-cue')).toHaveStyle({
      '--tutorial-cue-start-x': '120px',
      '--tutorial-cue-start-y': '80px',
    })
  })

  it('highlights a separate overview while keeping the hand on the action', async () => {
    Element.prototype.scrollIntoView = vi.fn()
    const target = document.createElement('button')
    target.dataset.tutorialId = 'moving-target'
    target.getBoundingClientRect = () => createRect(220, 120)
    const spotlightTarget = document.createElement('section')
    spotlightTarget.dataset.tutorialId = 'spotlight-target'
    spotlightTarget.getBoundingClientRect = () => createRect(40, 20)
    document.body.append(target, spotlightTarget)

    const { container } = render(
      <TutorialOverlay
        step={{
          ...step,
          spotlightTarget: '[data-tutorial-id="spotlight-target"]',
        }}
        stepIndex={19}
        totalSteps={20}
        onBack={vi.fn()}
        onFinish={vi.fn()}
        onRequestExit={vi.fn()}
        onSkipAll={vi.fn()}
      />,
    )

    await waitFor(() =>
      expect(
        container.querySelector('.tutorial-overlay__spotlight'),
      ).toHaveStyle({ left: '32px', top: '12px' }),
    )
    expect(container.querySelector('.tutorial-hand-cue')).toHaveStyle({
      '--tutorial-cue-start-x': '240px',
      '--tutorial-cue-start-y': '140px',
    })
  })
})