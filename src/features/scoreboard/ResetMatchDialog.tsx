import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ResetMatchDialogProps {
  forceResetCompletedSets?: boolean
  onCancel: () => void
  onConfirm: (resetCompletedSets: boolean) => void
}

export function ResetMatchDialog({
  forceResetCompletedSets = false,
  onCancel,
  onConfirm,
}: ResetMatchDialogProps) {
  const [resetCompletedSets, setResetCompletedSets] = useState(
    forceResetCompletedSets,
  )
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  return (
    <div className="scoreboard-dialog-layer">
      <button
        className="scoreboard-dialog__backdrop"
        type="button"
        aria-label="Cancel match reset"
        onClick={onCancel}
      />
      <section
        className="scoreboard-dialog scoreboard-dialog--confirmation"
        role="alertdialog"
        aria-labelledby="reset-match-title"
        aria-describedby="reset-match-description"
        aria-modal="true"
      >
        <AlertTriangle className="scoreboard-dialog__icon" aria-hidden="true" />
        <h2 id="reset-match-title">Reset match?</h2>
        <p id="reset-match-description">
          The current game score and service will be cleared. Team names and match settings will be kept.
        </p>
        <label className="reset-scope-option">
          <input
            type="checkbox"
            checked={resetCompletedSets}
            disabled={forceResetCompletedSets}
            onChange={(event) => setResetCompletedSets(event.target.checked)}
          />
          <span>Also reset completed sets</span>
        </label>
        {forceResetCompletedSets && (
          <p className="scoreboard-dialog__note">
            Completed sets must be cleared before starting a new match.
          </p>
        )}
        <div className="scoreboard-dialog__actions">
          <button
            type="button"
            className="dialog-button"
            data-tutorial-id="reset-cancel"
            autoFocus
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dialog-button dialog-button--danger"
            onClick={() => onConfirm(resetCompletedSets)}
          >
            Reset match
          </button>
        </div>
      </section>
    </div>
  )
}