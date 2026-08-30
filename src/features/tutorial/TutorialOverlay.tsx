import { useEffect, useEffectEvent, useState } from 'react'
import type { TutorialStep } from './tutorialState'
import { TutorialHandCue } from './TutorialHandCue'
import type { TutorialTargetRect } from './tutorialCueGeometry'

interface SpotlightRect {
  bottom: number
  left: number
  right: number
  top: number
}

interface TutorialOverlayProps {
  onBack: () => void
  onFinish: () => void
  onRequestExit: () => void
  onSkipAll: () => void
  step: TutorialStep
  stepIndex: number
  totalSteps: number
}

const SPOTLIGHT_PADDING = 8
const TARGET_TRANSITION_TRACK_MS = 500

export function TutorialOverlay({
  onBack,
  onFinish,
  onRequestExit,
  onSkipAll,
  step,
  stepIndex,
  totalSteps,
}: TutorialOverlayProps) {
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const [cueRect, setCueRect] = useState<TutorialTargetRect | null>(null)

  const guardInteraction = useEffectEvent((event: Event) => {
    const eventTarget = event.target
    if (!(eventTarget instanceof Element)) return

    const isTutorialControl = eventTarget.closest('[data-tutorial-control]')
    const highlightedTarget = step.target
      ? document.querySelector<HTMLElement>(step.target)
      : null

    if (isTutorialControl) {
      return
    }

    const isHighlightedTarget = highlightedTarget?.contains(eventTarget)
    const isSwipeClick = step.cue !== 'tap' && event.type === 'click'

    if (isHighlightedTarget && !isSwipeClick) return

    event.preventDefault()
    event.stopImmediatePropagation()
  })

  useEffect(() => {
    document.addEventListener('pointerdown', guardInteraction, true)
    document.addEventListener('click', guardInteraction, true)
    return () => {
      document.removeEventListener('pointerdown', guardInteraction, true)
      document.removeEventListener('click', guardInteraction, true)
    }
  }, [])

  useEffect(() => {
    const targetSelector = step.target
    if (!targetSelector) return

    let frame = 0
    let trackTargetUntil = 0

    const measureSpotlight = () => {
      frame = 0
        const target = document.querySelector<HTMLElement>(targetSelector)
        if (!target) {
          setSpotlight(null)
          setCueRect(null)
          return
        }

        target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        const targetBounds = target.getBoundingClientRect()
        const spotlightTarget = step.spotlightTarget
          ? document.querySelector<HTMLElement>(step.spotlightTarget)
          : target
        const rect = spotlightTarget?.getBoundingClientRect() ?? targetBounds
        const nextSpotlight = {
          top: Math.max(0, rect.top - SPOTLIGHT_PADDING),
          right: Math.min(window.innerWidth, rect.right + SPOTLIGHT_PADDING),
          bottom: Math.min(
            window.innerHeight,
            rect.bottom + SPOTLIGHT_PADDING,
          ),
          left: Math.max(0, rect.left - SPOTLIGHT_PADDING),
        }
        setSpotlight((current) =>
          current &&
          current.top === nextSpotlight.top &&
          current.right === nextSpotlight.right &&
          current.bottom === nextSpotlight.bottom &&
          current.left === nextSpotlight.left
            ? current
            : nextSpotlight,
        )
        const cueTarget = step.cueTarget
          ? document.querySelector<HTMLElement>(step.cueTarget)
          : target
        const cueTargetBounds = cueTarget?.getBoundingClientRect() ?? targetBounds
        const nextCueRect = {
          top: cueTargetBounds.top,
          right: cueTargetBounds.right,
          bottom: cueTargetBounds.bottom,
          left: cueTargetBounds.left,
        }
        setCueRect((current) =>
          current &&
          current.top === nextCueRect.top &&
          current.right === nextCueRect.right &&
          current.bottom === nextCueRect.bottom &&
          current.left === nextCueRect.left
            ? current
            : nextCueRect,
        )

        if (performance.now() < trackTargetUntil) {
          frame = window.requestAnimationFrame(measureSpotlight)
        }
    }

    const updateSpotlight = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measureSpotlight)
    }

    const handleTargetTransition = (event: TransitionEvent) => {
      const target = document.querySelector<HTMLElement>(targetSelector)
      const cueTarget = step.cueTarget
        ? document.querySelector<HTMLElement>(step.cueTarget)
        : null
      const spotlightTarget = step.spotlightTarget
        ? document.querySelector<HTMLElement>(step.spotlightTarget)
        : null
      if (
        !(event.target instanceof Node) ||
        (!target?.contains(event.target) &&
          !cueTarget?.contains(event.target) &&
          !spotlightTarget?.contains(event.target))
      ) {
        return
      }

      trackTargetUntil = performance.now() + TARGET_TRANSITION_TRACK_MS
      updateSpotlight()
    }

    updateSpotlight()
    window.addEventListener('resize', updateSpotlight)
    window.addEventListener('scroll', updateSpotlight, true)
    document.addEventListener('transitionrun', handleTargetTransition, true)
    document.addEventListener('transitionend', handleTargetTransition, true)
    document.addEventListener('transitioncancel', handleTargetTransition, true)
    const observer = new MutationObserver(updateSpotlight)
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    })

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateSpotlight)
      window.removeEventListener('scroll', updateSpotlight, true)
      document.removeEventListener('transitionrun', handleTargetTransition, true)
      document.removeEventListener('transitionend', handleTargetTransition, true)
      document.removeEventListener('transitioncancel', handleTargetTransition, true)
      observer.disconnect()
    }
  }, [step.cueTarget, step.spotlightTarget, step.target])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onRequestExit()
      }
    }

    window.addEventListener('keydown', handleEscape, true)
    return () => window.removeEventListener('keydown', handleEscape, true)
  }, [onRequestExit])

  const activeSpotlight = step.target ? spotlight : null
  const blockers = activeSpotlight
    ? [
        { key: 'top', style: { inset: `0 0 auto 0`, height: activeSpotlight.top } },
        {
          key: 'left',
          style: {
            top: activeSpotlight.top,
            left: 0,
            width: activeSpotlight.left,
            height: activeSpotlight.bottom - activeSpotlight.top,
          },
        },
        {
          key: 'right',
          style: {
            top: activeSpotlight.top,
            right: 0,
            width: window.innerWidth - activeSpotlight.right,
            height: activeSpotlight.bottom - activeSpotlight.top,
          },
        },
        {
          key: 'bottom',
          style: { inset: `${activeSpotlight.bottom}px 0 0 0` },
        },
      ]
    : [{ key: 'all', style: { inset: 0 } }]

  return (
    <div className="tutorial-overlay" aria-live="polite">
      {blockers.map(({ key, style }) => (
        <div className="tutorial-overlay__blocker" key={key} style={style} />
      ))}
      {activeSpotlight && (
        <div
          className="tutorial-overlay__spotlight"
          style={{
            top: activeSpotlight.top,
            left: activeSpotlight.left,
            width: activeSpotlight.right - activeSpotlight.left,
            height: activeSpotlight.bottom - activeSpotlight.top,
          }}
        />
      )}
      {step.cue && step.target && cueRect && (
        <TutorialHandCue
          key={`${stepIndex}-${step.cue}`}
          cue={step.cue}
          targetRect={cueRect}
        />
      )}
      <section
        className={`tutorial-panel tutorial-panel--${step.panelPosition ?? 'bottom'}`}
        data-tutorial-control
        aria-label={`Tutorial step ${stepIndex + 1} of ${totalSteps}`}
      >
        <p className="tutorial-panel__step">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h2>{step.title}</h2>
        <p>{step.description}</p>
        <div className="tutorial-panel__actions">
          {step.action === 'finish' && (
            <button
              type="button"
              className="tutorial-panel__button tutorial-panel__button--finish"
              onClick={onFinish}
            >
              Finish
            </button>
          )}
          <button
            type="button"
            className="tutorial-panel__button"
            disabled={stepIndex === 0}
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="button"
            className="tutorial-panel__button tutorial-panel__button--skip"
            onClick={onSkipAll}
          >
            Skip all
          </button>
        </div>
      </section>
    </div>
  )
}