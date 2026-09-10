import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

vi.mock('../features/scoreboard/Scoreboard', () => ({
  Scoreboard: () => <main>Persisted scoreboard</main>,
}))

describe('App startup splash', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('fades during the final half-second and mounts the scoreboard at three seconds', () => {
    vi.useFakeTimers()
    render(<App />)

    const splash = screen.getByRole('status', {
      name: 'Loading Badminton Score Tracker',
    })
    expect(screen.getByText('Badminton Score Tracker')).toBeInTheDocument()
    expect(screen.getByText('Developed by Samuel Srouji')).toBeInTheDocument()
    expect(screen.queryByText('Persisted scoreboard')).not.toBeInTheDocument()

    act(() => vi.advanceTimersByTime(2499))
    expect(splash).not.toHaveClass('startup-splash--exiting')

    act(() => vi.advanceTimersByTime(1))
    expect(splash).toHaveClass('startup-splash--exiting')

    act(() => vi.advanceTimersByTime(499))
    expect(splash).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1))
    expect(screen.queryByRole('status', {
      name: 'Loading Badminton Score Tracker',
    })).not.toBeInTheDocument()
    expect(screen.getByText('Persisted scoreboard')).toBeInTheDocument()
  })
})