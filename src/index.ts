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
