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
  /**
   * Range of moves to display (1-based, inclusive).
   * Cannot be used together with move option.
   * Example: [1, 50] shows moves 1 through 50
   */
  moveRange?: [number, number]
  /**
   * Show board state up to specific move index (0-based).
   * Cannot be used together with moveRange option.
   * Example: 10 shows board after first 11 moves
   */
  move?: number
  /**
   * Whether to mark the last move played with a special indicator.
   * Default: false
   */
  lastMoveLabel?: boolean
  /**
   * Whether to show coordinate labels around the board.
   * Default: false
   */
  showCoordinates?: boolean
  /**
   * JPEG quality from 0.0 to 1.0 (higher is better quality).
   * Only applies to JPEG format. Default: 0.9
   */
  quality?: number
  /**
   * How to render move labels (numeric, circle, square, triangle, letters).
   * Default: LabelType.Numeric
   */
  labelType?: LabelType
  /**
   * Custom text for labels (overrides automatic numbering/lettering).
   * When provided, all labels will use this text instead of numbers/letters.
   */
  labelText?: string
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
  markup: Markup[]
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
 * Markup types supported by SGF
 */
export type MarkupType = 'circle' | 'square' | 'triangle' | 'label'

/**
 * Label rendering modes for move numbers and text
 */
export enum LabelType {
  Numeric = 'numeric', // Default: 1, 2, 3...
  Circle = 'circle', // Numbers/text inside circles
  Square = 'square', // Numbers/text inside squares
  Triangle = 'triangle', // Numbers/text inside triangles
  Letters = 'letters', // A, B, C... instead of numbers
}

/**
 * Markup annotation on the board
 */
export interface Markup {
  type: MarkupType
  position: Position
  text?: string // For label type markup
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

// Re-export performance-related types
export type {
  BenchmarkResult,
  BenchmarkOptions,
  BenchmarkSummary,
} from './performance/PerformanceBenchmark'
