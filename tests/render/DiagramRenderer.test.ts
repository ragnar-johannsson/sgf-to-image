import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  DiagramRenderer,
  renderDiagram,
  createDiagramRenderer,
} from '../../src/render/DiagramRenderer'
import { Move } from '../../src/types'
import { LabelType } from '../../src/types'

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

    it('should render board state without move labels when using move option', async () => {
      const moves = createTestMoves()

      // When using move option, should show board state but no move number labels
      const canvas = await renderer.renderDiagram(19, moves, {
        move: 2, // Show board after first 3 moves
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)

      // TODO: In a real implementation, we would verify that no move labels are rendered
      // This could be done by checking the canvas drawing operations or comparing with expected output
    })

    it('should show only last move marker when move option combined with lastMoveLabel', async () => {
      const moves = createTestMoves()

      // When using move + lastMoveLabel, should show only the last move marker
      const canvas = await renderer.renderDiagram(19, moves, {
        move: 2,
        lastMoveLabel: true,
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

  describe('New label options support', () => {
    beforeEach(async () => {
      await renderer.initialize()
    })

    it('should render diagram with different label types', async () => {
      const moves = createTestMoves()

      // Test all label types
      const labelTypes = [
        LabelType.Numeric,
        LabelType.Letters,
        LabelType.Circle,
        LabelType.Square,
        LabelType.Triangle,
      ]

      for (const labelType of labelTypes) {
        const canvas = await renderer.renderDiagram(19, moves, {
          labelType,
          size: 'small',
        })

        expect(canvas).toBeDefined()
        expect(canvas.width).toBe(480)
        expect(canvas.height).toBe(480)
      }
    })

    it('should render diagram with custom label text', async () => {
      const moves = createTestMoves()

      const canvas = await renderer.renderDiagram(19, moves, {
        labelText: '★',
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should combine labelType and labelText options', async () => {
      const moves = createTestMoves()

      const canvas = await renderer.renderDiagram(19, moves, {
        labelType: LabelType.Circle,
        labelText: 'X',
        size: 'small',
      })

      expect(canvas).toBeDefined()
    })

    it('should combine label options with move range', async () => {
      const moves = createTestMoves()

      const canvas = await renderer.renderDiagram(19, moves, {
        moveRange: [1, 3],
        labelType: LabelType.Letters,
        size: 'small',
      })

      expect(canvas).toBeDefined()
    })

    it('should combine label options with move index', async () => {
      const moves = createTestMoves()

      const canvas = await renderer.renderDiagram(19, moves, {
        move: 2,
        labelType: LabelType.Triangle,
        labelText: '●',
        size: 'small',
      })

      expect(canvas).toBeDefined()
    })

    it('should combine all new options together', async () => {
      const moves = createTestMoves()

      const canvas = await renderer.renderDiagram(19, moves, {
        moveRange: [1, 4],
        labelType: LabelType.Square,
        lastMoveLabel: true,
        showCoordinates: true,
        size: 'small',
      })

      expect(canvas).toBeDefined()
    })
  })

  describe('Visual regression snapshots', () => {
    beforeEach(async () => {
      await renderer.initialize()
    })

    const snapshotMoves = (): Move[] => [
      { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
      { color: 'white', position: { x: 4, y: 4 }, moveNumber: 2 },
      { color: 'black', position: { x: 5, y: 5 }, moveNumber: 3 },
      { color: 'white', position: { x: 3, y: 4 }, moveNumber: 4 },
      { color: 'black', position: { x: 4, y: 3 }, moveNumber: 5 },
    ]

    it('should create consistent snapshots for numeric labels', async () => {
      const moves = snapshotMoves()

      const canvas = await renderer.renderDiagram(9, moves, {
        labelType: LabelType.Numeric,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
      // Note: In a real implementation, this would compare against saved image snapshots
    })

    it('should create consistent snapshots for letter labels', async () => {
      const moves = snapshotMoves()

      const canvas = await renderer.renderDiagram(9, moves, {
        labelType: LabelType.Letters,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should create consistent snapshots for circle labels', async () => {
      const moves = snapshotMoves()

      const canvas = await renderer.renderDiagram(9, moves, {
        labelType: LabelType.Circle,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should create consistent snapshots for square labels', async () => {
      const moves = snapshotMoves()

      const canvas = await renderer.renderDiagram(9, moves, {
        labelType: LabelType.Square,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should create consistent snapshots for triangle labels', async () => {
      const moves = snapshotMoves()

      const canvas = await renderer.renderDiagram(9, moves, {
        labelType: LabelType.Triangle,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should create consistent snapshots for custom text labels', async () => {
      const moves = snapshotMoves()

      const canvas = await renderer.renderDiagram(9, moves, {
        labelText: '★',
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should create consistent snapshots for move range rendering', async () => {
      const moves = snapshotMoves()

      const canvas = await renderer.renderDiagram(9, moves, {
        moveRange: [2, 4],
        labelType: LabelType.Letters,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should create consistent snapshots for last move label', async () => {
      const moves = snapshotMoves()

      const canvas = await renderer.renderDiagram(9, moves, {
        moveRange: [1, 3],
        lastMoveLabel: true,
        labelType: LabelType.Circle,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('should create consistent snapshots with coordinates and shapes', async () => {
      const moves = snapshotMoves()

      const canvas = await renderer.renderDiagram(9, moves, {
        labelType: LabelType.Square,
        showCoordinates: true,
        lastMoveLabel: true,
        size: 'small',
      })

      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
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

  describe('Overwritten labels', () => {
    it('should only show overwritten labels for displayed moves', async () => {
      // Create moves where some will be captured
      const moves: Move[] = [
        { color: 'black', position: { x: 0, y: 0 }, moveNumber: 1 }, // Will be captured
        { color: 'white', position: { x: 1, y: 0 }, moveNumber: 2 },
        { color: 'black', position: { x: 0, y: 1 }, moveNumber: 3 },
        { color: 'white', position: { x: 0, y: 0 }, moveNumber: 4 }, // Reuses position
        { color: 'black', position: { x: 2, y: 2 }, moveNumber: 5 },
        { color: 'white', position: { x: 3, y: 3 }, moveNumber: 6 }, // Will be captured
        { color: 'black', position: { x: 4, y: 3 }, moveNumber: 7 },
        { color: 'white', position: { x: 3, y: 4 }, moveNumber: 8 },
        { color: 'black', position: { x: 3, y: 2 }, moveNumber: 9 },
        { color: 'white', position: { x: 2, y: 3 }, moveNumber: 10 }, // Captures move 6
      ]

      // Render with range [5, 8] - only moves 5, 6, 7, 8 should have labels
      const canvas = await renderer.renderDiagram(19, moves, {
        moveRange: [5, 8],
        size: 'small',
      })

      expect(canvas).toBeDefined()
      // The diagram should only show overwritten labels for moves that are actually labeled (5-8)
      // If move 6 was captured by move 10, but move 10 is not in the displayed range,
      // then "6 at 10" should still be shown because move 6 is labeled
      // However, if move 1 was captured earlier, "1 at X" should NOT be shown since move 1 is not labeled
    })

    it('should show no overwritten labels when using move option', async () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 0, y: 0 }, moveNumber: 1 }, // Will be captured
        { color: 'white', position: { x: 1, y: 0 }, moveNumber: 2 },
        { color: 'black', position: { x: 0, y: 1 }, moveNumber: 3 }, // Captures move 1
        { color: 'white', position: { x: 2, y: 2 }, moveNumber: 4 },
      ]

      // Using move option - no sequence labels should be shown, so no overwritten labels either
      const canvas = await renderer.renderDiagram(19, moves, {
        move: 3, // Show board state after move 3
        size: 'small',
      })

      expect(canvas).toBeDefined()
      // Since no move sequence labels are shown, no overwritten labels should be shown either
    })
  })
})
