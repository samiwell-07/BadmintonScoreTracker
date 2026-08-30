import type { TutorialCue } from './tutorialState'

export interface TutorialTargetRect {
  bottom: number
  left: number
  right: number
  top: number
}

interface ViewportSize {
  height: number
  width: number
}

export interface TutorialCueMotion {
  endX: number
  endY: number
  startX: number
  startY: number
}

const CUE_MARGIN = 24

const clampToViewport = (value: number, maximum: number) =>
  Math.min(Math.max(value, CUE_MARGIN), maximum - CUE_MARGIN)

export const getTutorialCueMotion = (
  targetRect: TutorialTargetRect,
  cue: TutorialCue,
  viewport: ViewportSize,
): TutorialCueMotion => {
  const width = targetRect.right - targetRect.left
  const height = targetRect.bottom - targetRect.top
  const centerX = targetRect.left + width / 2
  const centerY = targetRect.top + height / 2
  let startX = centerX
  let startY = centerY
  let endX = centerX
  let endY = centerY

  if (cue === 'swipe-down') {
    startY = targetRect.top + height * 0.22
    endY = targetRect.top + height * 0.52
  } else if (cue === 'swipe-left') {
    startX = targetRect.left + width * 0.72
    endX = targetRect.left - width * 0.28
  } else if (cue === 'swipe-right') {
    startX = targetRect.left + width * 0.28
    endX = targetRect.right + width * 0.28
  }

  return {
    startX: clampToViewport(startX, viewport.width),
    startY: clampToViewport(startY, viewport.height),
    endX: clampToViewport(endX, viewport.width),
    endY: clampToViewport(endY, viewport.height),
  }
}