import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MatchSettingsDialog } from './MatchSettingsDialog'
import {
  DEFAULT_MATCH_SETTINGS,
  MATCH_SETTINGS_STORAGE_KEY,
  loadMatchSettings,
  saveMatchSettings,
} from './matchSettings'

describe('match settings', () => {
  it('opens on Match settings and switches to General settings', async () => {
    const user = userEvent.setup()
    render(
      <MatchSettingsDialog
        settings={DEFAULT_MATCH_SETTINGS}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    )
    const matchTab = screen.getByRole('tab', { name: 'Match settings' })
    const generalTab = screen.getByRole('tab', { name: 'General settings' })

    expect(matchTab).toHaveAttribute('aria-selected', 'true')
    expect(generalTab).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tabpanel', { name: 'Match settings' })).toBeInTheDocument()

    await user.click(generalTab)

    expect(matchTab).toHaveAttribute('aria-selected', 'false')
    expect(generalTab).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('checkbox', { name: 'Keep screen awake' }),
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Team serve indicator' }),
    ).toBeChecked()
  })

  it('saves general settings independently while Match settings are locked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const onSaveGeneralSettings = vi.fn()
    render(
      <MatchSettingsDialog
        isLocked
        settings={DEFAULT_MATCH_SETTINGS}
        onCancel={vi.fn()}
        onSave={onSave}
        onSaveGeneralSettings={onSaveGeneralSettings}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Increase points to win' }),
    ).toBeDisabled()
    await user.click(screen.getByRole('tab', { name: 'General settings' }))

    await user.click(
      screen.getByRole('checkbox', { name: 'Team serve indicator' }),
    )
    await user.click(screen.getByRole('button', { name: 'Save settings' }))

    expect(onSaveGeneralSettings).toHaveBeenCalledWith({
      keepScreenAwakeEnabled: true,
      playerServeIndicatorEnabled: false,
      teamServeIndicatorEnabled: false,
    })
    expect(onSave).not.toHaveBeenCalled()
  })

  it('saves the screen-awake preference', async () => {
    const user = userEvent.setup()
    const onSaveGeneralSettings = vi.fn()
    render(
      <MatchSettingsDialog
        settings={DEFAULT_MATCH_SETTINGS}
        onCancel={vi.fn()}
        onSave={vi.fn()}
        onSaveGeneralSettings={onSaveGeneralSettings}
      />,
    )
    await user.click(screen.getByRole('tab', { name: 'General settings' }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Keep screen awake' }),
    )
    await user.click(screen.getByRole('button', { name: 'Save settings' }))

    expect(onSaveGeneralSettings).toHaveBeenCalledWith(
      expect.objectContaining({ keepScreenAwakeEnabled: false }),
    )
  })

  it('does not show player-name fields when player indicators are enabled', async () => {
    const user = userEvent.setup()
    const onSaveGeneralSettings = vi.fn()
    render(
      <MatchSettingsDialog
        settings={DEFAULT_MATCH_SETTINGS}
        onCancel={vi.fn()}
        onSave={vi.fn()}
        onSaveGeneralSettings={onSaveGeneralSettings}
      />,
    )
    await user.click(screen.getByRole('tab', { name: 'General settings' }))

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('checkbox', { name: 'Player serve indicator' }),
    )
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save settings' }))

    expect(onSaveGeneralSettings).toHaveBeenCalledWith(
      expect.objectContaining({ playerServeIndicatorEnabled: true }),
    )
  })

  it('supports arrow, Home, and End keyboard tab selection', async () => {
    const user = userEvent.setup()
    render(
      <MatchSettingsDialog
        settings={DEFAULT_MATCH_SETTINGS}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    )
    const matchTab = screen.getByRole('tab', { name: 'Match settings' })
    const generalTab = screen.getByRole('tab', { name: 'General settings' })

    matchTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(generalTab).toHaveFocus()
    expect(generalTab).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Home}')
    expect(matchTab).toHaveFocus()
    await user.keyboard('{End}')
    expect(generalTab).toHaveFocus()
  })

  it('keeps the unsaved Match draft while switching tabs', async () => {
    const user = userEvent.setup()
    render(
      <MatchSettingsDialog
        settings={DEFAULT_MATCH_SETTINGS}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Decrease points to win' }))
    expect(screen.getByLabelText('Points to win')).toHaveTextContent('20')
    await user.click(screen.getByRole('tab', { name: 'General settings' }))
    await user.click(screen.getByRole('tab', { name: 'Match settings' }))

    expect(screen.getByLabelText('Points to win')).toHaveTextContent('20')
  })

  it('falls back from invalid storage and saves valid settings', () => {
    const storage = {
      getItem: vi.fn(() => '{invalid'),
      setItem: vi.fn(),
    }

    expect(loadMatchSettings(storage)).toEqual(DEFAULT_MATCH_SETTINGS)
    expect(saveMatchSettings(DEFAULT_MATCH_SETTINGS, storage)).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      MATCH_SETTINGS_STORAGE_KEY,
      JSON.stringify(DEFAULT_MATCH_SETTINGS),
    )
  })

  it('handles unavailable storage without throwing', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('Storage unavailable')
      }),
      setItem: vi.fn(() => {
        throw new Error('Storage unavailable')
      }),
    }

    expect(loadMatchSettings(storage)).toEqual(DEFAULT_MATCH_SETTINGS)
    expect(saveMatchSettings(DEFAULT_MATCH_SETTINGS, storage)).toBe(false)
  })

  it('edits a draft and saves bounded values', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(
      <MatchSettingsDialog
        settings={{
          pointsToWin: 29,
          winByTwo: true,
          maximumScore: 30,
          gamesToWin: 2,
        }}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Increase points to win' }))
    await user.click(screen.getByRole('button', { name: 'Increase points to win' }))
    await user.click(screen.getByRole('checkbox', { name: 'Win by two points' }))
    await user.click(screen.getByRole('button', { name: 'Increase games to win' }))
    await user.click(screen.getByRole('button', { name: 'Save settings' }))

    expect(onSave).toHaveBeenCalledWith({
      pointsToWin: 31,
      winByTwo: false,
      maximumScore: 31,
      gamesToWin: 3,
    })
  })

  it('cancels without saving draft changes', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onSave = vi.fn()
    render(
      <MatchSettingsDialog
        settings={DEFAULT_MATCH_SETTINGS}
        onCancel={onCancel}
        onSave={onSave}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Decrease points to win' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSave).not.toHaveBeenCalled()
  })
})