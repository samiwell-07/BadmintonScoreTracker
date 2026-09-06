import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GENERAL_SETTINGS_STORAGE_KEY } from './generalSettings'
import { MATCH_SETTINGS_STORAGE_KEY } from './matchSettings'
import { Scoreboard } from './Scoreboard'

describe('Scoreboard', () => {
  const usePlayerIndicators = () => {
    localStorage.setItem(
      GENERAL_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        playerServeIndicatorEnabled: true,
        teamServeIndicatorEnabled: true,
      }),
    )
  }

  const useQuickMatchSettings = (gamesToWin = 2) => {
    localStorage.setItem(
      MATCH_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        pointsToWin: 2,
        winByTwo: false,
        maximumScore: 3,
        gamesToWin,
      }),
    )
  }

  const setPanelBounds = (
    element: HTMLElement,
    { left = 0, right = 500 } = {},
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
    {
      endX = 200,
      endY = 700,
      pointerId = 1,
      pointerType = 'touch',
      startX = 200,
      startY = 100,
    }: {
      endX?: number
      endY?: number
      pointerId?: number
      pointerType?: 'mouse' | 'pen' | 'touch'
      startX?: number
      startY?: number
    } = {},
  ) => {
    fireEvent.pointerDown(element, {
      button: 0,
      clientX: startX,
      clientY: startY,
      isPrimary: true,
      pointerId,
      pointerType,
    })
    fireEvent.pointerMove(element, {
      clientX: endX,
      clientY: endY,
      isPrimary: true,
      pointerId,
      pointerType,
    })
    fireEvent.pointerUp(element, {
      clientX: endX,
      clientY: endY,
      isPrimary: true,
      pointerId,
      pointerType,
    })
  }

  it('opens the center fan without changing either score', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const scoreboard = screen.getByRole('main', {
      name: 'Badminton score tracker',
    })

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Swap teams' }))

    expect(scoreboard).toHaveClass('scoreboard--menu-open')
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
    expect(screen.getByRole('button', { name: 'Close center menu', expanded: true })).toBeInTheDocument()
  })

  it('freezes a won game, supports correction, and starts the next game', async () => {
    const user = userEvent.setup()
    useQuickMatchSettings()
    render(<Scoreboard />)
    const addLeftPoint = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })

    await user.click(addLeftPoint)
    await user.click(addLeftPoint)

    expect(screen.getByRole('alertdialog', { name: 'Player / Team 1' })).toBeInTheDocument()
    expect(screen.getByText('Set 1 winner')).toBeInTheDocument()
    expect(addLeftPoint).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Open set history' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Undo winning point' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
    expect(screen.queryByRole('button', { name: 'Open set history' })).not.toBeInTheDocument()

    await user.click(addLeftPoint)
    await user.click(screen.getByRole('button', { name: 'Next game' }))
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
    expect(addLeftPoint).toBeEnabled()
  })

  it('shows an archived set on the board and returns with the back half-circle', async () => {
    const user = userEvent.setup()
    useQuickMatchSettings()
    render(<Scoreboard />)
    const addLeftPoint = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    await user.click(addLeftPoint)
    await user.click(addLeftPoint)
    await user.click(screen.getByRole('button', { name: 'Next game' }))
    await user.click(
      screen.getByRole('button', { name: 'Add a point to Player / Team 2' }),
    )

    await user.click(screen.getByRole('button', { name: 'Open set history' }))
    await user.click(screen.getByRole('button', { name: /Set 1.*2 - 0/ }))

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('2')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
    expect(screen.getByRole('button', { name: 'Add a point to Player / Team 1' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Open center menu' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to live match' }))
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('1')
  })

  it('stops a completed match and can start a new one', async () => {
    const user = userEvent.setup()
    useQuickMatchSettings(1)
    render(<Scoreboard />)
    const addLeftPoint = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    await user.click(addLeftPoint)
    await user.click(addLeftPoint)

    expect(screen.getByText('Match winner')).toBeInTheDocument()
    expect(screen.getByText('Sets won: 1 - 0')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    const reopenResult = screen.getByRole('button', {
      name: /Match complete: Player \/ Team 1 wins. Reopen result/,
    })
    expect(reopenResult).toBeInTheDocument()
    expect(addLeftPoint).toBeDisabled()

    reopenResult.focus()
    await user.keyboard('{Enter}')
    expect(
      screen.getByRole('alertdialog', { name: 'Player / Team 1' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'New match' }))
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
    expect(screen.queryByRole('button', { name: 'Open set history' })).not.toBeInTheDocument()
  })

  it('reopens a closed completed-match result after remount', async () => {
    const user = userEvent.setup()
    useQuickMatchSettings(1)
    const firstRender = render(<Scoreboard />)
    const addLeftPoint = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    await user.click(addLeftPoint)
    await user.click(addLeftPoint)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    firstRender.unmount()

    render(<Scoreboard />)
    await user.click(
      screen.getByRole('button', { name: /Match complete.*Reopen result/ }),
    )

    expect(
      screen.getByRole('alertdialog', { name: 'Player / Team 1' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New match' })).toBeInTheDocument()
  })

  it('restores a pending result dialog after remount', async () => {
    const user = userEvent.setup()
    useQuickMatchSettings()
    const firstRender = render(<Scoreboard />)
    const addLeftPoint = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    await user.click(addLeftPoint)
    await user.click(addLeftPoint)
    firstRender.unmount()

    render(<Scoreboard />)

    expect(screen.getByRole('alertdialog', { name: 'Player / Team 1' })).toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('2')
  })

  it('resets only the current game unless completed sets are selected', async () => {
    const user = userEvent.setup()
    useQuickMatchSettings()
    render(<Scoreboard />)
    const addLeftPoint = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    await user.click(addLeftPoint)
    await user.click(addLeftPoint)
    await user.click(screen.getByRole('button', { name: 'Next game' }))
    await user.click(addLeftPoint)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Reset match' }))

    const resetSets = screen.getByRole('checkbox', {
      name: 'Also reset completed sets',
    })
    expect(resetSets).not.toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Reset match' }))
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
    expect(screen.getByRole('button', { name: 'Open set history' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Reset match' }))
    await user.click(screen.getByRole('checkbox', { name: 'Also reset completed sets' }))
    await user.click(screen.getByRole('button', { name: 'Reset match' }))
    expect(screen.queryByRole('button', { name: 'Open set history' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    expect(screen.getByRole('button', { name: 'Save settings' })).toBeInTheDocument()
  })

  it('swaps team names and scores while keeping the fan open', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Player / Team 1' }))
    const leftName = screen.getByRole('textbox', { name: 'Name for left side' })
    await user.clear(leftName)
    await user.type(leftName, 'Falcons{Enter}')
    await user.click(screen.getByRole('button', { name: 'Add a point to Falcons' }))
    await user.click(screen.getByRole('button', { name: 'Add a point to Falcons' }))
    await user.click(screen.getByRole('button', { name: 'Add a point to Player / Team 2' }))
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))

    await user.click(screen.getByRole('button', { name: 'Swap teams' }))

    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('1')
    expect(screen.getByLabelText('Falcons score')).toHaveTextContent('2')
    expect(screen.getByRole('button', { name: 'Close center menu', expanded: true })).toBeInTheDocument()
  })

  it('confirms reset before clearing scores and preserves names', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Player / Team 1' }))
    const leftName = screen.getByRole('textbox', { name: 'Name for left side' })
    await user.clear(leftName)
    await user.type(leftName, 'Falcons{Enter}')
    await user.click(screen.getByRole('button', { name: 'Add a point to Falcons' }))
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Reset match' }))

    expect(screen.getByRole('alertdialog', { name: 'Reset match?' })).toBeInTheDocument()
    expect(screen.getByLabelText('Falcons score')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: 'Reset match' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Falcons' })).toBeInTheDocument()
    expect(screen.getByLabelText('Falcons score')).toHaveTextContent('0')
    expect(screen.queryByRole('status', { name: /is serving/ })).not.toBeInTheDocument()
  })

  it('cancels reset without changing scores', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Add a point to Player / Team 2' }))
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Reset match' }))

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('1')
  })

  it('selects a serving side without adding a point', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    expect(
      screen.getByRole('button', { name: /Visual service court.*No server selected/ }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))

    expect(screen.getByRole('button', { name: 'Select Player / Team 1 to serve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select Player / Team 2 to serve' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Select Player / Team 2 to serve' }))

    expect(screen.getByRole('status', { name: 'Player / Team 2 is serving' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Visual service court.*Player \/ Team 2 serves from the top court/,
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
    expect(screen.queryByRole('button', { name: /Select .* to serve/ })).not.toBeInTheDocument()
  })

  it('sets up doubles service and rotates the same yellow player marker', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    render(<Scoreboard />)
    expect(screen.getAllByLabelText(/players$/)).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))

    expect(
      screen.getByText('Choose the player on the left / odd court'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', {
        name: 'Select Player 1 of Player / Team 1',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Select Player 2 of Player / Team 2',
      }),
    )

    expect(screen.getAllByText('Choose the current server')).toHaveLength(2)
    await user.click(
      screen.getByRole('button', {
        name: 'Select Player 2 of Player / Team 1',
      }),
    )

    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 1 is serving',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Visual service court.*Player 2 of Player \/ Team 1 is serving from the bottom court/,
      }),
    ).toBeInTheDocument()
    expect(document.querySelectorAll('.score-side__service-marker')).toHaveLength(1)

    await user.click(
      screen.getByRole('button', { name: 'Add a point to Player / Team 1' }),
    )
    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 1 is serving',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Visual service court.*Player 2 of Player \/ Team 1 is serving from the top court/,
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Add a point to Player / Team 2' }),
    )
    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 2 is serving',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Visual service court.*Player 2 of Player \/ Team 2 is serving from the bottom court/,
      }),
    ).toBeInTheDocument()
    expect(document.querySelectorAll('.score-side__service-marker')).toHaveLength(1)
  })

  it('edits live doubles positions and server from the expanded court', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(
      screen.getByRole('button', {
        name: 'Select Player 1 of Player / Team 1',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Select Player 2 of Player / Team 2',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Select Player 2 of Player / Team 1',
      }),
    )
    await user.click(screen.getByRole('button', { name: /Visual service court/ }))

    const leftTop = document.querySelector('.service-court__cell--left-top')!
    const leftBottom = document.querySelector('.service-court__cell--left-bottom')!
    expect(leftTop).toHaveTextContent('Player 1')
    expect(leftBottom).toHaveTextContent('Player 2')

    await user.click(
      screen.getByRole('button', {
        name: 'Swap Player / Team 1 player positions',
      }),
    )
    expect(leftTop).toHaveTextContent('Player 2')
    expect(leftBottom).toHaveTextContent('Player 1')
    expect(
      screen.getByRole('status', {
        name: 'Player 1 of Player / Team 1 is serving',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Select Player 2 of Player / Team 1',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Make Player 2 of Player / Team 1 serve',
      }),
    )

    expect(leftTop).toHaveTextContent('Player 1')
    expect(leftBottom).toHaveTextContent('Player 2')
    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 1 is serving',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
  })

  it('hides the visual court when both serve indicators are disabled', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    await user.click(screen.getByRole('tab', { name: 'General settings' }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Team serve indicator' }),
    )
    await user.click(screen.getByRole('button', { name: 'Save settings' }))

    expect(
      screen.queryByRole('button', { name: /Visual service court/ }),
    ).not.toBeInTheDocument()
  })

  it('cancels player service setup without changing the existing server', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 1 of Player / Team 1' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 2' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 1' }))
    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 1 is serving',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 1' }))
    await user.keyboard('{Escape}')

    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 1 is serving',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Choose the player on the left / odd court'))
      .not.toBeInTheDocument()
  })

  it('moves player service state with teams when sides swap', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 1 of Player / Team 1' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 2' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 1' }))

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Swap teams' }))

    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 1 is serving',
      }),
    ).toBeInTheDocument()
    expect(document.querySelector('.score-side--right .score-side__service-marker'))
      .toBeInTheDocument()
  })

  it('clears player service on removal and reuses calibrated courts next rally', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 1 of Player / Team 1' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 2' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 1' }))
    const leftButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const leftPanel = leftButton.closest('section')!
    setPanelBounds(leftPanel)
    await user.click(leftButton)

    swipe(leftPanel)
    fireEvent.click(leftButton)
    expect(screen.queryByRole('status', { name: /is serving/ })).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Add a point to Player / Team 2' }),
    )
    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 2 is serving',
      }),
    ).toBeInTheDocument()
  })

  it('restores the exact doubles server after undoing a winning point', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    useQuickMatchSettings()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 1 of Player / Team 1' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 2' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 1' }))
    const leftButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    await user.click(leftButton)
    await user.click(leftButton)

    await user.click(screen.getByRole('button', { name: 'Undo winning point' }))

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 1 is serving',
      }),
    ).toBeInTheDocument()
  })

  it('saves player rosters and hides all serve indicators when both toggles are off', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    await user.click(screen.getByRole('tab', { name: 'General settings' }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Team serve indicator' }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: 'Player serve indicator' }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: 'Player serve indicator' }),
    )
    await user.click(screen.getByRole('button', { name: 'Save settings' }))

    await user.click(
      screen.getByRole('button', { name: 'Add a point to Player / Team 1' }),
    )
    expect(document.querySelector('.score-side__service-marker')).toBeNull()
    expect(screen.queryByRole('status', { name: /is serving/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    await user.click(screen.getByRole('tab', { name: 'General settings' }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Player serve indicator' }),
    )
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('edits player names inline without adding a point and persists them', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    const firstRender = render(<Scoreboard />)
    await user.click(
      screen.getByRole('button', {
        name: 'Edit Player 1 for Player / Team 1',
      }),
    )
    const input = screen.getByRole('textbox', {
      name: 'Name for left player 1',
    })
    await user.clear(input)
    await user.type(input, 'Alex{Enter}')

    expect(
      screen.getByRole('button', {
        name: 'Edit Alex for Player / Team 1',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')

    firstRender.unmount()
    render(<Scoreboard />)
    expect(
      screen.getByRole('button', {
        name: 'Edit Alex for Player / Team 1',
      }),
    ).toBeInTheDocument()
  })

  it('replaces team headings with exactly two large player controls per side', () => {
    usePlayerIndicators()
    render(<Scoreboard />)

    expect(
      screen.queryByRole('button', { name: 'Player / Team 1' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Player / Team 2' }),
    ).not.toBeInTheDocument()
    expect(document.querySelectorAll('.score-side__player-name')).toHaveLength(4)
    expect(document.querySelectorAll('.score-side__name')).toHaveLength(0)
  })

  it('uses both player names joined by and in completed-set results', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    useQuickMatchSettings()
    render(<Scoreboard />)

    const renamePlayer = async (
      buttonName: string,
      inputName: string,
      playerName: string,
    ) => {
      await user.click(screen.getByRole('button', { name: buttonName }))
      const input = screen.getByRole('textbox', { name: inputName })
      await user.clear(input)
      await user.type(input, `${playerName}{Enter}`)
    }

    await renamePlayer(
      'Edit Player 1 for Player / Team 1',
      'Name for left player 1',
      'Samuel',
    )
    await renamePlayer(
      'Edit Player 2 for Player / Team 1',
      'Name for left player 2',
      'Alex',
    )
    const addLeftPoint = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    await user.click(addLeftPoint)
    await user.click(addLeftPoint)

    expect(
      screen.getByRole('alertdialog', { name: 'Samuel and Alex' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next game' }))
    await user.click(screen.getByRole('button', { name: 'Open set history' }))
    expect(screen.getByRole('button', { name: /Samuel and Alex/ }))
      .toBeInTheDocument()
  })

  it('cancels or restores defaults for inline player-name edits', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    render(<Scoreboard />)
    const player = screen.getByRole('button', {
      name: 'Edit Player 2 for Player / Team 2',
    })
    await user.click(player)
    let input = screen.getByRole('textbox', {
      name: 'Name for right player 2',
    })
    await user.clear(input)
    await user.type(input, 'Temporary{Escape}')
    expect(
      screen.getByRole('button', {
        name: 'Edit Player 2 for Player / Team 2',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Edit Player 2 for Player / Team 2',
      }),
    )
    input = screen.getByRole('textbox', {
      name: 'Name for right player 2',
    })
    await user.clear(input)
    await user.tab()
    expect(
      screen.getByRole('button', {
        name: 'Edit Player 2 for Player / Team 2',
      }),
    ).toBeInTheDocument()
  })

  it('moves edited player names with their team when swapping sides', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    render(<Scoreboard />)
    await user.click(
      screen.getByRole('button', {
        name: 'Edit Player 1 for Player / Team 1',
      }),
    )
    const input = screen.getByRole('textbox', {
      name: 'Name for left player 1',
    })
    await user.clear(input)
    await user.type(input, 'Alex{Enter}')
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Swap teams' }))

    expect(
      document.querySelector('.score-side--right [aria-label="Edit Alex for Player / Team 1"]'),
    ).toBeInTheDocument()
  })

  it('blocks inline player editing during service setup', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))

    expect(
      screen.getByRole('button', {
        name: 'Edit Player 1 for Player / Team 1',
        hidden: true,
      }),
    ).toBeDisabled()
    expect(
      screen.queryByRole('textbox', { name: 'Name for left player 1' }),
    ).not.toBeInTheDocument()
  })

  it('restores the correct player marker after player indicators are hidden', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 1 of Player / Team 1' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 2' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 1' }))

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    await user.click(screen.getByRole('tab', { name: 'General settings' }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Player serve indicator' }),
    )
    await user.click(screen.getByRole('button', { name: 'Save settings' }))
    expect(
      screen.getByRole('status', { name: 'Player / Team 1 is serving' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Add a point to Player / Team 2' }),
    )
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    await user.click(screen.getByRole('tab', { name: 'General settings' }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Player serve indicator' }),
    )
    await user.click(screen.getByRole('button', { name: 'Save settings' }))

    expect(
      screen.getByRole('status', {
        name: 'Player 2 of Player / Team 2 is serving',
      }),
    ).toBeInTheDocument()
    expect(document.querySelectorAll('.score-side__service-marker')).toHaveLength(1)
  })

  it('requires player service setup again for the next game', async () => {
    const user = userEvent.setup()
    usePlayerIndicators()
    useQuickMatchSettings()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 1 of Player / Team 1' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 2' }))
    await user.click(screen.getByRole('button', { name: 'Select Player 2 of Player / Team 1' }))
    const leftButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    await user.click(leftButton)
    await user.click(leftButton)
    await user.click(screen.getByRole('button', { name: 'Next game' }))

    expect(screen.queryByRole('status', { name: /is serving/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    expect(
      screen.getByRole('button', {
        name: 'Select Player 1 of Player / Team 1',
      }),
    ).toBeInTheDocument()
  })

  it('cancels service selection with Escape and preserves the server', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Add a point to Player / Team 1' }))
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))

    await user.keyboard('{Escape}')

    expect(screen.getByRole('status', { name: 'Player / Team 1 is serving' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Select .* to serve/ })).not.toBeInTheDocument()
  })

  it('moves service to the scoring side and clears it after a successful removal', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const rightPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 2',
    })
    const rightPanel = rightPointButton.closest('section')!
    setPanelBounds(rightPanel)

    await user.click(screen.getByRole('button', { name: 'Add a point to Player / Team 1' }))
    expect(screen.getByRole('status', { name: 'Player / Team 1 is serving' })).toBeInTheDocument()

    await user.click(rightPointButton)
    expect(screen.getByRole('status', { name: 'Player / Team 2 is serving' })).toBeInTheDocument()

    swipe(rightPanel)
    fireEvent.click(rightPointButton)
    expect(screen.queryByRole('status', { name: /is serving/ })).not.toBeInTheDocument()
  })

  it('moves service with a swapped team', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Add a point to Player / Team 1' }))
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))

    await user.click(screen.getByRole('button', { name: 'Swap teams' }))

    expect(screen.getByRole('status', { name: 'Player / Team 1 is serving' })).toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
  })

  it('keeps service when removal is attempted at zero', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const rightPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 2',
    })
    const rightPanel = rightPointButton.closest('section')!
    setPanelBounds(rightPanel)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Select serving team' }))
    await user.click(screen.getByRole('button', { name: 'Select Player / Team 2 to serve' }))

    swipe(rightPanel)
    fireEvent.click(rightPointButton)

    expect(screen.getByRole('status', { name: 'Player / Team 2 is serving' })).toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
  })

  it('saves settings locally and discards later cancelled edits', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))

    await user.click(screen.getByRole('button', { name: 'Decrease points to win' }))
    await user.click(screen.getByRole('button', { name: 'Increase games to win' }))
    await user.click(screen.getByRole('button', { name: 'Save settings' }))

    expect(JSON.parse(localStorage.getItem('badminton-score-tracker:match-settings')!)).toEqual({
      pointsToWin: 20,
      winByTwo: true,
      maximumScore: 30,
      gamesToWin: 3,
    })

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    expect(screen.getByLabelText('Points to win')).toHaveTextContent('20')
    expect(screen.getByLabelText('Games to win')).toHaveTextContent('3')
    await user.click(screen.getByRole('button', { name: 'Decrease points to win' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))
    expect(screen.getByLabelText('Points to win')).toHaveTextContent('20')
  })

  it('dismisses the center fan without scoring and restores normal controls', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const scoreboard = screen.getByRole('main', {
      name: 'Badminton score tracker',
    })

    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Dismiss center menu' }))

    expect(scoreboard).not.toHaveClass('scoreboard--menu-open')
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')

    await user.click(
      screen.getByRole('button', { name: 'Add a point to Player / Team 1' }),
    )
    await user.click(screen.getByRole('button', { name: 'Player / Team 2' }))

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
    expect(screen.getByRole('textbox', { name: 'Name for right side' })).toBeInTheDocument()
  })

  it('increments each side independently', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)

    await user.click(
      screen.getByRole('button', {
        name: 'Add a point to Player / Team 1',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Add a point to Player / Team 1',
      }),
    )

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('2')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
  })

  it('keeps ordinary pointer clicks captured by their original button', () => {
    render(<Scoreboard />)
    const addPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const nameButton = screen.getByRole('button', { name: 'Player / Team 1' })
    const panel = addPointButton.closest('section')!
    const panelCapture = vi.fn()
    const pointButtonCapture = vi.fn()
    const nameButtonCapture = vi.fn()
    panel.setPointerCapture = panelCapture
    addPointButton.setPointerCapture = pointButtonCapture
    nameButton.setPointerCapture = nameButtonCapture

    fireEvent.pointerDown(addPointButton, {
      button: 0,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })
    fireEvent.pointerUp(addPointButton, {
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    })
    fireEvent.click(addPointButton)

    fireEvent.pointerDown(nameButton, {
      button: 0,
      isPrimary: true,
      pointerId: 2,
      pointerType: 'mouse',
    })
    fireEvent.pointerUp(nameButton, {
      isPrimary: true,
      pointerId: 2,
      pointerType: 'mouse',
    })
    fireEvent.click(nameButton)

    expect(panelCapture).not.toHaveBeenCalled()
    expect(pointButtonCapture).toHaveBeenCalledWith(1)
    expect(nameButtonCapture).toHaveBeenCalledWith(2)
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
    expect(screen.getByRole('textbox', { name: 'Name for left side' })).toBeInTheDocument()
  })

  it('supports keyboard scoring', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const addPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 2',
    })

    addPointButton.focus()
    await user.keyboard('{Enter} ')

    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('2')
  })

  it('removes one point with a downward swipe without adding it back', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const addPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const panel = addPointButton.closest('section')!
    setPanelBounds(panel)
    await user.click(addPointButton)
    await user.click(addPointButton)

    swipe(panel)
    fireEvent.click(addPointButton)

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
  })

  it('transfers a point and service from left to right across the divider', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const leftButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const leftPanel = leftButton.closest('section')!
    setPanelBounds(leftPanel)
    await user.click(leftButton)
    await user.click(leftButton)

    swipe(leftPanel, { startX: 200, startY: 300, endX: 700, endY: 320 })
    fireEvent.click(leftButton)

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('1')
    expect(screen.getByRole('status', { name: 'Player / Team 2 is serving' })).toBeInTheDocument()
  })

  it('transfers a point and service from right to left across the divider', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const rightButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 2',
    })
    const rightPanel = rightButton.closest('section')!
    setPanelBounds(rightPanel, { left: 500, right: 1000 })
    await user.click(rightButton)
    await user.click(rightButton)

    swipe(rightPanel, {
      startX: 800,
      startY: 300,
      endX: 300,
      endY: 320,
      pointerType: 'mouse',
    })
    fireEvent.click(rightButton)

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('1')
    expect(screen.getByRole('status', { name: 'Player / Team 1 is serving' })).toBeInTheDocument()
  })

  it('moves only service when the transfer source has no point', () => {
    render(<Scoreboard />)
    const leftButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const leftPanel = leftButton.closest('section')!
    setPanelBounds(leftPanel)

    swipe(leftPanel, { startX: 200, startY: 300, endX: 700, endY: 300 })
    fireEvent.click(leftButton)

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
    expect(screen.getByRole('status', { name: 'Player / Team 2 is serving' })).toBeInTheDocument()
  })

  it('ends a game from a transferred point and restores both scores on undo', async () => {
    const user = userEvent.setup()
    useQuickMatchSettings()
    render(<Scoreboard />)
    const leftButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const leftPanel = leftButton.closest('section')!
    setPanelBounds(leftPanel)
    await user.click(leftButton)
    await user.click(
      screen.getByRole('button', { name: 'Add a point to Player / Team 2' }),
    )

    swipe(leftPanel, { startX: 200, startY: 300, endX: 700, endY: 310 })
    fireEvent.click(leftButton)

    expect(screen.getByRole('alertdialog', { name: 'Player / Team 2' })).toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('2')

    await user.click(screen.getByRole('button', { name: 'Undo winning point' }))

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('1')
  })

  it('completes a match from a transferred point', async () => {
    const user = userEvent.setup()
    useQuickMatchSettings(1)
    render(<Scoreboard />)
    const leftButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const leftPanel = leftButton.closest('section')!
    setPanelBounds(leftPanel)
    await user.click(leftButton)
    await user.click(
      screen.getByRole('button', { name: 'Add a point to Player / Team 2' }),
    )

    swipe(leftPanel, { startX: 200, startY: 300, endX: 700, endY: 310 })
    fireEvent.click(leftButton)

    expect(screen.getByText('Match winner')).toBeInTheDocument()
    expect(screen.getByRole('alertdialog', { name: 'Player / Team 2' })).toBeInTheDocument()
    expect(screen.getByText('Sets won: 0 - 1')).toBeInTheDocument()
  })

  it.each([
    ['does not cross the divider', { startX: 150, endX: 450, startY: 300, endY: 310 }],
    ['moves outward', { startX: 200, endX: -200, startY: 300, endY: 310 }],
    ['is vertically dominant', { startX: 200, endX: 550, startY: 100, endY: 700 }],
  ])('rejects a horizontal drag that %s', async (_description, gesture) => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const leftButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const leftPanel = leftButton.closest('section')!
    setPanelBounds(leftPanel)
    await user.click(leftButton)

    swipe(leftPanel, gesture)
    fireEvent.click(leftButton)

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
    expect(screen.getByRole('status', { name: 'Player / Team 1 is serving' })).toBeInTheDocument()
  })

  it('supports mouse dragging and keeps the two sides independent', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const leftButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const rightButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 2',
    })
    const rightPanel = rightButton.closest('section')!
    setPanelBounds(rightPanel)
    await user.click(leftButton)
    await user.click(rightButton)
    await user.click(rightButton)

    swipe(rightPanel, { pointerType: 'mouse' })
    fireEvent.click(rightButton)

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('1')
  })

  it('does not remove below zero', () => {
    render(<Scoreboard />)
    const addPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const panel = addPointButton.closest('section')!
    setPanelBounds(panel)

    swipe(panel)
    fireEvent.click(addPointButton)

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
  })

  it('unlocks settings after correcting a history-free game back to zero', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const addPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const panel = addPointButton.closest('section')!
    setPanelBounds(panel)
    await user.click(addPointButton)

    swipe(panel)
    fireEvent.click(addPointButton)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))
    await user.click(screen.getByRole('button', { name: 'Match settings' }))

    expect(screen.getByRole('button', { name: 'Save settings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Increase points to win' })).toBeEnabled()
  })

  it.each([
    ['stays in the top half', { startY: 100, endY: 300 }],
    ['moves upward', { startY: 700, endY: 100 }],
    ['does not travel far enough', { startY: 350, endY: 450 }],
    ['finishes outside the panel', { startY: 100, endY: 700, endX: 600 }],
  ])('rejects a drag that %s', async (_description, gesture) => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const addPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const panel = addPointButton.closest('section')!
    setPanelBounds(panel)
    await user.click(addPointButton)

    swipe(panel, gesture)
    fireEvent.click(addPointButton)

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
  })

  it('cancels an active drag without changing the score', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const addPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const panel = addPointButton.closest('section')!
    setPanelBounds(panel)
    await user.click(addPointButton)

    fireEvent.pointerDown(panel, {
      button: 0,
      clientX: 200,
      clientY: 100,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    })
    fireEvent.pointerMove(panel, {
      clientX: 200,
      clientY: 700,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    })
    fireEvent.pointerCancel(panel, { pointerId: 1, pointerType: 'touch' })
    fireEvent.click(addPointButton)

    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('1')
  })

  it('swipes over a name without opening the name editor', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)
    const addPointButton = screen.getByRole('button', {
      name: 'Add a point to Player / Team 1',
    })
    const nameButton = screen.getByRole('button', { name: 'Player / Team 1' })
    const panel = addPointButton.closest('section')!
    setPanelBounds(panel)
    await user.click(addPointButton)

    swipe(nameButton)
    fireEvent.click(nameButton)

    expect(screen.queryByRole('textbox', { name: 'Name for left side' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
  })

  it('edits a name without adding a point', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)

    await user.click(screen.getByRole('button', { name: 'Player / Team 1' }))
    const nameInput = screen.getByRole('textbox', { name: 'Name for left side' })
    await user.clear(nameInput)
    await user.type(nameInput, 'Falcons{Enter}')

    expect(screen.getByRole('button', { name: 'Falcons' })).toBeInTheDocument()
    expect(screen.getByLabelText('Falcons score')).toHaveTextContent('0')
  })

  it('cancels a name edit with Escape', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)

    await user.click(screen.getByRole('button', { name: 'Player / Team 2' }))
    const nameInput = screen.getByRole('textbox', { name: 'Name for right side' })
    await user.clear(nameInput)
    await user.type(nameInput, 'Temporary name{Escape}')

    expect(screen.getByRole('button', { name: 'Player / Team 2' })).toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 2 score')).toHaveTextContent('0')
  })

  it('keeps the previous name when a blank edit loses focus', async () => {
    const user = userEvent.setup()
    render(<Scoreboard />)

    await user.click(screen.getByRole('button', { name: 'Player / Team 1' }))
    const nameInput = screen.getByRole('textbox', { name: 'Name for left side' })
    await user.clear(nameInput)
    await user.tab()

    expect(screen.getByRole('button', { name: 'Player / Team 1' })).toBeInTheDocument()
    expect(screen.getByLabelText('Player / Team 1 score')).toHaveTextContent('0')
  })
})