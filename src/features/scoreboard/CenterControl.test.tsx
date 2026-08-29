import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CenterControl } from './CenterControl'
import type { CenterControlAction } from './CenterControl'

interface CenterControlHarnessProps {
  onAction?: (action: CenterControlAction) => void
}

function CenterControlHarness({
  onAction = () => undefined,
}: CenterControlHarnessProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <CenterControl
      isOpen={isOpen}
      onAction={onAction}
      onOpenChange={setIsOpen}
    />
  )
}

describe('CenterControl', () => {
  it('opens and closes all four action buttons', async () => {
    const user = userEvent.setup()
    render(<CenterControlHarness />)
    const toggle = screen.getByRole('button', { name: 'Open center menu' })

    expect(screen.queryByRole('button', { name: 'Swap teams' })).not.toBeInTheDocument()
    await user.click(toggle)

    expect(screen.getByRole('button', { name: 'Swap teams' })).toHaveClass('center-control__item--1')
    expect(screen.getByRole('button', { name: 'Reset match' })).toHaveClass('center-control__item--2')
    expect(screen.getByRole('button', { name: 'Select serving team' })).toHaveClass('center-control__item--3')
    expect(screen.getByRole('button', { name: 'Match settings' })).toHaveClass('center-control__item--4')
    expect(screen.getByRole('button', { name: 'Swap teams' }).querySelector('svg')).toHaveClass('lucide-arrow-left-right')
    expect(screen.getByText('Swap sides', { selector: '.center-control__tooltip' })).toBeInTheDocument()
    expect(screen.getByText('Reset', { selector: '.center-control__tooltip' })).toBeInTheDocument()
    expect(screen.getByText('Service', { selector: '.center-control__tooltip' })).toBeInTheDocument()
    expect(screen.getByText('Settings', { selector: '.center-control__tooltip' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close center menu', expanded: true })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close center menu', expanded: true }))
    expect(screen.queryByRole('button', { name: 'Swap teams' })).not.toBeInTheDocument()
  })

  it('closes with Escape', async () => {
    const user = userEvent.setup()
    render(<CenterControlHarness />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))

    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: 'Open center menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes from the outside dismissal button', async () => {
    const user = userEvent.setup()
    render(<CenterControlHarness />)
    await user.click(screen.getByRole('button', { name: 'Open center menu' }))

    await user.click(screen.getByRole('button', { name: 'Dismiss center menu' }))

    expect(screen.getByRole('button', { name: 'Open center menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('pulses a child while keeping the menu open', () => {
    vi.useFakeTimers()
    const onAction = vi.fn()
    render(<CenterControlHarness onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open center menu' }))
    const child = screen.getByRole('button', { name: 'Reset match' })

    fireEvent.click(child)

    expect(onAction).toHaveBeenCalledWith('reset')
    expect(child).toHaveClass('center-control__item--active')
    expect(screen.getByRole('button', { name: 'Close center menu', expanded: true })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(320))
    expect(child).not.toHaveClass('center-control__item--active')
    vi.useRealTimers()
  })
})