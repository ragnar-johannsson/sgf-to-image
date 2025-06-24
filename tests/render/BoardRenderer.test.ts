import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  BoardRenderer,
  DEFAULT_RENDER_OPTIONS,
} from '../../src/render/BoardRenderer'
import { Board } from '../../src/board/Board'
import { CanvasFactory } from '../../src/render/CanvasFactory'
import { applyMoves, generateMoveLabels } from '../../src/board/applyMoves'
import type { Move } from '../../src/types'

describe('BoardRenderer', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCanvas: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockContext: any
  let renderer: BoardRenderer

  beforeEach(async () => {
    await CanvasFactory.initialize()
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

    renderer = new BoardRenderer(mockCanvas, 19)
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

  describe('Range label rendering', () => {
    it('should render labels only for moves in the specified range', () => {
      const board = new Board(9)
      const moves: Move[] = [
        { color: 'black', position: { x: 2, y: 2 }, moveNumber: 1 },
        { color: 'white', position: { x: 3, y: 3 }, moveNumber: 2 },
        { color: 'black', position: { x: 4, y: 4 }, moveNumber: 3 },
        { color: 'white', position: { x: 5, y: 5 }, moveNumber: 4 },
        { color: 'black', position: { x: 6, y: 6 }, moveNumber: 5 },
      ]

      // Apply all moves to get the board state
      const moveResult = applyMoves(board, moves)

      // Generate labels only for moves 2-4 (range)
      const rangeLabels = generateMoveLabels(moveResult.appliedMoves, [2, 4])

      // Render the board with stones and range labels
      renderer.renderBoard()
      renderer.renderStones(moveResult.board)
      renderer.renderMoveLabels(rangeLabels, moveResult.board)

      // The labels map should only contain labels for moves 2, 3, 4
      expect(rangeLabels.size).toBe(3)
      expect(rangeLabels.get('3,3')).toBe(1) // move 2 -> label 1
      expect(rangeLabels.get('4,4')).toBe(2) // move 3 -> label 2
      expect(rangeLabels.get('5,5')).toBe(3) // move 4 -> label 3

      // Moves 1 and 5 should not have labels
      expect(rangeLabels.has('2,2')).toBe(false) // move 1
      expect(rangeLabels.has('6,6')).toBe(false) // move 5

      // Verify the canvas is properly rendered (basic check)
      expect(mockCanvas.width).toBe(480) // Default size
      expect(mockCanvas.height).toBe(480)
    })

    it('should handle empty label map correctly', () => {
      const board = new Board(9)
      const emptyLabels = new Map<string, number>()

      // Should not throw when rendering empty labels
      expect(() => {
        renderer.renderBoard()
        renderer.renderStones(board)
        renderer.renderMoveLabels(emptyLabels, board)
      }).not.toThrow()
    })

    it('should skip labels for empty positions', () => {
      const board = new Board(9)
      // Create labels for positions that don't have stones
      const labelsWithEmptyPositions = new Map<string, number>([
        ['2,2', 1], // empty position
        ['3,3', 2], // empty position
      ])

      // Should not throw and should skip rendering labels for empty positions
      expect(() => {
        renderer.renderBoard()
        renderer.renderStones(board) // empty board
        renderer.renderMoveLabels(labelsWithEmptyPositions, board)
      }).not.toThrow()
    })
  })
})
