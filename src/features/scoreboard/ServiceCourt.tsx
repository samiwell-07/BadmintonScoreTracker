import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { ArrowUpDown, X } from 'lucide-react'
import {
  COURT_ASPECT_RATIO,
  clampCourtPosition,
  clampCourtWidth,
  getServeFlight,
  loadCourtPosition,
  loadCourtWidth,
  saveCourtPosition,
  saveCourtWidth,
  snapCourtPosition,
  type CourtPosition,
  type ServeFlight,
  type CourtViewModel,
} from './serviceCourtModel'
import type { PlayerIndex, SideId } from './scoreboard.types'
import './service-court.css'

const DRAG_TOLERANCE = 8
const KEYBOARD_MOVE = 16

interface DragState {
  hasDragged: boolean
  height: number
  lastPosition: CourtPosition
  pointerId: number
  startCenterX: number
  startCenterY: number
  startX: number
  startY: number
  width: number
}

interface PointerPoint {
  x: number
  y: number
}

interface PinchState {
  initialDistance: number
  initialWidth: number
  lastPosition: CourtPosition
  lastWidth: number
}

interface ServiceCourtProps {
  canEdit: boolean
  leftName: string
  model: CourtViewModel
  onAssignServer: (side: SideId, playerIndex: PlayerIndex) => void
  onSwapPlayers: (side: SideId) => void
  rightName: string
}

interface SelectedPlayer {
  label: string
  playerIndex: PlayerIndex
  side: SideId
}

interface ShuttleFlight extends ServeFlight {
  id: number
}

const sideName = (
  side: SideId,
  leftName: string,
  rightName: string,
) => side === 'left' ? leftName : rightName

const describeCourt = ({
  leftName,
  model,
  rightName,
}: ServiceCourtProps) => {
  const server = model.cells.find(({ isServer }) => isServer)
  if (server?.label) {
    return `${server.label} of ${sideName(server.side, leftName, rightName)} is serving from the ${server.row} court.`
  }

  const serviceCourt = model.cells.find(({ isServiceCourt }) => isServiceCourt)
  if (serviceCourt) {
    return `${sideName(serviceCourt.side, leftName, rightName)} serves from the ${serviceCourt.row} court.`
  }

  return 'No server selected.'
}

function MiniCourtSurface({ model }: Pick<ServiceCourtProps, 'model'>) {
  return (
    <span className="service-court__surface" aria-hidden="true">
      {model.cells.map((cell) => (
        <span
          className={`service-court__cell service-court__cell--${cell.side}-${cell.row}${cell.isServiceCourt ? ' service-court__cell--serving' : ''}`}
          key={`${cell.side}-${cell.row}`}
        >
          {cell.label && (
            <span
              className={`service-court__player${cell.isServer ? ' service-court__player--server' : ''}`}
            >
              {cell.label}
            </span>
          )}
        </span>
      ))}
      <span className="service-court__net" />
    </span>
  )
}

function ShuttlecockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="service-court__shuttle-icon"
      viewBox="0 0 32 32"
    >
      <path d="M5 4h22l-7 17h-8z" />
      <path d="m10.5 4 3.5 17M16 4v17M21.5 4 18 21" />
      <path d="M11.5 21h9v2.5a4.5 4.5 0 0 1-9 0z" />
    </svg>
  )
}

interface ExpandedCourtProps extends ServiceCourtProps {
  flight: ShuttleFlight | null
  onSelectPlayer: (player: SelectedPlayer) => void
  selectedPlayer: SelectedPlayer | null
}

function ExpandedCourt({
  canEdit,
  flight,
  leftName,
  model,
  onSelectPlayer,
  onSwapPlayers,
  rightName,
  selectedPlayer,
}: ExpandedCourtProps) {
  const teamName = (side: SideId) => side === 'left' ? leftName : rightName
  const flightPath = flight
    ? `M ${flight.fromX} ${flight.fromY} Q 50 6 ${flight.toX} ${flight.toY}`
    : null
  const gradientId = flight ? `service-court-trail-${flight.id}` : null

  return (
    <div className="service-court__surface service-court__surface--expanded">
      {model.cells.map((cell) => {
        const isSelected =
          selectedPlayer?.side === cell.side &&
          selectedPlayer.playerIndex === cell.playerIndex
        return (
          <div
            className={`service-court__cell service-court__cell--${cell.side}-${cell.row}${cell.isServiceCourt ? ' service-court__cell--serving' : ''}`}
            key={`${cell.side}-${cell.row}`}
          >
            {cell.label && cell.playerIndex !== null && (
              <button
                type="button"
                className={`service-court__player service-court__player--interactive${cell.isServer ? ' service-court__player--server' : ''}${isSelected ? ' service-court__player--selected' : ''}`}
                aria-label={`Select ${cell.label} of ${teamName(cell.side)}`}
                aria-pressed={isSelected}
                disabled={!canEdit}
                onClick={() =>
                  onSelectPlayer({
                    label: cell.label!,
                    playerIndex: cell.playerIndex!,
                    side: cell.side,
                  })
                }
              >
                {cell.label}
              </button>
            )}
          </div>
        )
      })}
      {model.mode === 'player' && (
        <>
          {(['left', 'right'] as SideId[]).map((side) => (
            <button
              type="button"
              className={`service-court__swap service-court__swap--${side}`}
              aria-label={`Swap ${teamName(side)} player positions`}
              disabled={!canEdit}
              key={side}
              onClick={() => onSwapPlayers(side)}
            >
              <ArrowUpDown aria-hidden="true" />
            </button>
          ))}
        </>
      )}
      <span className="service-court__net" />
      {flight && flightPath && (
        <svg
          key={flight.id}
          className="service-court__serve-path"
          data-flight={`${flight.fromX}-${flight.fromY}-${flight.toX}-${flight.toY}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={gradientId!}
              x1={flight.fromX}
              y1={flight.fromY}
              x2={flight.toX}
              y2={flight.toY}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#ffd166" stopOpacity="0">
                <animate
                  attributeName="offset"
                  calcMode="linear"
                  dur="2.8s"
                  keyTimes="0;0.06;0.62;0.68;1"
                  repeatCount="indefinite"
                  values="0;0;0.35;1;1"
                />
              </stop>
              <stop offset="0" stopColor="#ffd166" stopOpacity="0.25">
                <animate
                  attributeName="offset"
                  calcMode="linear"
                  dur="2.8s"
                  keyTimes="0;0.06;0.62;0.68;1"
                  repeatCount="indefinite"
                  values="0;0;0.6;1;1"
                />
              </stop>
              <stop offset="0.01" stopColor="#ffd166" stopOpacity="0.65">
                <animate
                  attributeName="offset"
                  calcMode="linear"
                  dur="2.8s"
                  keyTimes="0;0.06;0.62;0.68;1"
                  repeatCount="indefinite"
                  values="0;0.01;0.82;1;1"
                />
              </stop>
              <stop offset="0.02" stopColor="#fffdf7" stopOpacity="1">
                <animate
                  attributeName="offset"
                  calcMode="linear"
                  dur="2.8s"
                  keyTimes="0;0.06;0.62;0.68;1"
                  repeatCount="indefinite"
                  values="0;0.02;1;1;1"
                />
              </stop>
              <stop offset="0.04" stopColor="#fffdf7" stopOpacity="0">
                <animate
                  attributeName="offset"
                  calcMode="linear"
                  dur="2.8s"
                  keyTimes="0;0.06;0.62;0.68;1"
                  repeatCount="indefinite"
                  values="0;0.04;1;1;1"
                />
              </stop>
            </linearGradient>
          </defs>
          <path
            className="service-court__serve-trail"
            d={flightPath}
            pathLength="100"
            stroke={`url(#${gradientId})`}
          >
            <animate
              attributeName="opacity"
              calcMode="linear"
              dur="2.8s"
              keyTimes="0;0.06;0.62;0.68;1"
              repeatCount="indefinite"
              values="0;1;1;0;0"
            />
          </path>
        </svg>
      )}
    </div>
  )
}

export function ServiceCourt(props: ServiceCourtProps) {
  const [position, setPosition] = useState(loadCourtPosition)
  const [courtWidth, setCourtWidth] = useState(() =>
    loadCourtWidth(window.innerWidth),
  )
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null)
  const [flight, setFlight] = useState<ShuttleFlight | null>(null)
  const miniCourtRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const flightIdRef = useRef(0)
  const activePointersRef = useRef(new Map<number, PointerPoint>())
  const dragRef = useRef<DragState | null>(null)
  const pinchRef = useRef<PinchState | null>(null)
  const suppressClickRef = useRef(false)
  const description = describeCourt(props)

  const clampPosition = (
    nextPosition: CourtPosition,
    width: number,
    height: number,
  ) => clampCourtPosition(
    nextPosition,
    { width: window.innerWidth, height: window.innerHeight },
    { width, height },
  )

  useEffect(() => {
    const handleResize = () => {
      setCourtWidth((currentWidth) => {
        const nextWidth = clampCourtWidth(currentWidth, window.innerWidth)
        setPosition((currentPosition) => {
          const nextPosition = clampPosition(
            currentPosition,
            nextWidth,
            nextWidth / COURT_ASPECT_RATIO,
          )
          saveCourtPosition(nextPosition)
          return nextPosition
        })
        saveCourtWidth(nextWidth)
        return nextWidth
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isExpanded) return

    const handleDialogKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsExpanded(false)
        setSelectedPlayer(null)
        setFlight(null)
        window.requestAnimationFrame(() => miniCourtRef.current?.focus())
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled)',
          ) ?? [],
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable.at(-1)!
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleDialogKeyDown)
    closeButtonRef.current?.focus()
    return () => window.removeEventListener('keydown', handleDialogKeyDown)
  }, [isExpanded])

  const closeExpanded = () => {
    setIsExpanded(false)
    setSelectedPlayer(null)
    setFlight(null)
    window.requestAnimationFrame(() => miniCourtRef.current?.focus())
  }

  const selectPlayer = (player: SelectedPlayer) => {
    setSelectedPlayer((current) =>
      current?.side === player.side &&
      current.playerIndex === player.playerIndex
        ? null
        : player,
    )
  }

  const assignSelectedServer = () => {
    if (!props.canEdit || !selectedPlayer) return
    props.onAssignServer(selectedPlayer.side, selectedPlayer.playerIndex)
    flightIdRef.current += 1
    setFlight({
      id: flightIdRef.current,
      ...getServeFlight(
        selectedPlayer.side,
        props.model.serviceRows[selectedPlayer.side],
      ),
    })
    setSelectedPlayer(null)
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    event.stopPropagation()
    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    event.currentTarget.setPointerCapture?.(event.pointerId)

    if (event.pointerType === 'touch' && activePointersRef.current.size === 2) {
      const [first, second] = [...activePointersRef.current.values()]
      dragRef.current = null
      pinchRef.current = {
        initialDistance: Math.hypot(second.x - first.x, second.y - first.y),
        initialWidth: courtWidth,
        lastPosition: position,
        lastWidth: courtWidth,
      }
      suppressClickRef.current = true
      setIsDragging(false)
      return
    }

    if (!event.isPrimary || activePointersRef.current.size !== 1) return

    const bounds = event.currentTarget.getBoundingClientRect()
    dragRef.current = {
      hasDragged: false,
      height: bounds.height,
      lastPosition: position,
      pointerId: event.pointerId,
      startCenterX: position.x * window.innerWidth,
      startCenterY: position.y * window.innerHeight,
      startX: event.clientX,
      startY: event.clientY,
      width: bounds.width,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return
    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    const pinch = pinchRef.current
    if (pinch && activePointersRef.current.size >= 2) {
      event.preventDefault()
      event.stopPropagation()
      const [first, second] = [...activePointersRef.current.values()]
      const distance = Math.hypot(second.x - first.x, second.y - first.y)
      if (pinch.initialDistance <= 0) return

      const nextWidth = clampCourtWidth(
        pinch.initialWidth * (distance / pinch.initialDistance),
        window.innerWidth,
      )
      const nextPosition = clampPosition(
        pinch.lastPosition,
        nextWidth,
        nextWidth / COURT_ASPECT_RATIO,
      )
      pinch.lastWidth = nextWidth
      pinch.lastPosition = nextPosition
      setCourtWidth(nextWidth)
      setPosition(nextPosition)
      return
    }

    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    event.preventDefault()
    event.stopPropagation()
    const travelX = event.clientX - drag.startX
    const travelY = event.clientY - drag.startY
    if (!drag.hasDragged && Math.hypot(travelX, travelY) < DRAG_TOLERANCE) {
      return
    }

    drag.hasDragged = true
    setIsDragging(true)
    const nextPosition = clampPosition(
      {
        x: (drag.startCenterX + travelX) / window.innerWidth,
        y: (drag.startCenterY + travelY) / window.innerHeight,
      },
      drag.width,
      drag.height,
    )
    drag.lastPosition = nextPosition
    setPosition(nextPosition)
  }

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return
    event.stopPropagation()

    const pinch = pinchRef.current
    if (pinch) {
      activePointersRef.current.delete(event.pointerId)
      suppressClickRef.current = true
      saveCourtWidth(pinch.lastWidth)
      saveCourtPosition(pinch.lastPosition)
      pinchRef.current = null
      return
    }

    const drag = dragRef.current
    activePointersRef.current.delete(event.pointerId)
    if (!drag || drag.pointerId !== event.pointerId) return

    if (drag.hasDragged) {
      suppressClickRef.current = true
      const nextPosition = snapCourtPosition(
        drag.lastPosition,
        { width: window.innerWidth, height: window.innerHeight },
        { width: drag.width, height: drag.height },
      )
      setPosition(nextPosition)
      saveCourtPosition(nextPosition)
    }
    dragRef.current = null
    setIsDragging(false)
  }

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    activePointersRef.current.delete(event.pointerId)
    if (pinchRef.current) {
      saveCourtWidth(pinchRef.current.lastWidth)
      saveCourtPosition(pinchRef.current.lastPosition)
      suppressClickRef.current = true
    }
    pinchRef.current = null
    dragRef.current = null
    setIsDragging(false)
  }

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }

    const server = props.model.cells.find((cell) => cell.isServer)
    if (server) {
      flightIdRef.current += 1
      setFlight({
        id: flightIdRef.current,
        ...getServeFlight(server.side, server.row),
      })
    } else {
      setFlight(null)
    }
    setIsExpanded(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const movement = event.shiftKey ? KEYBOARD_MOVE * 2 : KEYBOARD_MOVE
    const movementByKey: Partial<Record<string, CourtPosition>> = {
      ArrowDown: { x: 0, y: movement },
      ArrowLeft: { x: -movement, y: 0 },
      ArrowRight: { x: movement, y: 0 },
      ArrowUp: { x: 0, y: -movement },
    }
    const delta = movementByKey[event.key]
    if (!delta) return

    event.preventDefault()
    event.stopPropagation()
    const bounds = event.currentTarget.getBoundingClientRect()
    const nextPosition = clampPosition(
      {
        x: (position.x * window.innerWidth + delta.x) / window.innerWidth,
        y: (position.y * window.innerHeight + delta.y) / window.innerHeight,
      },
      bounds.width,
      bounds.height,
    )
    setPosition(nextPosition)
    saveCourtPosition(nextPosition)
  }

  return (
    <>
      <button
        ref={miniCourtRef}
        type="button"
        className={`service-court-widget${isDragging ? ' service-court-widget--dragging' : ''}`}
        style={{
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
          width: `${courtWidth}px`,
        }}
        aria-label={`Visual service court. ${description} Press to expand; drag or use arrow keys to move; pinch with two fingers to resize.`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <MiniCourtSurface model={props.model} />
      </button>
      {isExpanded && (
        <div className="service-court-dialog-layer">
          <button
            type="button"
            className="service-court-dialog__backdrop"
            aria-label="Close expanded service court"
            tabIndex={-1}
            onClick={closeExpanded}
          />
          <section
            ref={dialogRef}
            className="service-court-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-court-dialog-title"
          >
            <h2 id="service-court-dialog-title" className="visually-hidden">
              Service court
            </h2>
            <p className="visually-hidden" aria-live="polite">
              {description}
            </p>
            <div className="service-court-dialog__controls">
              {props.model.mode === 'player' && (
                <button
                  type="button"
                  className="service-court-dialog__serve"
                  aria-label={
                    selectedPlayer
                      ? `Make ${selectedPlayer.label} of ${sideName(selectedPlayer.side, props.leftName, props.rightName)} serve`
                      : 'Select a player to serve'
                  }
                  disabled={!props.canEdit || !selectedPlayer}
                  onClick={assignSelectedServer}
                >
                  <ShuttlecockIcon />
                  <span className="service-court__tooltip">Assign service</span>
                </button>
              )}
              <button
                ref={closeButtonRef}
                type="button"
                className="service-court-dialog__close"
                aria-label="Close service court"
                onClick={closeExpanded}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <ExpandedCourt
              {...props}
              flight={flight}
              selectedPlayer={selectedPlayer}
              onSelectPlayer={selectPlayer}
            />
          </section>
        </div>
      )}
    </>
  )
}