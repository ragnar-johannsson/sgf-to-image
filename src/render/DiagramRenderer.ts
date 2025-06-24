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
 * Size preset mappings for image export
 * - small: 480×480px - Suitable for web thumbnails and small displays
 * - medium: 1080×1080px - High quality for most use cases
 * - large: 2160×2160px - Ultra high resolution for printing
 */
export const SIZE_PRESETS: Record<string, number> = {
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
      const moveIndex = options.move
      const lastMoveLabel = options.lastMoveLabel || false

      // Validate mutually exclusive options
      if (moveRange && moveIndex !== undefined) {
        throw new RenderError(
          'Cannot specify both moveRange and move options. Use one or the other.'
        )
      }

      // Create board and apply moves
      const initialBoard = Board.empty(boardSize)
      const moveResult = applyMoves(initialBoard, moves, moveRange, moveIndex)

      // Generate labels for the selected moves
      let labels = generateMoveLabels(moveResult.appliedMoves, moveRange)

      // Add last move label if requested and there are applied moves
      if (lastMoveLabel && moveResult.appliedMoves.length > 0) {
        labels = this.addLastMoveLabel(labels, moveResult.appliedMoves)
      }

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
      renderer.renderMoveLabels(labels, moveResult.board)
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
   * Add a special label for the last move played
   */
  private addLastMoveLabel(
    labels: Map<string, number>,
    appliedMoves: Move[]
  ): Map<string, number> {
    if (appliedMoves.length === 0) {
      return labels
    }

    // Find the last move with a position (skip pass moves)
    const lastMove = appliedMoves
      .slice()
      .reverse()
      .find((move) => move.position !== null)

    if (!lastMove || !lastMove.position) {
      return labels
    }

    // Create a new map with the last move labeled specially
    const newLabels = new Map(labels)
    const posKey = `${lastMove.position.x},${lastMove.position.y}`

    // Use a triangle or other special marker for the last move
    // For now, we'll use a negative number to indicate it's special
    // The BoardRenderer would need to be updated to handle this differently
    newLabels.set(posKey, -1) // Special marker for last move

    return newLabels
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
