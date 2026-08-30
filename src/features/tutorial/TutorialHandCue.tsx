import { Pointer } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { TutorialCue } from './tutorialState'
import {
  getTutorialCueMotion,
  type TutorialTargetRect,
} from './tutorialCueGeometry'

interface TutorialHandCueProps {
  cue: TutorialCue
  targetRect: TutorialTargetRect
}

export function TutorialHandCue({
  cue,
  targetRect,
}: TutorialHandCueProps) {
  const motion = getTutorialCueMotion(targetRect, cue, {
    height: window.innerHeight,
    width: window.innerWidth,
  })
  const isSwipe = cue !== 'tap'
  const style = {
    '--tutorial-cue-start-x': `${motion.startX}px`,
    '--tutorial-cue-start-y': `${motion.startY}px`,
    '--tutorial-cue-travel-x': `${motion.endX - motion.startX}px`,
    '--tutorial-cue-travel-y': `${motion.endY - motion.startY}px`,
    pointerEvents: 'none',
  } as CSSProperties

  return (
    <div
      className={`tutorial-hand-cue tutorial-hand-cue--${isSwipe ? 'swipe' : 'tap'}`}
      data-cue={cue}
      style={style}
      aria-hidden="true"
    >
      {isSwipe && (
        <svg
          className="tutorial-hand-cue__trail"
          viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
          preserveAspectRatio="none"
        >
          <line
            x1={motion.startX}
            y1={motion.startY}
            x2={motion.endX}
            y2={motion.endY}
          />
          <circle cx={motion.endX} cy={motion.endY} r="6" />
        </svg>
      )}
      <span className="tutorial-hand-cue__contact" />
      <Pointer className="tutorial-hand-cue__hand" />
    </div>
  )
}