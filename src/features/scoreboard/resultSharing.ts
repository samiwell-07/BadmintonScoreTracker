import type { CompletedSet, MatchPhase } from './scoreboard.types'

export interface ResultShareData {
  completedSet: CompletedSet
  leftSetsWon: number
  phase: Exclude<MatchPhase, 'playing'>
  rightSetsWon: number
}

export type ImageShareOutcome = 'shared' | 'downloaded' | 'cancelled'

const getWinnerData = ({ completedSet }: ResultShareData) => {
  const leftWon = completedSet.winner === 'left'

  return {
    opponentName: leftWon ? completedSet.rightName : completedSet.leftName,
    opponentScore: leftWon ? completedSet.rightScore : completedSet.leftScore,
    winnerName: leftWon ? completedSet.leftName : completedSet.rightName,
    winnerScore: leftWon ? completedSet.leftScore : completedSet.rightScore,
  }
}

export function formatResultText(data: ResultShareData) {
  const { completedSet, leftSetsWon, phase, rightSetsWon } = data
  const { opponentName, opponentScore, winnerName, winnerScore } =
    getWinnerData(data)
  const victory =
    phase === 'matchWon'
      ? `${winnerName} won the match against ${opponentName}`
      : `${winnerName} won Set ${completedSet.setNumber} against ${opponentName}`

  return `${victory}, ${winnerScore} - ${opponentScore}. Sets won: ${completedSet.leftName} ${leftSetsWon} - ${completedSet.rightName} ${rightSetsWon}.`
}

const drawFittedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maximumWidth: number,
  maximumSize: number,
  minimumSize: number,
  fontFamily: string,
) => {
  let size = maximumSize
  do {
    context.font = `700 ${size}px ${fontFamily}`
    if (context.measureText(text).width <= maximumWidth) break
    size -= 2
  } while (size > minimumSize)

  context.fillText(text, x, y, maximumWidth)
}

export function createResultImage(data: ResultShareData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const context = canvas.getContext('2d')

  if (!context) {
    return Promise.reject(new Error('Canvas is unavailable'))
  }

  const { completedSet, leftSetsWon, phase, rightSetsWon } = data
  const { winnerName } = getWinnerData(data)

  context.fillStyle = '#fffdf7'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#c8493f'
  context.fillRect(0, 0, canvas.width / 2, 22)
  context.fillStyle = '#087f75'
  context.fillRect(canvas.width / 2, 0, canvas.width / 2, 22)

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.strokeStyle = '#b28a22'
  context.lineWidth = 14
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()
  context.moveTo(475, 70)
  context.lineTo(475, 118)
  context.quadraticCurveTo(475, 178, 540, 178)
  context.quadraticCurveTo(605, 178, 605, 118)
  context.lineTo(605, 70)
  context.closePath()
  context.stroke()
  context.beginPath()
  context.moveTo(475, 92)
  context.lineTo(435, 92)
  context.lineTo(435, 112)
  context.quadraticCurveTo(435, 150, 480, 150)
  context.moveTo(605, 92)
  context.lineTo(645, 92)
  context.lineTo(645, 112)
  context.quadraticCurveTo(645, 150, 600, 150)
  context.stroke()
  context.beginPath()
  context.moveTo(540, 178)
  context.lineTo(540, 215)
  context.moveTo(500, 228)
  context.lineTo(580, 228)
  context.stroke()

  context.fillStyle = '#087f75'
  context.font = '800 34px Trebuchet MS, sans-serif'
  context.fillText(
    phase === 'matchWon'
      ? 'MATCH WINNER'
      : `SET ${completedSet.setNumber} WINNER`,
    540,
    280,
  )

  context.fillStyle = '#20251f'
  drawFittedText(
    context,
    winnerName,
    540,
    375,
    880,
    72,
    38,
    'Georgia, serif',
  )

  context.font = '700 156px Georgia, serif'
  context.fillText(
    `${completedSet.leftScore} - ${completedSet.rightScore}`,
    540,
    545,
  )

  context.fillStyle = '#c8493f'
  drawFittedText(
    context,
    completedSet.leftName,
    285,
    720,
    400,
    46,
    28,
    'Trebuchet MS, sans-serif',
  )
  context.fillStyle = '#087f75'
  drawFittedText(
    context,
    completedSet.rightName,
    795,
    720,
    400,
    46,
    28,
    'Trebuchet MS, sans-serif',
  )

  context.fillStyle = '#20251f'
  context.font = '700 44px Trebuchet MS, sans-serif'
  context.fillText(`Sets won: ${leftSetsWon} - ${rightSetsWon}`, 540, 855)
  context.fillStyle = '#62665e'
  context.font = '600 28px Trebuchet MS, sans-serif'
  context.fillText('Badminton Score Tracker', 540, 970)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not create result image'))
    }, 'image/png')
  })
}

export async function copyResultText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    if (!document.execCommand?.('copy')) {
      throw new Error('Copy is unavailable')
    }
  } finally {
    textarea.remove()
  }
}

export function createResultImageFilename(data: ResultShareData) {
  const { winnerName } = getWinnerData(data)
  const safeWinner = winnerName
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  const resultType =
    data.phase === 'matchWon'
      ? 'match'
      : `set-${data.completedSet.setNumber}`

  return `badminton-${resultType}-${safeWinner || 'result'}.png`
}

export async function shareResultImage(
  blob: Blob,
  data: ResultShareData,
): Promise<ImageShareOutcome> {
  const filename = createResultImageFilename(data)
  const file = new File([blob], filename, { type: 'image/png' })
  const shareData = { files: [file], title: 'Badminton result' }

  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData)
      return 'shared'
    } catch (error) {
      if (
        (error instanceof Error || error instanceof DOMException) &&
        error.name === 'AbortError'
      ) {
        return 'cancelled'
      }
      throw error
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)

  try {
    link.click()
  } finally {
    link.remove()
    URL.revokeObjectURL(url)
  }

  return 'downloaded'
}