import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Minus, Plus, Settings } from 'lucide-react'
import {
  DEFAULT_GENERAL_SETTINGS,
  normalizeGeneralSettings,
  type GeneralSettings,
} from './generalSettings'
import {
  normalizeMatchSettings,
  type MatchSettings,
} from './matchSettings'

interface MatchSettingsDialogProps {
  generalSettings?: GeneralSettings
  isLocked?: boolean
  settings: MatchSettings
  onCancel: () => void
  onSave: (settings: MatchSettings) => void
  onSaveGeneralSettings?: (settings: GeneralSettings) => void
  onStartTutorial?: () => void
}

interface SettingStepperProps {
  label: string
  maximum: number
  minimum: number
  onChange: (value: number) => void
  value: number
}

type SettingsTab = 'match' | 'general'

function SettingStepper({
  label,
  maximum,
  minimum,
  onChange,
  value,
}: SettingStepperProps) {
  return (
    <div className="settings-row">
      <span>{label}</span>
      <div className="settings-stepper">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= minimum}
          onClick={() => onChange(value - 1)}
        >
          <Minus aria-hidden="true" />
        </button>
        <output aria-label={label}>{value}</output>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= maximum}
          onClick={() => onChange(value + 1)}
        >
          <Plus aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function MatchSettingsDialog({
  generalSettings = DEFAULT_GENERAL_SETTINGS,
  isLocked = false,
  settings,
  onCancel,
  onSave,
  onSaveGeneralSettings = () => undefined,
  onStartTutorial,
}: MatchSettingsDialogProps) {
  const [draft, setDraft] = useState(settings)
  const [generalDraft, setGeneralDraft] = useState(generalSettings)
  const [activeTab, setActiveTab] = useState<SettingsTab>('match')
  const tabRefs = useRef<Record<SettingsTab, HTMLButtonElement | null>>({
    match: null,
    general: null,
  })

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  const updatePointsToWin = (pointsToWin: number) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      pointsToWin,
      maximumScore: Math.max(pointsToWin, currentDraft.maximumScore),
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (activeTab === 'match') {
      onSave(normalizeMatchSettings(draft))
    } else {
      onSaveGeneralSettings(normalizeGeneralSettings(generalDraft))
    }
  }

  const selectTab = (tab: SettingsTab, shouldFocus = false) => {
    setActiveTab(tab)
    if (shouldFocus) {
      tabRefs.current[tab]?.focus()
    }
  }

  const handleTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    tab: SettingsTab,
  ) => {
    let nextTab: SettingsTab | null = null

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      nextTab = tab === 'match' ? 'general' : 'match'
    }

    if (event.key === 'Home') {
      nextTab = 'match'
    }

    if (event.key === 'End') {
      nextTab = 'general'
    }

    if (nextTab) {
      event.preventDefault()
      selectTab(nextTab, true)
    }
  }

  return (
    <div className="scoreboard-dialog-layer">
      <button
        className="scoreboard-dialog__backdrop"
        type="button"
        aria-label="Cancel match settings"
        onClick={onCancel}
      />
      <section
        className="scoreboard-dialog scoreboard-dialog--settings"
        role="dialog"
        aria-labelledby="settings-dialog-title"
        aria-modal="true"
      >
        <header className="scoreboard-dialog__header scoreboard-dialog__header--settings">
          <Settings aria-hidden="true" />
          <h2 id="settings-dialog-title" className="visually-hidden">
            Settings
          </h2>
          <div
            className="settings-tabs"
            role="tablist"
            aria-label="Settings sections"
            data-active-tab={activeTab}
          >
            <button
              ref={(element) => {
                tabRefs.current.match = element
              }}
              id="match-settings-tab"
              className="settings-tab"
              type="button"
              role="tab"
              aria-controls="match-settings-panel"
              aria-selected={activeTab === 'match'}
              autoFocus
              tabIndex={activeTab === 'match' ? 0 : -1}
              onClick={() => selectTab('match')}
              onKeyDown={(event) => handleTabKeyDown(event, 'match')}
            >
              Match settings
            </button>
            <button
              ref={(element) => {
                tabRefs.current.general = element
              }}
              id="general-settings-tab"
              className="settings-tab"
              type="button"
              role="tab"
              aria-controls="general-settings-panel"
              aria-selected={activeTab === 'general'}
              tabIndex={activeTab === 'general' ? 0 : -1}
              onClick={() => selectTab('general')}
              onKeyDown={(event) => handleTabKeyDown(event, 'general')}
            >
              General settings
            </button>
          </div>
        </header>
        <form onSubmit={handleSubmit}>
          {activeTab === 'match' ? (
            <div
              id="match-settings-panel"
              className="settings-tab-panel"
              role="tabpanel"
              aria-labelledby="match-settings-tab"
            >
              {isLocked && (
                <p className="scoreboard-dialog__lock-message">
                  Point settings are locked until current scores and completed sets are reset.
                </p>
              )}
              <fieldset disabled={isLocked}>
                <SettingStepper
                  label="Points to win"
                  minimum={1}
                  maximum={99}
                  value={draft.pointsToWin}
                  onChange={updatePointsToWin}
                />
                <label className="settings-row settings-row--toggle">
                  <span>Win by two points</span>
                  <input
                    type="checkbox"
                    checked={draft.winByTwo}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        winByTwo: event.target.checked,
                      }))
                    }
                  />
                </label>
                <SettingStepper
                  label="Maximum score"
                  minimum={draft.pointsToWin}
                  maximum={99}
                  value={draft.maximumScore}
                  onChange={(maximumScore) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      maximumScore,
                    }))
                  }
                />
              </fieldset>
              <SettingStepper
                label="Games to win"
                minimum={1}
                maximum={5}
                value={draft.gamesToWin}
                onChange={(gamesToWin) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    gamesToWin,
                  }))
                }
              />
              <div className="scoreboard-dialog__actions">
                <button
                  type="button"
                  className="dialog-button"
                  data-tutorial-id="settings-cancel"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dialog-button dialog-button--primary"
                >
                  Save settings
                </button>
              </div>
            </div>
          ) : (
            <div
              id="general-settings-panel"
              className="settings-tab-panel"
              role="tabpanel"
              aria-labelledby="general-settings-tab"
            >
              <fieldset>
                <label className="settings-row settings-row--toggle">
                  <span>Keep screen awake</span>
                  <input
                    type="checkbox"
                    checked={generalDraft.keepScreenAwakeEnabled}
                    onChange={(event) =>
                      setGeneralDraft((currentDraft) => ({
                        ...currentDraft,
                        keepScreenAwakeEnabled: event.target.checked,
                      }))
                    }
                  />
                </label>
                <label className="settings-row settings-row--toggle">
                  <span>Team serve indicator</span>
                  <input
                    type="checkbox"
                    checked={generalDraft.teamServeIndicatorEnabled}
                    onChange={(event) =>
                      setGeneralDraft((currentDraft) => ({
                        ...currentDraft,
                        teamServeIndicatorEnabled: event.target.checked,
                      }))
                    }
                  />
                </label>
                <label className="settings-row settings-row--toggle">
                  <span>Player serve indicator</span>
                  <input
                    type="checkbox"
                    checked={generalDraft.playerServeIndicatorEnabled}
                    onChange={(event) =>
                      setGeneralDraft((currentDraft) => ({
                        ...currentDraft,
                        playerServeIndicatorEnabled: event.target.checked,
                      }))
                    }
                  />
                </label>
                <label className="settings-row settings-row--toggle">
                  <span>Raise bottom half circle</span>
                  <input
                    type="checkbox"
                    checked={generalDraft.raiseBottomHistoryControlEnabled}
                    onChange={(event) =>
                      setGeneralDraft((currentDraft) => ({
                        ...currentDraft,
                        raiseBottomHistoryControlEnabled: event.target.checked,
                      }))
                    }
                  />
                </label>
              </fieldset>
              <div className="scoreboard-dialog__actions">
                {onStartTutorial && (
                  <button
                    type="button"
                    className="dialog-button"
                    onClick={onStartTutorial}
                  >
                    Tutorial
                  </button>
                )}
                <button
                  type="submit"
                  className="dialog-button dialog-button--primary"
                >
                  Save settings
                </button>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  )
}