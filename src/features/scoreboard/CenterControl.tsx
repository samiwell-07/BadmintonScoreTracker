import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeftRight,
  CircleDot,
  RotateCcw,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type CenterControlAction = 'swap' | 'reset' | 'service' | 'settings'

interface CenterControlItem {
  action: CenterControlAction
  icon: LucideIcon
  label: string
  tooltip: string
}

const CONTROL_ITEMS: CenterControlItem[] = [
  {
    action: 'swap',
    icon: ArrowLeftRight,
    label: 'Swap teams',
    tooltip: 'Swap sides',
  },
  {
    action: 'reset',
    icon: RotateCcw,
    label: 'Reset match',
    tooltip: 'Reset',
  },
  {
    action: 'service',
    icon: CircleDot,
    label: 'Select serving team',
    tooltip: 'Service',
  },
  {
    action: 'settings',
    icon: Settings,
    label: 'Match settings',
    tooltip: 'Settings',
  },
]

interface CenterControlProps {
  disabledActions?: CenterControlAction[]
  isOpen: boolean
  onAction: (action: CenterControlAction) => void
  onOpenChange: (isOpen: boolean) => void
}

export function CenterControl({
  disabledActions = [],
  isOpen,
  onAction,
  onOpenChange,
}: CenterControlProps) {
  const [activeItem, setActiveItem] = useState<CenterControlAction | null>(null)
  const pulseTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (pulseTimer.current !== null) {
        window.clearTimeout(pulseTimer.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveItem(null)
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onOpenChange])

  const toggleMenu = () => {
    setActiveItem(null)
    onOpenChange(!isOpen)
  }

  const closeMenu = () => {
    setActiveItem(null)
    onOpenChange(false)
  }

  const activateItem = (action: CenterControlAction) => {
    if (pulseTimer.current !== null) {
      window.clearTimeout(pulseTimer.current)
    }

    setActiveItem(action)
    onAction(action)
    pulseTimer.current = window.setTimeout(() => {
      setActiveItem(null)
      pulseTimer.current = null
    }, 320)
  }

  return (
    <>
      {isOpen && (
        <button
          className="center-control__backdrop"
          type="button"
          aria-label="Dismiss center menu"
          onClick={closeMenu}
        />
      )}
      <div
        className={`center-control${isOpen ? ' center-control--open' : ''}`}
      >
        <div className="center-control__items">
          {CONTROL_ITEMS.map(({ action, icon: Icon, label, tooltip }, index) => {
            const position = index + 1

            return (
              <button
                key={action}
                className={`center-control__item center-control__item--${position}${activeItem === action ? ' center-control__item--active' : ''}`}
                data-tutorial-id={`center-${action}`}
                type="button"
                aria-hidden={!isOpen}
                aria-label={label}
                disabled={disabledActions.includes(action)}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => activateItem(action)}
              >
                <Icon aria-hidden="true" />
                <span className="center-control__tooltip" aria-hidden="true">
                  {tooltip}
                </span>
              </button>
            )
          })}
        </div>
        <button
          className="center-control__toggle"
          data-tutorial-id="center-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close center menu' : 'Open center menu'}
          onClick={toggleMenu}
        />
      </div>
    </>
  )
}