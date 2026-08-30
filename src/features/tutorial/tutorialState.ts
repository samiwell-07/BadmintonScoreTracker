export type TutorialAction =
  | 'add-left'
  | 'add-right'
  | 'remove-left'
  | 'transfer-right-left'
  | 'transfer-left-right'
  | 'edit-name'
  | 'open-menu'
  | 'swap'
  | 'reset'
  | 'cancel-reset'
  | 'service'
  | 'team-service'
  | 'doubles-service'
  | 'left-court-player'
  | 'right-court-player'
  | 'server-player'
  | 'settings'
  | 'close-settings'
  | 'open-history'
  | 'select-history'
  | 'back-history'
  | 'copy-result'
  | 'share-result'
  | 'undo-result'
  | 'next-game'
  | 'finish'

export type TutorialCue =
  | 'tap'
  | 'swipe-down'
  | 'swipe-left'
  | 'swipe-right'

export interface TutorialStep {
  action: TutorialAction
  cue?: TutorialCue
  cueTarget?: string
  description: string
  panelPosition?: 'top' | 'bottom'
  spotlightTarget?: string
  target?: string
  title: string
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    action: 'add-left',
    cue: 'tap',
    title: 'Tap to score',
    description: 'Tap the highlighted side to add one point.',
    target: '[data-tutorial-id="score-left"]',
  },
  {
    action: 'remove-left',
    cue: 'swipe-down',
    title: 'Remove a point',
    description: 'Swipe down from the top half into the bottom half.',
    target: '[data-tutorial-id="side-left"]',
  },
  {
    action: 'transfer-right-left',
    cue: 'swipe-left',
    title: 'Transfer a point',
    description: 'Swipe from the right side across the center line to the left.',
    target: '[data-tutorial-id="side-right"]',
  },
  {
    action: 'edit-name',
    cue: 'tap',
    title: 'Edit names',
    description: 'Tap the highlighted name to edit it inline.',
    target: '[data-tutorial-id="name-left"]',
  },
  {
    action: 'open-menu',
    cue: 'tap',
    title: 'Open match tools',
    description: 'Tap the top half-circle to reveal the match tools.',
    target: '[data-tutorial-id="center-toggle"]',
  },
  {
    action: 'swap',
    cue: 'tap',
    title: 'Swap sides',
    description: 'This moves both sides, scores, and service. Try it now.',
    target: '[data-tutorial-id="center-swap"]',
  },
  {
    action: 'reset',
    cue: 'tap',
    title: 'Reset control',
    description: 'Tap Reset to see its confirmation. Nothing will be erased.',
    target: '[data-tutorial-id="center-reset"]',
  },
  {
    action: 'cancel-reset',
    cue: 'tap',
    title: 'Reset is protected',
    description: 'Cancel the reset to continue the tutorial.',
    target: '[data-tutorial-id="reset-cancel"]',
    panelPosition: 'top',
  },
  {
    action: 'service',
    cue: 'tap',
    title: 'One-player service',
    description: 'Open Service to choose which side is serving.',
    target: '[data-tutorial-id="center-service"]',
  },
  {
    action: 'team-service',
    cue: 'tap',
    cueTarget: '[data-tutorial-id="name-left"]',
    title: 'Choose the serving side',
    description: 'Tap Left Team to mark it as serving.',
    target: '[data-tutorial-id="team-service-left"]',
  },
  {
    action: 'doubles-service',
    cue: 'tap',
    title: 'Two-player service',
    description: 'Open Service again to assign court positions and the individual server.',
    target: '[data-tutorial-id="center-service"]',
  },
  {
    action: 'left-court-player',
    cue: 'tap',
    title: 'Left team court',
    description: 'Choose the left team player standing on the left / odd court.',
    target: '[data-tutorial-id="player-choice-left-0"]',
  },
  {
    action: 'right-court-player',
    cue: 'tap',
    title: 'Right team court',
    description: 'Choose the right team player standing on the left / odd court.',
    target: '[data-tutorial-id="player-choice-right-0"]',
  },
  {
    action: 'server-player',
    cue: 'tap',
    title: 'Current server',
    description: 'Choose the highlighted eligible player to serve.',
    target: '[data-tutorial-id="player-choice-left-1"]',
  },
  {
    action: 'settings',
    cue: 'tap',
    title: 'Settings',
    description: 'Tap Settings. The tutorial will only show how to open it.',
    target: '[data-tutorial-id="center-settings"]',
  },
  {
    action: 'close-settings',
    cue: 'tap',
    title: 'Close settings',
    description: 'Close without changing any practice settings.',
    target: '[data-tutorial-id="settings-cancel"]',
    panelPosition: 'top',
  },
  {
    action: 'open-history',
    cue: 'tap',
    title: 'Set history',
    description: 'Tap the bottom half-circle to open completed sets.',
    target: '[data-tutorial-id="history-toggle"]',
    panelPosition: 'top',
  },
  {
    action: 'select-history',
    cue: 'tap',
    title: 'View an old set',
    description: 'Select this set to show its final score safely.',
    target: '[data-tutorial-id="history-set-1"]',
    panelPosition: 'top',
  },
  {
    action: 'back-history',
    cue: 'tap',
    title: 'Return to live score',
    description: 'Use the back half-circle to return.',
    target: '[data-tutorial-id="history-back"]',
    panelPosition: 'top',
  },
  {
    action: 'next-game',
    cue: 'tap',
    title: 'Game finished',
    description: 'When a game finishes, Copy text, Share image, Undo winning point, and Next game appear. Tap Next game to finish the tutorial.',
    spotlightTarget: '[data-tutorial-id="game-result-dialog"]',
    target: '[data-tutorial-id="result-next"]',
    panelPosition: 'top',
  },
  {
    action: 'finish',
    title: 'Replay anytime',
    description: 'You can redo this tutorial anytime from Settings, General settings, then Tutorial.',
  },
]

export const expectedTutorialAction = (stepIndex: number) =>
  TUTORIAL_STEPS[stepIndex]?.action ?? null

export const canAdvanceTutorial = (
  stepIndex: number,
  action: TutorialAction,
) => expectedTutorialAction(stepIndex) === action