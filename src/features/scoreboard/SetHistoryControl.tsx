import { ArrowLeft, History } from 'lucide-react'
import type { CompletedSet } from './scoreboard.types'

interface SetHistoryControlProps {
  completedSets: CompletedSet[]
  isOpen: boolean
  selectedSetNumber: number | null
  onBack: () => void
  onSelect: (setNumber: number) => void
  onToggle: () => void
}

export function SetHistoryControl({
  completedSets,
  isOpen,
  selectedSetNumber,
  onBack,
  onSelect,
  onToggle,
}: SetHistoryControlProps) {
  if (completedSets.length === 0) return null

  if (selectedSetNumber !== null) {
    return (
      <div className="set-history-control set-history-control--archive">
        <button className="set-history-control__toggle" type="button" aria-label="Back to live match" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className={`set-history-control${isOpen ? ' set-history-control--open' : ''}`}>
      {isOpen && (
        <div className="set-history-control__list" aria-label="Completed sets">
          {completedSets.map((set) => {
            const winnerName = set.winner === 'left' ? set.leftName : set.rightName
            return (
              <button key={set.setNumber} type="button" onClick={() => onSelect(set.setNumber)}>
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