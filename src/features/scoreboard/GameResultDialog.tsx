import { useEffect, useRef, useState } from 'react'
import { Copy, Share2, Trophy } from 'lucide-react'
import {
  copyResultText,
  createResultImage,
  formatResultText,
  shareResultImage,
  type ResultShareData,
} from './resultSharing'
import type { CompletedSet, MatchPhase } from './scoreboard.types'

type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed'
type ShareStatus =
  | 'idle'
  | 'creating'
  | 'shared'
  | 'ready'
  | 'downloaded'
  | 'cancelled'
  | 'failed'

const COPY_LABELS: Record<CopyStatus, string> = {
  idle: 'Copy text',
  copying: 'Copying...',
  copied: 'Copied',
  failed: 'Copy failed',
}

const SHARE_LABELS: Record<ShareStatus, string> = {
  idle: 'Share image',
  creating: 'Creating...',
  shared: 'Shared',
  ready: 'Image ready',
  downloaded: 'Downloaded',
  cancelled: 'Cancelled',
  failed: 'Share failed',
}

interface GameResultDialogProps {
  completedSet: CompletedSet
  leftSetsWon: number
  phase: Exclude<MatchPhase, 'playing'>
  rightSetsWon: number
  onCloseMatch: () => void
  onNewMatch: () => void
  onNextGame: () => void
  onUndoWinningPoint: () => void
  onTutorialAction?: (action: 'copy' | 'share') => void
  tutorialSafeShare?: boolean
}

export function GameResultDialog({
  completedSet,
  leftSetsWon,
  phase,
  rightSetsWon,
  onCloseMatch,
  onNewMatch,
  onNextGame,
  onUndoWinningPoint,
  onTutorialAction = () => undefined,
  tutorialSafeShare = false,
}: GameResultDialogProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle')
  const copyTimer = useRef<number | null>(null)
  const shareTimer = useRef<number | null>(null)
  const winnerName = completedSet.winner === 'left'
    ? completedSet.leftName
    : completedSet.rightName
  const isMatchWon = phase === 'matchWon'
  const shareData: ResultShareData = {
    completedSet,
    leftSetsWon,
    phase,
    rightSetsWon,
  }

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
      if (shareTimer.current !== null) window.clearTimeout(shareTimer.current)
    },
    [],
  )

  useEffect(() => {
    if (!isMatchWon) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMatch()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMatchWon, onCloseMatch])

  const resetCopyLabel = () => {
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => {
      setCopyStatus('idle')
      copyTimer.current = null
    }, 2000)
  }

  const resetShareLabel = () => {
    if (shareTimer.current !== null) window.clearTimeout(shareTimer.current)
    shareTimer.current = window.setTimeout(() => {
      setShareStatus('idle')
      shareTimer.current = null
    }, 2000)
  }

  const handleCopy = async () => {
    setCopyStatus('copying')
    try {
      await copyResultText(formatResultText(shareData))
      setCopyStatus('copied')
      onTutorialAction('copy')
    } catch {
      setCopyStatus('failed')
    }
    resetCopyLabel()
  }

  const handleShare = async () => {
    setShareStatus('creating')
    try {
      const image = await createResultImage(shareData)
      if (tutorialSafeShare) {
        setShareStatus('ready')
      } else {
        setShareStatus(await shareResultImage(image, shareData))
      }
      onTutorialAction('share')
    } catch {
      setShareStatus('failed')
    }
    resetShareLabel()
  }

  return (
    <div className="scoreboard-dialog-layer">
      <div className="scoreboard-dialog__backdrop" />
      <section
        className="scoreboard-dialog scoreboard-dialog--result"
        data-tutorial-id="game-result-dialog"
        role="alertdialog"
        aria-labelledby="game-result-title"
        aria-modal="true"
      >
        <Trophy className="scoreboard-dialog__result-icon" aria-hidden="true" />
        <p className="scoreboard-dialog__eyebrow">
          {isMatchWon ? 'Match winner' : `Set ${completedSet.setNumber} winner`}
        </p>
        <h2 id="game-result-title">{winnerName}</h2>
        <p className="scoreboard-dialog__final-score">
          {completedSet.leftScore} - {completedSet.rightScore}
        </p>
        <p>Sets won: {leftSetsWon} - {rightSetsWon}</p>
        <div className="scoreboard-dialog__share-actions">
          <button
            type="button"
            className="dialog-button dialog-button--share"
            data-tutorial-id="result-copy"
            disabled={copyStatus === 'copying'}
            onClick={handleCopy}
          >
            <Copy aria-hidden="true" />
            <span>{COPY_LABELS[copyStatus]}</span>
          </button>
          <button
            type="button"
            className="dialog-button dialog-button--share"
            data-tutorial-id="result-share"
            disabled={shareStatus === 'creating'}
            onClick={handleShare}
          >
            <Share2 aria-hidden="true" />
            <span>{SHARE_LABELS[shareStatus]}</span>
          </button>
        </div>
        <div className="scoreboard-dialog__actions scoreboard-dialog__actions--result">
          <button
            type="button"
            className="dialog-button"
            data-tutorial-id="result-undo"
            onClick={onUndoWinningPoint}
          >
            Undo winning point
          </button>
          {isMatchWon ? (
            <>
              <button type="button" className="dialog-button" onClick={onCloseMatch}>
                Close
              </button>
              <button type="button" className="dialog-button dialog-button--primary" onClick={onNewMatch}>
                New match
              </button>
            </>
          ) : (
            <button
              type="button"
              className="dialog-button dialog-button--primary"
              data-tutorial-id="result-next"
              autoFocus
              onClick={onNextGame}
            >
              Next game
            </button>
          )}
        </div>
      </section>
    </div>
  )
}