import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Scoreboard } from '../scoreboard/Scoreboard'
import { createFreshMatchState, MATCH_STATE_STORAGE_KEY } from '../scoreboard/matchState'
import { dismissTutorial, TUTORIAL_STORAGE_KEY } from './tutorialPersistence'

const setPanelBounds = (
  element: HTMLElement,
  left: number,
  right: number,
) => {
  element.getBoundingClientRect = () =>
    ({
      bottom: 800,
      height: 800,
      left,
      right,
      top: 0,
      width: right - left,
      x: left,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect
}

const swipe = (
  element: HTMLElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) => {
  fireEvent.pointerDown(element, {
    button: 0,
    clientX: startX,
    clientY: startY,
    isPrimary: true,
    pointerId: 1,
    pointerType: 'touch',
  })
  fireEvent.pointerMove(element, {
    clientX: endX,
    clientY: endY,
    isPrimary: true,
    pointerId: 1,
    pointerType: 'touch',
  })
  fireEvent.pointerUp(element, {
    clientX: endX,
    clientY: endY,
    isPrimary: true,
    pointerId: 1,
    pointerType: 'touch',
  })
}

const advanceToSwapStep = async () => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Start tutorial' }))
  await user.click(
    screen.getByRole('button', { name: 'Add a point to Left Team' }),
  )

  const leftPanel = document.querySelector<HTMLElement>(
    '[data-tutorial-id="side-left"]',
  )!
  const rightPanel = document.querySelector<HTMLElement>(
    '[data-tutorial-id="side-right"]',
  )!
  setPanelBounds(leftPanel, 0, 500)
  setPanelBounds(rightPanel, 500, 1000)
  swipe(leftPanel, 200, 100, 200, 700)
  fireEvent.click(
    screen.getByRole('button', { name: 'Add a point to Left Team' }),
  )
  swipe(rightPanel, 800, 300, 300, 310)
  fireEvent.click(
    screen.getByRole('button', { name: 'Add a point to Right Team' }),
  )
  await user.click(screen.getByRole('button', { name: 'Left Team' }))
  await user.click(screen.getByRole('button', { name: 'Open center menu' }))
  return user
}

describe('interactive tutorial', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('offers once and Skip all prevents another automatic offer', async () => {
    const user = userEvent.setup()
    const firstRender = render(<Scoreboard />)

    expect(
      screen.getByRole('dialog', { name: 'Learn the score tracker' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Skip all' }))
    expect(screen.queryByText('Learn the score tracker')).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(TUTORIAL_STORAGE_KEY)!)).toEqual({
      dismissed: true,
      version: 1,
    })

    firstRender.unmount()
    render(<Scoreboard />)
    expect(screen.queryByText('Learn the score tracker')).not.toBeInTheDocument()
  })

  it('restores the exact real match when Skip all exits practice', async () => {
    const user = userEvent.setup()
    const realMatch = createFreshMatchState()
    realMatch.sides.left.name = 'Real Team'
    realMatch.sides.left.score = 7
    localStorage.setItem(MATCH_STATE_STORAGE_KEY, JSON.stringify(realMatch))
    render(<Scoreboard />)

    await user.click(screen.getByRole('button', { name: 'Start tutorial' }))
    expect(screen.getByLabelText('Left Team score')).toHaveTextContent('0')
    await user.click(
      screen.getByRole('button', { name: 'Add a point to Left Team' }),
    )
    expect(screen.getByText('Remove a point')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Skip all' }))

    expect(screen.getByRole('button', { name: 'Real Team' })).toBeInTheDocument()
    expect(screen.getByLabelText('Real Team score')).toHaveTextContent('7')
    expect(JSON.parse(localStorage.getItem(MATCH_STATE_STORAGE_KEY)!)).toEqual(
      realMatch,
    )
  })

  it('blocks every production target except the current highlight', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Start tutorial' }))

    await user.click(
      screen.getByRole('button', { name: 'Add a point to Right Team' }),
    )

    expect(screen.getByLabelText('Right Team score')).toHaveTextContent('0')
    expect(screen.getByRole('heading', { name: 'Tap to score' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skip all' })).toBeEnabled()
  })

  it('does not score or finish the game when a swipe step is tapped', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Start tutorial' }))
    await user.click(
      screen.getByRole('button', { name: 'Add a point to Left Team' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Add a point to Left Team' }),
    )

    expect(screen.getByLabelText('Left Team score')).toHaveTextContent('1')
    expect(screen.getByLabelText('Right Team score')).toHaveTextContent('1')
    expect(
      screen.getByRole('heading', { name: 'Remove a point' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Set 1 winner')).not.toBeInTheDocument()
  })

  it('replays from General settings after dismissal', async () => {
    const user = userEvent.setup()
    dismissTutorial()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    await user.click(screen.getByRole('tab', { name: 'General settings' }))

    await user.click(screen.getByRole('button', { name: 'Tutorial' }))

    expect(screen.getByText('Tap to score')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skip all' })).toBeInTheDocument()
  })

  it('goes Back to a deterministic fixture and confirms Escape exit', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Start tutorial' }))
    await user.click(
      screen.getByRole('button', { name: 'Add a point to Left Team' }),
    )
    expect(screen.getByText('Remove a point')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Tap to score')).toBeInTheDocument()
    expect(screen.getByLabelText('Left Team score')).toHaveTextContent('0')

    await user.keyboard('{Escape}')
    expect(
      screen.getByRole('alertdialog', { name: 'Exit tutorial?' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Keep learning' }))
    expect(screen.getByText('Tap to score')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    const exitDialog = screen.getByRole('alertdialog', {
      name: 'Exit tutorial?',
    })
    await user.click(
      exitDialog.querySelector<HTMLButtonElement>('.dialog-button--danger')!,
    )
    expect(screen.queryByText('Tap to score')).not.toBeInTheDocument()
  })

  it('keeps the highlighted center action mounted when other controls are pressed', async () => {
    render(<Scoreboard />)
    const user = await advanceToSwapStep()

    expect(
      screen.getByRole('heading', { name: 'Swap sides' }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', {
        name: 'Close center menu',
        expanded: true,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Dismiss center menu' }))
    await user.click(screen.getByRole('button', { name: 'Reset match' }))

    expect(
      screen.getByRole('heading', { name: 'Swap sides' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Swap teams' })).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog', { name: 'Reset match?' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Swap teams' }))
    expect(screen.getByText('Reset control')).toBeInTheDocument()
  })

  it('requires and completes the selected production actions in order', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    const context = {
      beginPath: vi.fn(),
      closePath: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      lineTo: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      moveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      stroke: vi.fn(),
      set fillStyle(_value: string) {},
      set font(_value: string) {},
      set lineCap(_value: CanvasLineCap) {},
      set lineJoin(_value: CanvasLineJoin) {},
      set lineWidth(_value: number) {},
      set strokeStyle(_value: string) {},
      set textAlign(_value: CanvasTextAlign) {},
      set textBaseline(_value: CanvasTextBaseline) {},
    } as unknown as CanvasRenderingContext2D
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
      (callback) => callback(new Blob(['png'], { type: 'image/png' })),
    )
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Start tutorial' }))

    await user.click(screen.getByRole('button', { name: 'Add a point to Left Team' }))
    const leftPanel = document.querySelector<HTMLElement>('[data-tutorial-id="side-left"]')!
    const rightPanel = document.querySelector<HTMLElement>('[data-tutorial-id="side-right"]')!
    setPanelBounds(leftPanel, 0, 500)
    setPanelBounds(rightPanel, 500, 1000)
    swipe(leftPanel, 200, 100, 200, 700)
    fireEvent.click(screen.getByRole('button', { name: 'Add a point to Left Team' }))
    swipe(rightPanel, 800, 300, 300, 310)
    fireEvent.click(screen.getByRole('button', { name: 'Add a point to Right Team' }))

    await user.click(screen.getByRole('button', { name: 'Left Team' }))
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Swap teams' }))
    await user.click(screen.getByRole('button', { name: 'Reset match' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    expect(
      screen.getByRole('heading', { name: 'Choose the serving side' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Select Alex of Left Team' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Select Left Team to serve' }))
    expect(
      screen.getByRole('heading', { name: 'Two-player service' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(screen.getByRole('button', { name: 'Select Alex of Left Team' }))
    await user.click(screen.getByRole('button', { name: 'Select Casey of Right Team' }))
    await user.click(screen.getByRole('button', { name: 'Select Blake of Left Team' }))

    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Open set history' }))
    const completedSet = screen.getByRole('button', {
      name: /Set 1.*Left Team.*21 - 18/,
    })
    expect(completedSet).toBeInTheDocument()
    await user.click(completedSet)
    expect(screen.getByLabelText('Left Team score')).toHaveTextContent('21')
    expect(screen.getByLabelText('Right Team score')).toHaveTextContent('18')
    await user.click(screen.getByRole('button', { name: 'Back to live match' }))

    expect(
      screen.getByRole('heading', { name: 'Game finished' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Copy text, Share image, Undo winning point, and Next game appear/),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Copy text' }))
    await user.click(screen.getByRole('button', { name: 'Share image' }))
    await user.click(screen.getByRole('button', { name: 'Undo winning point' }))
    expect(
      screen.getByRole('heading', { name: 'Game finished' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next game' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next game' }))

    expect(
      screen.getByRole('heading', { name: 'Replay anytime' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Settings, General settings, then Tutorial/),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Finish' }))

    expect(screen.queryByText(/Step \d+ of/)).not.toBeInTheDocument()
    expect(screen.queryByText('Learn the score tracker')).not.toBeInTheDocument()
  })
})