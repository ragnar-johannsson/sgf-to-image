import { CanvasFactory, type CanvasLike } from './CanvasFactory'
import { BoardRenderer, type RenderOptions } from './BoardRenderer'
import { Board } from '../board/Board'
import {
  applyMoves,
  generateMoveLabels,
  formatOverwrittenLabels,
} from '../board/applyMoves'
import type { ConvertOptions, Move, Size } from '../types'
import { RenderError } from '../types'

/**
 * Size preset mappings
 */
const SIZE_PRESETS: Record<string, number> = {
  small: 480,
  medium: 1080,
  large: 2160,
}

/**
 * Main diagram renderer that handles the complete rendering pipeline
 */
export class DiagramRenderer {
  private initialized = false

  /**
   * Initialize the renderer (must be called before rendering)
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      await CanvasFactory.initialize()
      this.initialized = true
    }
  }

  /**
   * Render a complete Go diagram from game data
   */
  async renderDiagram(
    boardSize: number,
    moves: Move[],
    options: Partial<ConvertOptions> = {}
  ): Promise<CanvasLike> {
    if (!this.initialized) {
      throw new RenderError(
        'DiagramRenderer not initialized. Call initialize() first.'
      )
    }

    try {
      // Parse rendering options
      const renderSize = this.parseSize(options.size || 'small')
      const showCoordinates = options.showCoordinates || false
      const moveRange = options.moveRange

      // Create board and apply moves
      const initialBoard = Board.empty(boardSize)
      const moveResult = applyMoves(initialBoard, moves, moveRange)

      // Generate labels for the selected moves
      const labels = generateMoveLabels(moveResult.appliedMoves, moveRange)
      const overwrittenLabels = formatOverwrittenLabels(
        moveResult.overwrittenLabels
      )

      // Create canvas and renderer
      const canvas = CanvasFactory.createCanvas(renderSize, renderSize)
      const renderOptions: Partial<RenderOptions> = {
        size: renderSize,
        showCoordinates,
      }

      const renderer = new BoardRenderer(canvas, boardSize, renderOptions)

      // Render the complete diagram
      renderer.renderBoard()
      renderer.renderStones(moveResult.board)
      renderer.renderMoveLabels(labels)
      renderer.renderOverwrittenLabels(overwrittenLabels)

      return canvas
    } catch (error) {
      throw new RenderError(
        `Failed to render diagram: ${(error as Error).message}`
      )
    }
  }

  /**
   * Parse size specification into pixel dimensions
   */
  private parseSize(size: Size): number {
    if (typeof size === 'string') {
      const presetSize = SIZE_PRESETS[size]
      if (!presetSize) {
        throw new RenderError(
          `Invalid size preset: ${size}. Valid presets: ${Object.keys(SIZE_PRESETS).join(', ')}`
        )
      }
      return presetSize
    } else {
      // Custom size object
      if (size.width !== size.height) {
        throw new RenderError(
          'Canvas must be square. Width and height must be equal.'
        )
      }
      if (size.width < 100 || size.width > 4000) {
        throw new RenderError(
          'Canvas size must be between 100 and 4000 pixels.'
        )
      }
      return size.width
    }
  }

  /**
   * Check if the renderer is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }
}

/**
 * Create a new diagram renderer instance
 */
export function createDiagramRenderer(): DiagramRenderer {
  return new DiagramRenderer()
}

/**
 * Convenience function to render a diagram with automatic initialization
 */
export async function renderDiagram(
  boardSize: number,
  moves: Move[],
  options: Partial<ConvertOptions> = {}
): Promise<CanvasLike> {
  const renderer = createDiagramRenderer()
  await renderer.initialize()
  return renderer.renderDiagram(boardSize, moves, options)
}
