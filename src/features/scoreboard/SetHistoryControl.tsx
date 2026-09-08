import { ArrowLeft, History } from 'lucide-react'
import type { CompletedSet } from './scoreboard.types'

interface SetHistoryControlProps {
  completedSets: CompletedSet[]
  isOpen: boolean
  raiseCircle: boolean
  selectedSetNumber: number | null
  onBack: () => void
  onSelect: (setNumber: number) => void
  onToggle: () => void
}

export function SetHistoryControl({
  completedSets,
  isOpen,
  raiseCircle,
  selectedSetNumber,
  onBack,
  onSelect,
  onToggle,
}: SetHistoryControlProps) {
  if (completedSets.length === 0) return null

  if (selectedSetNumber !== null) {
    return (
      <div
        className={`set-history-control set-history-control--archive${raiseCircle ? ' set-history-control--raised' : ''}`}
      >
        <button
          className="set-history-control__toggle"
          type="button"
          aria-label="Back to live match"
          data-tutorial-id="history-back"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={`set-history-control${isOpen ? ' set-history-control--open' : ''}${raiseCircle ? ' set-history-control--raised' : ''}`}
    >
      {isOpen && (
        <div className="set-history-control__list" aria-label="Completed sets">
          {completedSets.map((set) => {
            const winnerName = set.winner === 'left' ? set.leftName : set.rightName
            return (
              <button
                key={set.setNumber}
                type="button"
                data-tutorial-id={`history-set-${set.setNumber}`}
                onClick={() => onSelect(set.setNumber)}
              >
                <span>Set {set.setNumber}</span>
                <strong>{winnerName}</strong>
                <span>{set.leftScore} - {set.rightScore}</span>
              </button>
            )
          })}
        </div>
      )}
      <button
        className="set-history-control__toggle"
        data-tutorial-id="history-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close set history' : 'Open set history'}
        onClick={onToggle}
      >
        <History aria-hidden="true" />
      </button>
    </div>
  )
}
