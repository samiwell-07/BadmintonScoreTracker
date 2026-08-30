interface TutorialExitDialogProps {
  onContinue: () => void
  onSkipAll: () => void
}

export function TutorialExitDialog({
  onContinue,
  onSkipAll,
}: TutorialExitDialogProps) {
  return (
    <div className="tutorial-exit-layer" data-tutorial-control>
      <section
        className="tutorial-exit"
        role="alertdialog"
        aria-labelledby="tutorial-exit-title"
        aria-describedby="tutorial-exit-description"
        aria-modal="true"
      >
        <h2 id="tutorial-exit-title">Exit tutorial?</h2>
        <p id="tutorial-exit-description">
          Your real match will be restored. You can replay the tutorial from
          General settings.
        </p>
        <div className="tutorial-exit__actions">
          <button
            type="button"
            className="dialog-button"
            autoFocus
            onClick={onContinue}
          >
            Keep learning
          </button>
          <button
            type="button"
            className="dialog-button dialog-button--danger"
            onClick={onSkipAll}
          >
            Skip all
          </button>
        </div>
      </section>
    </div>
  )
}