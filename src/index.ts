// Main entry point for sgf-to-image library

import type { ConvertOptions, ImageResult } from './types'

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
} from './render/DiagramRenderer'
export { ImageExporter } from './render/ImageExporter'

/**
 * Convert SGF file to image
 * TODO: Implement this function in future tasks
 */
export async function convertSgfToImage(
  options: ConvertOptions
): Promise<ImageResult> {
  // TODO: Use options parameter when implementing the function
  void options // Acknowledge parameter to avoid unused variable warning
  throw new Error('Not implemented yet')
}
