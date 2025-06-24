import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  DiagramRenderer,
  renderDiagram,
  createDiagramRenderer,
} from '../../src/render/DiagramRenderer'
import { Move } from '../../src/types'

// Mock CanvasFactory at module level
vi.mock('../../src/render/CanvasFactory', async () => {
  return {
    CanvasFactory: {
      initialize: vi.fn().mockResolvedValue(undefined),
      createCanvas: vi.fn().mockReturnValue({
        width: 480,
        height: 480,
        getContext: vi.fn(() => ({
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
        })),
        toDataURL: vi.fn(() => 'data:image/png;base64,test'),
      }),
    },
    CanvasContext: vi.fn().mockImplementation((canvas) => ({
      context: canvas.getContext('2d'),
      setFillStyle: vi.fn(),
      setStrokeStyle: vi.fn(),
      setLineWidth: vi.fn(),
      setFont: vi.fn(),
      setTextAlign: vi.fn(),
      setTextBaseline: vi.fn(),
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
    })),
  }
})

describe('DiagramRenderer', () => {
  let renderer: DiagramRenderer

  beforeEach(async () => {
    renderer = createDiagramRenderer()
    await renderer.initialize()
  })

  const createTestMoves = (): Move[] => [
    { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
    { color: 'white', position: { x: 4, y: 4 }, moveNumber: 2 },
    { color: 'black', position: { x: 5, y: 5 }, moveNumber: 3 },
    { color: 'white', position: { x: 6, y: 6 }, moveNumber: 4 },
    { color: 'black', position: { x: 7, y: 7 }, moveNumber: 5 },
  ]

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      // Create a fresh renderer for this test
      const freshRenderer = createDiagramRenderer()
      expect(freshRenderer.isInitialized()).toBe(false)

      await freshRenderer.initialize()

      expect(freshRenderer.isInitialized()).toBe(true)
    })

    it('should handle multiple initialization calls', async () => {
      await renderer.initialize()
      await renderer.initialize() // Should not throw

      expect(renderer.isInitialized()).toBe(true)
    })

    it('should throw error when rendering without initialization', async () => {
      // Create a fresh renderer for this test (not initialized)
      const uninitializedRenderer = createDiagramRenderer()
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
      ]

      await expect(
        uninitializedRenderer.renderDiagram(19, moves)
      ).rejects.toThrow('DiagramRenderer not initialized')
    })
  })

  describe('Rendering', () => {
    beforeEach(async () => {
      await renderer.initialize()
    })

    it('should render a simple game', async () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: { x: 4, y: 4 }, moveNumber: 2 },
      ]

      const canvas = await renderer.renderDiagram(19, moves)

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480) // Default small size
      expect(canvas.height).toBe(480)
    })

    it('should handle empty game', async () => {
      const moves: Move[] = []

      const canvas = await renderer.renderDiagram(19, moves)

      expect(canvas).toBeDefined()
    })

    it('should handle different board sizes', async () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 2, y: 2 }, moveNumber: 1 },
      ]

      for (const boardSize of [9, 13, 19]) {
        const canvas = await renderer.renderDiagram(boardSize, moves)
        expect(canvas).toBeDefined()
      }
    })

    it('should handle pass moves', async () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: null, moveNumber: 2 }, // Pass move
        { color: 'black', position: { x: 4, y: 4 }, moveNumber: 3 },
      ]

      const canvas = await renderer.renderDiagram(19, moves)

      expect(canvas).toBeDefined()
    })

    it('should respect size presets', async () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
      ]

      const smallCanvas = await renderer.renderDiagram(19, moves, {
        size: 'small',
      })
      expect(smallCanvas.width).toBe(480)

      const mediumCanvas = await renderer.renderDiagram(19, moves, {
        size: 'medium',
      })
      expect(mediumCanvas.width).toBe(1080)

      const largeCanvas = await renderer.renderDiagram(19, moves, {
        size: 'large',
      })
      expect(largeCanvas.width).toBe(2160)
    })

    it('should handle custom sizes', async () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
      ]

      const canvas = await renderer.renderDiagram(19, moves, {
        size: { width: 600, height: 600 },
      })

      expect(canvas.width).toBe(600)
      expect(canvas.height).toBe(600)
    })

    it('should handle move ranges', async () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: { x: 4, y: 4 }, moveNumber: 2 },
        { color: 'black', position: { x: 5, y: 5 }, moveNumber: 3 },
        { color: 'white', position: { x: 6, y: 6 }, moveNumber: 4 },
      ]

      const canvas = await renderer.renderDiagram(19, moves, {
        moveRange: [2, 3],
      })

      expect(canvas).toBeDefined()
    })

    it('should respect showCoordinates option', async () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
      ]

      const canvasWithCoords = await renderer.renderDiagram(19, moves, {
        showCoordinates: true,
      })

      const canvasWithoutCoords = await renderer.renderDiagram(19, moves, {
        showCoordinates: false,
      })

      expect(canvasWithCoords).toBeDefined()
      expect(canvasWithoutCoords).toBeDefined()
    })
  })

  describe('New options support (move, range, lastMoveLabel)', () => {
    beforeEach(async () => {
      await renderer.initialize()
    })

    it('should render diagram with move option (snapshot at specific move)', async () => {
      const moves = createTestMoves()

      // Render board state up to move 3 (index 3, showing moves 1,2,3)
      const canvas = await renderer.renderDiagram(19, moves, {
        move: 3,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should render diagram with range option', async () => {
      const moves = createTestMoves()

      // Render only moves 2-4
      const canvas = await renderer.renderDiagram(19, moves, {
        moveRange: [2, 4],
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should render diagram with lastMoveLabel option', async () => {
      const moves = createTestMoves()

      // Render with last move specially marked
      const canvas = await renderer.renderDiagram(19, moves, {
        lastMoveLabel: true,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should validate mutually exclusive options (move vs range)', async () => {
      const moves = createTestMoves()

      // Should throw error when both move and moveRange are specified
      await expect(
        renderer.renderDiagram(19, moves, {
          move: 3,
          moveRange: [2, 4],
          size: 'small',
        })
      ).rejects.toThrow('Cannot specify both moveRange and move options')
    })

    it('should handle move option with pass moves', async () => {
      const movesWithPass: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: null, moveNumber: 2 }, // pass
        { color: 'black', position: { x: 4, y: 4 }, moveNumber: 3 },
      ]

      const canvas = await renderer.renderDiagram(19, movesWithPass, {
        move: 2, // Show up to move 2 (including pass)
        size: 'small',
      })

      expect(canvas).toBeDefined()
    })

    it('should handle lastMoveLabel with range option', async () => {
      const moves = createTestMoves()

      // Combine range and lastMoveLabel
      const canvas = await renderer.renderDiagram(19, moves, {
        moveRange: [2, 4],
        lastMoveLabel: true,
        size: 'small',
      })

      expect(canvas).toBeDefined()
    })

    it('should handle lastMoveLabel when last move is a pass', async () => {
      const movesEndingWithPass: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: { x: 4, y: 4 }, moveNumber: 2 },
        { color: 'black', position: null, moveNumber: 3 }, // pass
      ]

      const canvas = await renderer.renderDiagram(19, movesEndingWithPass, {
        lastMoveLabel: true,
        size: 'small',
      })

      expect(canvas).toBeDefined()
    })

    it('should handle edge case of empty moves with lastMoveLabel', async () => {
      const canvas = await renderer.renderDiagram(19, [], {
        lastMoveLabel: true,
        size: 'small',
      })

      expect(canvas).toBeDefined()
    })
  })

  describe('Error handling', () => {
    beforeEach(async () => {
      await renderer.initialize()
    })

    it('should throw error for invalid size preset', async () => {
      const moves: Move[] = []

      await expect(
        renderer.renderDiagram(19, moves, {
          // @ts-expect-error Testing invalid preset
          size: 'invalid',
        })
      ).rejects.toThrow('Invalid size preset')
    })

    it('should throw error for non-square custom size', async () => {
      const moves: Move[] = []

      await expect(
        renderer.renderDiagram(19, moves, {
          size: { width: 600, height: 400 },
        })
      ).rejects.toThrow('Canvas must be square')
    })

    it('should throw error for invalid custom size', async () => {
      const moves: Move[] = []

      await expect(
        renderer.renderDiagram(19, moves, {
          size: { width: 50, height: 50 },
        })
      ).rejects.toThrow('Canvas size must be between 100 and 4000 pixels')

      await expect(
        renderer.renderDiagram(19, moves, {
          size: { width: 5000, height: 5000 },
        })
      ).rejects.toThrow('Canvas size must be between 100 and 4000 pixels')
    })
  })

  describe('Convenience functions', () => {
    it('should render diagram with automatic initialization', async () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
      ]

      const canvas = await renderDiagram(19, moves)

      expect(canvas).toBeDefined()
    })
  })
})
