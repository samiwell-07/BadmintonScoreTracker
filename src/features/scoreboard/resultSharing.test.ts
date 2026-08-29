import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  copyResultText,
  createResultImage,
  createResultImageFilename,
  formatResultText,
  shareResultImage,
  type ResultShareData,
} from './resultSharing'

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const originalCanShare = Object.getOwnPropertyDescriptor(navigator, 'canShare')
const originalShare = Object.getOwnPropertyDescriptor(navigator, 'share')
const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL')
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL')

const restoreProperty = (
  target: object,
  key: PropertyKey,
  descriptor: PropertyDescriptor | undefined,
) => {
  if (descriptor) Object.defineProperty(target, key, descriptor)
  else Reflect.deleteProperty(target, key)
}

const GAME_RESULT: ResultShareData = {
  completedSet: {
    setNumber: 2,
    leftName: 'Falcons',
    rightName: 'Rockets',
    leftScore: 12,
    rightScore: 21,
    winner: 'right',
    rules: {
      pointsToWin: 21,
      winByTwo: true,
      maximumScore: 30,
      gamesToWin: 2,
    },
  },
  leftSetsWon: 1,
  phase: 'gameWon',
  rightSetsWon: 1,
}

describe('result sharing', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    restoreProperty(navigator, 'clipboard', originalClipboard)
    restoreProperty(navigator, 'canShare', originalCanShare)
    restoreProperty(navigator, 'share', originalShare)
    restoreProperty(URL, 'createObjectURL', originalCreateObjectURL)
    restoreProperty(URL, 'revokeObjectURL', originalRevokeObjectURL)
  })

  it('formats game and match results with winner-first scores', () => {
    expect(formatResultText(GAME_RESULT)).toBe(
      'Rockets won Set 2 against Falcons, 21 - 12. Sets won: Falcons 1 - Rockets 1.',
    )
    expect(formatResultText({ ...GAME_RESULT, phase: 'matchWon' })).toBe(
      'Rockets won the match against Falcons, 21 - 12. Sets won: Falcons 1 - Rockets 1.',
    )
  })

  it('creates a sanitized PNG filename', () => {
    expect(createResultImageFilename(GAME_RESULT)).toBe(
      'badminton-set-2-rockets.png',
    )
  })

  it('copies text with the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    await copyResultText('Result text')

    expect(writeText).toHaveBeenCalledWith('Result text')
  })

  it('falls back to a temporary textarea for copying', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    const execCommand = vi.fn(() => true)
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    })

    await copyResultText('Fallback result')

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(document.querySelector('textarea')).not.toBeInTheDocument()
  })

  it('creates a 1080 square PNG blob', async () => {
    const context = {
      beginPath: vi.fn(),
      closePath: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      lineTo: vi.fn(),
      measureText: vi.fn(() => ({ width: 200 })),
      moveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      stroke: vi.fn(),
      set fillStyle(_value: string) {},
      set font(_value: string) {},
      set lineCap(_value: CanvasLineCap) {},
      set lineJoin(_value: CanvasLineJoin) {},
      set lineWidth(_value: number) {},
      set strokeStyle(_value: string) {},
      set textAlign(_value: CanvasTextAlign) {},
      set textBaseline(_value: CanvasTextBaseline) {},
    } as unknown as CanvasRenderingContext2D
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
      function (this: HTMLCanvasElement, callback, type) {
        expect(this.width).toBe(1080)
        expect(this.height).toBe(1080)
        expect(type).toBe('image/png')
        callback(new Blob(['png'], { type: 'image/png' }))
      },
    )

    const blob = await createResultImage(GAME_RESULT)

    expect(blob.type).toBe('image/png')
  })

  it('uses native file sharing when supported', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperties(navigator, {
      canShare: { configurable: true, value: vi.fn(() => true) },
      share: { configurable: true, value: share },
    })

    await expect(
      shareResultImage(new Blob(['png'], { type: 'image/png' }), GAME_RESULT),
    ).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ files: [expect.any(File)] }),
    )
  })

  it('reports native share cancellation without downloading', async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException('Cancelled', 'AbortError'))
    Object.defineProperties(navigator, {
      canShare: { configurable: true, value: vi.fn(() => true) },
      share: { configurable: true, value: share },
    })
    const createObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    })

    await expect(
      shareResultImage(new Blob(['png'], { type: 'image/png' }), GAME_RESULT),
    ).resolves.toBe('cancelled')
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('downloads and revokes the PNG when native sharing is unavailable', async () => {
    Object.defineProperties(navigator, {
      canShare: { configurable: true, value: undefined },
      share: { configurable: true, value: undefined },
    })
    const createObjectURL = vi.fn(() => 'blob:result')
    const revokeObjectURL = vi.fn()
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: createObjectURL },
      revokeObjectURL: { configurable: true, value: revokeObjectURL },
    })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    await expect(
      shareResultImage(new Blob(['png'], { type: 'image/png' }), GAME_RESULT),
    ).resolves.toBe('downloaded')
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:result')
  })
})