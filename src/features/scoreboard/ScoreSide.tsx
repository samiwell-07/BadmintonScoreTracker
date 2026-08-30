import {
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { triggerHaptic } from './haptics'
import type {
  PlayerIndex,
  PlayerNames,
  SideId,
} from './scoreboard.types'

interface PlayerSelection {
  choices: PlayerIndex[]
  prompt: string
}

const DRAG_TOLERANCE = 8
const MIN_SWIPE_DISTANCE = 60

interface PointerStart {
  pointerId: number
  x: number
  y: number
  bounds: DOMRect
  hasDragged: boolean
}

interface ScoreSideProps {
  hapticsEnabled?: boolean
  isReadOnly?: boolean
  isSelectingService: boolean
  isServing: boolean
  playerNames: PlayerNames
  playerSelection?: PlayerSelection | null
  servingPlayerIndex?: PlayerIndex | null
  showPlayerServeIndicator: boolean
  showTeamServeIndicator: boolean
  showTeamServiceTarget: boolean
  side: SideId
  name: string
  score: number
  onAddPoint: () => void
  onRemovePoint: () => void
  onNameChange: (name: string) => void
  onNameEditStart?: () => void
  onPlayerNameChange: (playerIndex: PlayerIndex, name: string) => void
  onSelectService: () => void
  onSelectPlayer: (playerIndex: PlayerIndex) => void
  onTransferPoint: (destination: SideId) => void
}

export function ScoreSide({
  hapticsEnabled = true,
  isReadOnly = false,
  isSelectingService,
  isServing,
  playerNames,
  playerSelection = null,
  servingPlayerIndex = null,
  showPlayerServeIndicator,
  showTeamServeIndicator,
  showTeamServiceTarget,
  side,
  name,
  score,
  onAddPoint,
  onRemovePoint,
  onNameChange,
  onNameEditStart = () => undefined,
  onPlayerNameChange,
  onSelectService,
  onSelectPlayer,
  onTransferPoint,
}: ScoreSideProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const [editingPlayerIndex, setEditingPlayerIndex] =
    useState<PlayerIndex | null>(null)
  const [draftPlayerName, setDraftPlayerName] = useState('')
  const pointerStart = useRef<PointerStart | null>(null)
  const suppressNextClick = useRef(false)
  const servingPlayerName =
    showPlayerServeIndicator && servingPlayerIndex !== null
      ? playerNames[servingPlayerIndex]
      : null

  const suppressFollowingClick = () => {
    suppressNextClick.current = true
    window.setTimeout(() => {
      suppressNextClick.current = false
    }, 0)
  }

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (isReadOnly || isSelectingService) {
      return
    }

    const isPrimaryMouseButton = event.pointerType !== 'mouse' || event.button === 0

    if (!event.isPrimary || !isPrimaryMouseButton) {
      return
    }

    pointerStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      bounds: event.currentTarget.getBoundingClientRect(),
      hasDragged: false,
    }

    const captureTarget =
      event.target instanceof Element ? event.target : event.currentTarget
    captureTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const start = pointerStart.current

    if (!start || start.pointerId !== event.pointerId) {
      return
    }

    const horizontalTravel = event.clientX - start.x
    const verticalTravel = event.clientY - start.y

    if (Math.hypot(horizontalTravel, verticalTravel) >= DRAG_TOLERANCE) {
      start.hasDragged = true
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = pointerStart.current

    if (!start || start.pointerId !== event.pointerId) {
      return
    }

    pointerStart.current = null

    if (!start.hasDragged) {
      return
    }

    suppressFollowingClick()

    const { bounds } = start
    const midpoint = bounds.top + bounds.height / 2
    const minimumDistance = Math.max(MIN_SWIPE_DISTANCE, bounds.height * 0.25)
    const horizontalTravel = event.clientX - start.x
    const verticalTravel = event.clientY - start.y
    const minimumHorizontalDistance = Math.max(
      MIN_SWIPE_DISTANCE,
      bounds.width * 0.35,
    )
    const isHorizontalTransfer =
      Math.abs(horizontalTravel) > Math.abs(verticalTravel) &&
      Math.abs(horizontalTravel) >= minimumHorizontalDistance &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom &&
      ((side === 'left' && event.clientX > bounds.right) ||
        (side === 'right' && event.clientX < bounds.left))

    if (isHorizontalTransfer) {
      onTransferPoint(side === 'left' ? 'right' : 'left')
      triggerHaptic('swipe', hapticsEnabled)
      return
    }

    const endsInsidePanel =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom

    if (
      start.y < midpoint &&
      event.clientY > midpoint &&
      verticalTravel >= minimumDistance &&
      endsInsidePanel
    ) {
      if (score > 0) {
        onRemovePoint()
        triggerHaptic('swipe', hapticsEnabled)
      }
    }
  }

  const handleAddPoint = () => {
    onAddPoint()
    triggerHaptic('point', hapticsEnabled)
  }

  const handlePointerCancel = () => {
    if (pointerStart.current?.hasDragged) {
      suppressFollowingClick()
    }

    pointerStart.current = null
  }

  const handleClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!suppressNextClick.current) {
      return
    }

    suppressNextClick.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  const commitName = () => {
    const nextName = draftName.trim()

    if (nextName) {
      onNameChange(nextName)
    } else {
      setDraftName(name)
    }

    setIsEditingName(false)
  }

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setDraftName(name)
      setIsEditingName(false)
    }
  }

  const beginPlayerNameEdit = (playerIndex: PlayerIndex) => {
    if (isReadOnly || isSelectingService) {
      return
    }

    setEditingPlayerIndex(playerIndex)
    setDraftPlayerName(playerNames[playerIndex])
  }

  const commitPlayerName = () => {
    if (editingPlayerIndex === null) {
      return
    }

    onPlayerNameChange(
      editingPlayerIndex,
      draftPlayerName.trim() || `Player ${editingPlayerIndex + 1}`,
    )
    setEditingPlayerIndex(null)
  }

  const handlePlayerNameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setEditingPlayerIndex(null)
      setDraftPlayerName('')
    }
  }

  return (
    <section
      className={`score-side score-side--${side}${isSelectingService ? ' score-side--selecting-service' : ''}${isServing ? ' score-side--serving' : ''}`}
      data-tutorial-id={`side-${side}`}
      onClickCapture={handleClickCapture}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <button
        className="score-side__point-target"
        data-tutorial-id={`score-${side}`}
        type="button"
        aria-label={`Add a point to ${name}`}
        disabled={isReadOnly}
        onClick={handleAddPoint}
      />
      <div className="score-side__content">
        {showPlayerServeIndicator ? (
          <div
            className="score-side__players"
            aria-label={`${name} players`}
          >
            {playerNames.map((playerName, playerIndex) =>
              editingPlayerIndex === playerIndex ? (
                <span className="score-side__player-row" key={playerIndex}>
                  <input
                    className="score-side__player-input"
                    type="text"
                    value={draftPlayerName}
                    aria-label={`Name for ${side} player ${playerIndex + 1}`}
                    autoFocus
                    maxLength={40}
                    onBlur={commitPlayerName}
                    onChange={(event) =>
                      setDraftPlayerName(event.target.value)
                    }
                    onFocus={(event) => event.currentTarget.select()}
                    onKeyDown={handlePlayerNameKeyDown}
                  />
                  {isServing && servingPlayerIndex === playerIndex && (
                    <span
                      className="score-side__service-marker"
                      aria-hidden="true"
                    />
                  )}
                </span>
              ) : (
                <button
                  className="score-side__player-name"
                  type="button"
                  aria-label={`Edit ${playerName} for ${name}`}
                  data-tutorial-id={
                    side === 'left' && playerIndex === 0
                      ? 'name-left'
                      : undefined
                  }
                  disabled={isReadOnly || isSelectingService}
                  key={playerIndex}
                  onClick={() => {
                    beginPlayerNameEdit(playerIndex as PlayerIndex)
                    onNameEditStart()
                  }}
                >
                  <span>{playerName}</span>
                  {isServing && servingPlayerIndex === playerIndex && (
                    <span
                      className="score-side__service-marker"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ),
            )}
          </div>
        ) : isEditingName ? (
          <input
            className="score-side__name score-side__name-input"
            type="text"
            value={draftName}
            aria-label={`Name for ${side} side`}
            autoFocus
            maxLength={40}
            onBlur={commitName}
            onChange={(event) => setDraftName(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={handleNameKeyDown}
          />
        ) : (
          <button
            className="score-side__name score-side__name-button"
            type="button"
            aria-label={name}
            data-tutorial-id={side === 'left' ? 'name-left' : undefined}
            disabled={isReadOnly}
            onClick={() => {
              setIsEditingName(true)
              onNameEditStart()
            }}
          >
            <span>{name}</span>
            {isServing && showTeamServeIndicator && (
              <span className="score-side__service-marker" aria-hidden="true" />
            )}
          </button>
        )}
        <output
          className="score-side__score"
          aria-label={`${name} score`}
          aria-live="polite"
        >
          {score}
        </output>
      </div>
      {isServing &&
        (servingPlayerName ||
          (!showPlayerServeIndicator && showTeamServeIndicator)) && (
        <span
          className="visually-hidden"
          role="status"
          aria-label={
            servingPlayerName
              ? `${servingPlayerName} of ${name} is serving`
              : `${name} is serving`
          }
        >
          {servingPlayerName
            ? `${servingPlayerName} of ${name} is serving`
            : `${name} is serving`}
        </span>
      )}
      {isSelectingService && showTeamServiceTarget && !isReadOnly && (
        <button
          className="score-side__service-target"
          type="button"
          aria-label={`Select ${name} to serve`}
          data-tutorial-id={`team-service-${side}`}
          onClick={onSelectService}
        />
      )}
      {isSelectingService && playerSelection && !isReadOnly && (
        <div className="score-side__player-selection">
          <p>{playerSelection.prompt}</p>
          <div>
            {playerSelection.choices.map((playerIndex) => (
              <button
                key={playerIndex}
                type="button"
                aria-label={`Select ${playerNames[playerIndex]} of ${name}`}
                data-tutorial-id={`player-choice-${side}-${playerIndex}`}
                onClick={() => onSelectPlayer(playerIndex)}
              >
                {playerNames[playerIndex]}
              </button>
            ))}
          </div>
        </div>
      )}
      {isSelectingService &&
        !showTeamServiceTarget &&
        !playerSelection &&
        !isReadOnly && (
          <div className="score-side__service-blocker" aria-hidden="true" />
        )}
    </section>
  )
}