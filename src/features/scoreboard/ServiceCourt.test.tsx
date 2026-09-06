import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ServiceCourt } from './ServiceCourt'
import { createCourtViewModel } from './serviceCourtModel'
import type { ScoreSideState } from './scoreboard.types'

const sides: Record<'left' | 'right', ScoreSideState> = {
  left: {
    id: 'left',
    name: 'Left Team',
    playerNames: ['Alex', 'Blake'],
    score: 0,
  },
  right: {
    id: 'right',
    name: 'Right Team',
    playerNames: ['Casey', 'Drew'],
    score: 0,
  },
}

const model = createCourtViewModel({
  doublesService: null,
  playerMode: false,
  servingSide: 'left',
  sides,
})

const playerModel = createCourtViewModel({
  doublesService: {
    leftCourtPlayerIndexes: { left: 0, right: 1 },
    servingPlayerIndex: 1,
  },
  playerMode: true,
  servingSide: 'right',
  sides,
})

const renderCourt = ({
  canEdit = false,
  courtModel = model,
  onAssignServer = vi.fn(),
  onSwapPlayers = vi.fn(),
} = {}) => render(
  <ServiceCourt
    canEdit={canEdit}
    leftName="Left Team"
    model={courtModel}
    onAssignServer={onAssignServer}
    onSwapPlayers={onSwapPlayers}
    rightName="Right Team"
  />,
)

describe('ServiceCourt', () => {
  it('opens and closes an expanded court', async () => {
    const user = userEvent.setup()
    renderCourt()

    const miniCourt = screen.getByRole('button', {
      name: /Visual service court.*Left Team serves/,
    })
    await user.click(miniCourt)
    expect(
      screen.getByRole('dialog', { name: 'Service court' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Left Team serves from the bottom court.'))
      .toHaveClass('visually-hidden')
    expect(screen.queryByText('Left Team')).not.toBeInTheDocument()
    expect(screen.queryByText('Right Team')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close service court' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Service court' })).not.toBeInTheDocument()
    await waitFor(() => expect(miniCourt).toHaveFocus())
  })

  it('drags without opening and persists the normalized position', () => {
    renderCourt()
    const miniCourt = screen.getByRole('button', {
      name: /Visual service court/,
    })
    miniCourt.getBoundingClientRect = () =>
      ({
        bottom: 646,
        height: 70,
        left: 788,
        right: 932,
        top: 576,
        width: 144,
        x: 788,
        y: 576,
        toJSON: () => ({}),
      }) as DOMRect

    fireEvent.pointerDown(miniCourt, {
      button: 0,
      clientX: 860,
      clientY: 611,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    })
    fireEvent.pointerMove(miniCourt, {
      clientX: 760,
      clientY: 511,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    })
    fireEvent.pointerUp(miniCourt, {
      clientX: 760,
      clientY: 511,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    })
    fireEvent.click(miniCourt)

    expect(screen.queryByRole('dialog', { name: 'Service court' })).not.toBeInTheDocument()
    expect(localStorage.getItem('badminton-score-tracker:service-court-position:v1'))
      .not.toBeNull()
  })

  it('moves with arrow keys and opens with Enter', async () => {
    const user = userEvent.setup()
    renderCourt()
    const miniCourt = screen.getByRole('button', {
      name: /Visual service court/,
    })
    miniCourt.focus()

    await user.keyboard('{ArrowLeft}')
    expect(localStorage.getItem('badminton-score-tracker:service-court-position:v1'))
      .not.toBeNull()
    await user.keyboard('{Enter}')
    expect(
      screen.getByRole('dialog', { name: 'Service court' }),
    ).toBeInTheDocument()
  })

  it('selects players, swaps positions, and assigns a diagonal serve', async () => {
    const user = userEvent.setup()
    const onAssignServer = vi.fn()
    const onSwapPlayers = vi.fn()
    renderCourt({
      canEdit: true,
      courtModel: playerModel,
      onAssignServer,
      onSwapPlayers,
    })
    await user.click(screen.getByRole('button', { name: /Visual service court/ }))

    const shuttleButton = screen.getByRole('button', {
      name: 'Select a player to serve',
    })
    expect(shuttleButton).toBeDisabled()

    await user.click(
      screen.getByRole('button', { name: 'Swap Left Team player positions' }),
    )
    expect(onSwapPlayers).toHaveBeenCalledWith('left')

    const alex = screen.getByRole('button', {
      name: 'Select Alex of Left Team',
    })
    await user.click(alex)
    expect(alex).toHaveAttribute('aria-pressed', 'true')

    const assignAlex = screen.getByRole('button', {
      name: 'Make Alex of Left Team serve',
    })
    expect(assignAlex).toBeEnabled()
    await user.click(assignAlex)

    expect(onAssignServer).toHaveBeenCalledWith('left', 0)
    expect(
      document.querySelector('.service-court__serve-path'),
    ).toHaveAttribute('data-flight', '25-75-75-25')
    expect(
      document.querySelector('.service-court__serve-trail'),
    ).toHaveAttribute('d', 'M 25 75 Q 50 6 75 25')
    expect(
      screen.getByRole('button', { name: 'Select a player to serve' })
        .closest('.service-court-dialog__controls'),
    ).toContainElement(
      screen.getByRole('button', { name: 'Close service court' }),
    )
    expect(
      screen.getByRole('button', { name: 'Select a player to serve' }),
    ).toBeDisabled()
  })

  it('clears player selection when the expanded court closes', async () => {
    const user = userEvent.setup()
    renderCourt({ canEdit: true, courtModel: playerModel })
    const miniCourt = screen.getByRole('button', { name: /Visual service court/ })
    await user.click(miniCourt)
    await user.click(
      screen.getByRole('button', { name: 'Select Alex of Left Team' }),
    )
    await user.click(screen.getByRole('button', { name: 'Close service court' }))
    await user.click(miniCourt)

    expect(
      screen.getByRole('button', { name: 'Select a player to serve' }),
    ).toBeDisabled()
  })
})