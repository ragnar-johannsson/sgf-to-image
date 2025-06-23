// Shared TypeScript type definitions for sgf-to-image library

/**
 * Supported input formats for SGF data
 */
export type SgfInput = string | File | Blob

/**
 * Supported image output formats
 */
export type ImageFormat = 'png' | 'jpeg'

/**
 * Supported size presets
 */
export type SizePreset = 'small' | 'medium' | 'large'

/**
 * Custom size specification
 */
export interface CustomSize {
  width: number
  height: number
}

/**
 * Size specification - either a preset or custom dimensions
 */
export type Size = SizePreset | CustomSize

/**
 * Options for converting SGF to image
 */
export interface ConvertOptions {
  sgf: SgfInput
  size: Size
  format: ImageFormat
  moveRange?: [number, number]
  showCoordinates?: boolean
  quality?: number
}

/**
 * Result of image conversion
 */
export interface ImageResult {
  imageBuffer: Buffer
  overwrittenLabels: string[]
  boardSize: number
  totalMoves: number
}

/**
 * Parsed SGF game data
 */
export interface ParsedGame {
  boardSize: number
  moves: Move[]
  gameInfo: GameInfo
}

/**
 * Game information extracted from SGF
 */
export interface GameInfo {
  playerBlack?: string
  playerWhite?: string
  result?: string
  date?: string
  event?: string
  komi?: number
}

/**
 * Represents a single move in the game
 */
export interface Move {
  color: 'black' | 'white'
  position: Position | null // null for pass moves
  moveNumber: number
}

/**
 * Board position coordinates
 */
export interface Position {
  x: number // 0-based, left to right
  y: number // 0-based, top to bottom
}

/**
 * Stone color on the board
 */
export type StoneColor = 'black' | 'white' | 'empty'

/**
 * Custom error for invalid SGF data
 */
export class InvalidSgfError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidSgfError'
  }
}

/**
 * Custom error for rendering issues
 */
export class RenderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RenderError'
  }
}

// Re-export board-related types
export type { ApplyMovesResult, OverwrittenLabel } from './board/applyMoves'

// Re-export render-related types
export type { CanvasLike } from './render/CanvasFactory'
export type { RenderOptions } from './render/BoardRenderer'
