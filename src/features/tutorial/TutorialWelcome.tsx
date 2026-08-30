interface TutorialWelcomeProps {
  onSkipAll: () => void
  onStart: () => void
}

export function TutorialWelcome({
  onSkipAll,
  onStart,
}: TutorialWelcomeProps) {
  return (
    <div className="tutorial-welcome-layer">
      <section
        className="tutorial-welcome"
        role="dialog"
        aria-labelledby="tutorial-welcome-title"
        aria-modal="true"
      >
        <p className="tutorial-welcome__eyebrow">Quick interactive guide</p>
        <h2 id="tutorial-welcome-title">Learn the score tracker</h2>
        <p>
          Practice scoring, gestures, match tools, service, history, and result
          actions. Your real match will be restored when you leave.
        </p>
        <div className="tutorial-welcome__actions">
          <button
            type="button"
            className="dialog-button"
            onClick={onSkipAll}
          >
            Skip all
          </button>
          <button
            type="button"
            className="dialog-button dialog-button--primary"
            autoFocus
            onClick={onStart}
          >
            Start tutorial
          </button>
        </div>
      </section>
    </div>
  )
}