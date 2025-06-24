// Main entry point for sgf-to-image library

import type { ConvertOptions, ImageResult } from './types'

// Import internal functions for main API
import { parseSgf } from './sgf/parseSgf'
import { Board } from './board/Board'
import {
  applyMoves,
  generateMoveLabels,
  formatOverwrittenLabels,
} from './board/applyMoves'
import { DiagramRenderer } from './render/DiagramRenderer'
import { ImageExporter } from './render/ImageExporter'
import { InvalidSgfError, RenderError, LabelType } from './types'

// Re-export types from types module
export type {
  ConvertOptions,
  ImageResult,
  SgfInput,
  ImageFormat,
  Size,
  SizePreset,
  CustomSize,
  ParsedGame,
  Move,
  Position,
  GameInfo,
  StoneColor,
  MarkupType,
  Markup,
  ApplyMovesResult,
  OverwrittenLabel,
  CanvasLike,
  RenderOptions,
  BenchmarkResult,
  BenchmarkOptions,
  BenchmarkSummary,
} from './types'

// Re-export error classes
export { InvalidSgfError, RenderError } from './types'

// Re-export SGF parsing functionality
export { parseSgf } from './sgf/parseSgf'

// Re-export board functionality
export { Board } from './board/Board'
export {
  applyMoves,
  applyMovesWithSnapshots,
  selectMoves,
  selectMoveRange,
  generateMoveLabels,
  formatOverwrittenLabels,
} from './board/applyMoves'

// Re-export rendering functionality
export { CanvasFactory, CanvasContext } from './render/CanvasFactory'
export { BoardRenderer, DEFAULT_RENDER_OPTIONS } from './render/BoardRenderer'
export {
  DiagramRenderer,
  createDiagramRenderer,
  renderDiagram,
  SIZE_PRESETS,
} from './render/DiagramRenderer'
export { ImageExporter } from './render/ImageExporter'

// Re-export performance functionality
export {
  PerformanceBenchmark,
  createBenchmark,
  quickBenchmark,
} from './performance/PerformanceBenchmark'

// Re-export enums
export { LabelType } from './types'

/**
 * Main conversion function - converts SGF to image
 *
 * @param options - Configuration options for the conversion
 * @returns Promise resolving to the image result with buffer and metadata
 *
 * @example
 * ```typescript
 * import { convertSgfToImage } from 'sgf-to-image'
 *
 * // Convert a simple SGF with default options
 * const result = await convertSgfToImage({
 *   sgf: '(;FF[4]GM[1]SZ[19];B[pd];W[dd])',
 *   size: 'medium',
 *   format: 'png'
 * })
 *
 * // Convert with custom options
 * const customResult = await convertSgfToImage({
 *   sgf: sgfFileContent,
 *   size: { width: 800, height: 800 },
 *   format: 'jpeg',
 *   quality: 0.9,
 *   showCoordinates: true,
 *   moveRange: [1, 50] // Show only first 50 moves
 * })
 *
 * console.log(`Generated ${result.totalMoves} move diagram`)
 * // result.imageBuffer contains the image data ready for saving or serving
 * ```
 */
export async function convertSgfToImage(
  options: ConvertOptions
): Promise<ImageResult> {
  try {
    // Validate required options
    if (options.sgf === undefined || options.sgf === null) {
      throw new RenderError('SGF input is required')
    }
    if (!options.size) {
      throw new RenderError('Size option is required')
    }
    if (!options.format) {
      throw new RenderError('Format option is required')
    }

    // Validate format
    if (!['png', 'jpeg'].includes(options.format)) {
      throw new RenderError(
        `Invalid format: ${options.format}. Valid formats: png, jpeg`
      )
    }

    // Validate size
    if (typeof options.size === 'string') {
      if (!['small', 'medium', 'large'].includes(options.size)) {
        throw new RenderError(
          `Invalid size preset: ${options.size}. Valid presets: small, medium, large`
        )
      }
    } else {
      if (options.size.width !== options.size.height) {
        throw new RenderError(
          'Canvas must be square. Width and height must be equal.'
        )
      }
      if (options.size.width < 100 || options.size.width > 4000) {
        throw new RenderError(
          'Canvas size must be between 100 and 4000 pixels.'
        )
      }
    }

    // Validate mutually exclusive options
    if (options.moveRange && options.move !== undefined) {
      throw new RenderError(
        'Cannot specify both moveRange and move options. Use one or the other.'
      )
    }

    // Validate moveRange
    if (options.moveRange) {
      const [start, end] = options.moveRange
      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        throw new RenderError('Move range values must be integers')
      }
      if (start < 1 || end < 1) {
        throw new RenderError(
          'Move range values must be positive (1-based indexing)'
        )
      }
      if (start > end) {
        throw new RenderError(
          'Move range start must be less than or equal to end'
        )
      }
    }

    // Validate move
    if (options.move !== undefined) {
      if (!Number.isInteger(options.move) || options.move < 0) {
        throw new RenderError(
          'Move index must be a non-negative integer (0-based indexing)'
        )
      }
    }

    // Validate quality
    if (options.quality !== undefined) {
      if (
        typeof options.quality !== 'number' ||
        options.quality < 0 ||
        options.quality > 1
      ) {
        throw new RenderError('Quality must be a number between 0.0 and 1.0')
      }
      if (options.format === 'png') {
        // Just a warning, not an error - quality is ignored for PNG
      }
    }

    // Validate labelType
    if (options.labelType !== undefined) {
      const validLabelTypes = Object.values(LabelType)
      if (!validLabelTypes.includes(options.labelType)) {
        throw new RenderError(
          `Invalid label type: ${options.labelType}. Valid types: ${validLabelTypes.join(', ')}`
        )
      }
    }

    // Validate labelText
    if (options.labelText !== undefined) {
      if (
        typeof options.labelText !== 'string' ||
        options.labelText.trim() === ''
      ) {
        throw new RenderError('Label text must be a non-empty string')
      }
    }

    // Parse SGF input
    const parsedGame = await parseSgf(options.sgf)

    // Initialize renderer
    const renderer = new DiagramRenderer()
    await renderer.initialize()

    // Render diagram (this handles move selection, board creation, and label generation internally)
    const renderOptions: Partial<ConvertOptions> = {
      size: options.size,
      showCoordinates: options.showCoordinates ?? false,
    }
    if (options.moveRange) {
      renderOptions.moveRange = options.moveRange
    }
    if (options.move !== undefined) {
      renderOptions.move = options.move
    }
    if (options.lastMoveLabel !== undefined) {
      renderOptions.lastMoveLabel = options.lastMoveLabel
    }
    if (options.labelType !== undefined) {
      renderOptions.labelType = options.labelType
    }
    if (options.labelText !== undefined) {
      renderOptions.labelText = options.labelText
    }

    const canvas = await renderer.renderDiagram(
      parsedGame.boardSize,
      parsedGame.moves,
      renderOptions
    )

    // Export image
    const exportOptions: {
      format: typeof options.format
      optimize: boolean
      quality?: number
    } = {
      format: options.format,
      optimize: true,
    }
    if (options.quality !== undefined) {
      exportOptions.quality = options.quality
    }

    const exportResult = await ImageExporter.exportImage(canvas, exportOptions)

    // Get the applied moves for metadata (apply same logic as renderer)
    const initialBoard = Board.empty(parsedGame.boardSize)
    const moveResult = applyMoves(
      initialBoard,
      parsedGame.moves,
      options.moveRange,
      options.move
    )

    // Generate labels using the same logic as DiagramRenderer to determine what's displayed
    let displayedLabels: Map<string, number>
    if (options.move !== undefined) {
      // When using move option, no sequence labels are displayed
      displayedLabels = new Map<string, number>()
    } else {
      // For range option or no filtering, generate normal labels
      displayedLabels = generateMoveLabels(
        moveResult.appliedMoves,
        options.moveRange
      )
    }

    // Filter overwritten labels to only include those where the original move is actually displayed
    const displayedMoveNumbers = new Set<number>()
    for (const labelValue of displayedLabels.values()) {
      if (labelValue > 0) {
        // Exclude special markers like -1 for last move
        displayedMoveNumbers.add(labelValue)
      }
    }

    const filteredOverwrittenLabels = moveResult.overwrittenLabels.filter(
      (label) => displayedMoveNumbers.has(label.originalMove)
    )

    const formattedLabels = formatOverwrittenLabels(filteredOverwrittenLabels)

    return {
      imageBuffer: exportResult.buffer,
      overwrittenLabels: formattedLabels,
      boardSize: parsedGame.boardSize,
      totalMoves: moveResult.appliedMoves.length,
    }
  } catch (error) {
    // Re-throw known errors as-is
    if (error instanceof InvalidSgfError || error instanceof RenderError) {
      throw error
    }

    // Wrap unknown errors
    throw new RenderError(`Conversion failed: ${(error as Error).message}`)
  }
}
