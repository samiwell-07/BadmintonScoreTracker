import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_MATCH_SETTINGS } from './matchSettings'
import { SetHistoryControl } from './SetHistoryControl'
import type { CompletedSet } from './scoreboard.types'

const completedSet: CompletedSet = {
  setNumber: 1,
  leftName: 'Left Team',
  rightName: 'Right Team',
  leftScore: 21,
  rightScore: 18,
  winner: 'left',
  rules: DEFAULT_MATCH_SETTINGS,
}

const renderControl = ({
  raiseCircle = false,
  selectedSetNumber = null as number | null,
} = {}) => render(
  <SetHistoryControl
    completedSets={[completedSet]}
    isOpen={false}
    raiseCircle={raiseCircle}
    selectedSetNumber={selectedSetNumber}
    onBack={vi.fn()}
    onSelect={vi.fn()}
    onToggle={vi.fn()}
  />,
)

describe('SetHistoryControl', () => {
  it('keeps the default control as a bottom half circle', () => {
    const { container } = renderControl()

    expect(container.firstChild).not.toHaveClass('set-history-control--raised')
    expect(screen.getByRole('button', { name: 'Open set history' })).toBeInTheDocument()
  })

  it('raises both history and archive controls into full circles', () => {
    const history = renderControl({ raiseCircle: true })
    expect(history.container.firstChild).toHaveClass('set-history-control--raised')
    history.unmount()

    const archive = renderControl({ raiseCircle: true, selectedSetNumber: 1 })
    expect(archive.container.firstChild).toHaveClass(
      'set-history-control--archive',
      'set-history-control--raised',
    )
    expect(screen.getByRole('button', { name: 'Back to live match' })).toBeInTheDocument()
  })
})
