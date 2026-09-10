import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GameResultDialog } from './GameResultDialog'

const sharingMocks = vi.hoisted(() => ({
  copyResultText: vi.fn(),
  createResultImage: vi.fn(),
  formatResultText: vi.fn(() => 'Narrative result'),
  shareResultImage: vi.fn(),
}))

vi.mock('./resultSharing', () => sharingMocks)

const completedSet = {
  setNumber: 1,
  leftName: 'Falcons',
  rightName: 'Rockets',
  leftScore: 21,
  rightScore: 12,
  winner: 'left' as const,
  rules: {
    pointsToWin: 21,
    winByTwo: true,
    maximumScore: 30,
    gamesToWin: 2,
  },
}

const callbacks = {
  onCloseMatch: vi.fn(),
  onNewMatch: vi.fn(),
  onNextGame: vi.fn(),
  onUndoWinningPoint: vi.fn(),
}

describe('GameResultDialog sharing', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('renders two share controls in their own row and preserves result actions', () => {
    render(
      <GameResultDialog
        {...callbacks}
        completedSet={completedSet}
        completedSets={[completedSet]}
        leftSetsWon={1}
        phase="gameWon"
        rightSetsWon={0}
      />,
    )

    const shareRow = document.querySelector('.scoreboard-dialog__share-actions')
    expect(shareRow).toContainElement(
      screen.getByRole('button', { name: 'Copy text' }),
    )
    expect(shareRow).toContainElement(
      screen.getByRole('button', { name: 'Share image' }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Next game' }))
    expect(callbacks.onNextGame).toHaveBeenCalledOnce()
  })

  it('copies the dynamic narrative and resets its success label', async () => {
    vi.useFakeTimers()
    sharingMocks.copyResultText.mockResolvedValue(undefined)
    render(
      <GameResultDialog
        {...callbacks}
        completedSet={completedSet}
        completedSets={[completedSet]}
        leftSetsWon={1}
        phase="gameWon"
        rightSetsWon={0}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy text' }))
    expect(screen.getByRole('button', { name: 'Copying...' })).toBeDisabled()
    await act(async () => Promise.resolve())

    expect(sharingMocks.formatResultText).toHaveBeenCalledWith(
      expect.objectContaining({ completedSet, leftSetsWon: 1, rightSetsWon: 0 }),
    )
    expect(sharingMocks.copyResultText).toHaveBeenCalledWith('Narrative result')
    expect(screen.getByRole('button', { name: 'Copied' })).toBeEnabled()

    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByRole('button', { name: 'Copy text' })).toBeInTheDocument()
  })

  it.each([
    ['shared', 'Shared'],
    ['downloaded', 'Downloaded'],
    ['cancelled', 'Cancelled'],
  ] as const)('shows the %s image outcome', async (outcome, label) => {
    const blob = new Blob(['png'], { type: 'image/png' })
    sharingMocks.createResultImage.mockResolvedValue(blob)
    sharingMocks.shareResultImage.mockResolvedValue(outcome)
    render(
      <GameResultDialog
        {...callbacks}
        completedSet={completedSet}
        completedSets={[completedSet]}
        leftSetsWon={2}
        phase="matchWon"
        rightSetsWon={1}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Share image' }))
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled()
    await act(async () => Promise.resolve())

    expect(sharingMocks.createResultImage).toHaveBeenCalledWith(
      expect.objectContaining({
        completedSets: [completedSet],
        phase: 'matchWon',
      }),
    )
    expect(sharingMocks.shareResultImage).toHaveBeenCalledWith(
      blob,
      expect.objectContaining({ leftSetsWon: 2, rightSetsWon: 1 }),
    )
    expect(screen.getByRole('button', { name: label })).toBeEnabled()
  })
})