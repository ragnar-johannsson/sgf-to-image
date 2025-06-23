import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  BoardRenderer,
  DEFAULT_RENDER_OPTIONS,
} from '../../src/render/BoardRenderer'
import { Board } from '../../src/board/Board'

describe('BoardRenderer', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCanvas: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockContext: any

  beforeEach(() => {
    mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: 'center',
      textBaseline: 'middle',
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 10 })),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
    }

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/png;base64,test'),
    }
  })

  describe('Construction', () => {
    it('should create a board renderer with default options', () => {
      new BoardRenderer(mockCanvas, 19)

      expect(mockCanvas.width).toBe(DEFAULT_RENDER_OPTIONS.size)
      expect(mockCanvas.height).toBe(DEFAULT_RENDER_OPTIONS.size)
    })

    it('should create renderer with custom options', () => {
      const customOptions = {
        size: 800,
        showCoordinates: true,
        backgroundColor: '#ffffff',
      }

      new BoardRenderer(mockCanvas, 13, customOptions)

      expect(mockCanvas.width).toBe(800)
      expect(mockCanvas.height).toBe(800)
    })

    it('should handle different board sizes', () => {
      const boardSizes = [9, 13, 19]

      for (const size of boardSizes) {
        const canvas = { ...mockCanvas, width: 0, height: 0 }
        canvas.getContext = vi.fn(() => mockContext)

        expect(() => new BoardRenderer(canvas, size)).not.toThrow()
      }
    })
  })

  describe('Rendering methods', () => {
    let renderer: BoardRenderer

    beforeEach(() => {
      renderer = new BoardRenderer(mockCanvas, 19)
    })

    it('should render board without throwing errors', () => {
      expect(() => renderer.renderBoard()).not.toThrow()
      expect(mockContext.clearRect).toHaveBeenCalled()
      expect(mockContext.fillRect).toHaveBeenCalled()
      expect(mockContext.beginPath).toHaveBeenCalled()
    })

    it('should render stones without throwing errors', () => {
      const board = Board.empty(19)
      const boardWithStones = board
        .placeStone({ x: 3, y: 3 }, 'black')
        .placeStone({ x: 4, y: 4 }, 'white')

      expect(() => renderer.renderStones(boardWithStones)).not.toThrow()
    })

    it('should render move labels without throwing errors', () => {
      const labels = new Map([
        ['3,3', 1],
        ['4,4', 2],
        ['5,5', 3],
      ])

      expect(() => renderer.renderMoveLabels(labels)).not.toThrow()
      expect(mockContext.fillText).toHaveBeenCalledTimes(3)
    })

    it('should render overwritten labels without throwing errors', () => {
      const overwrittenLabels = ['4 at 10', '18 at 20']

      expect(() =>
        renderer.renderOverwrittenLabels(overwrittenLabels)
      ).not.toThrow()
      expect(mockContext.fillText).toHaveBeenCalled()
    })

    it('should handle empty overwritten labels', () => {
      expect(() => renderer.renderOverwrittenLabels([])).not.toThrow()
      expect(mockContext.fillText).not.toHaveBeenCalled()
    })

    it('should render coordinates when showCoordinates is true', () => {
      const coordRenderer = new BoardRenderer(mockCanvas, 9, {
        showCoordinates: true,
      })

      expect(() => coordRenderer.renderBoard()).not.toThrow()
      // Should call fillText for coordinate labels
      expect(mockContext.fillText).toHaveBeenCalled()
    })
  })

  describe('Canvas access', () => {
    it('should provide access to the canvas', () => {
      const renderer = new BoardRenderer(mockCanvas, 19)

      expect(renderer.getCanvas()).toBe(mockCanvas)
    })
  })
})
