// Main entry point for sgf-to-image library

import type { ConvertOptions, ImageResult } from './types'

// Import internal functions for main API
import { parseSgf } from './sgf/parseSgf'
import { Board } from './board/Board'
import { applyMoves, formatOverwrittenLabels } from './board/applyMoves'
import { DiagramRenderer } from './render/DiagramRenderer'
import { ImageExporter } from './render/ImageExporter'
import { InvalidSgfError, RenderError } from './types'

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
      options.moveRange
    )
    const formattedLabels = formatOverwrittenLabels(
      moveResult.overwrittenLabels
    )

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
