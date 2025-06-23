import sgf from '@sabaki/sgf'
import type { GameTreeNode } from '@sabaki/sgf'
import type { SgfInput, ParsedGame, Move, GameInfo, Position } from '../types'
import { InvalidSgfError } from '../types'

// Conditionally import fs for Node.js environments
let readFileSync: typeof import('fs').readFileSync | undefined

// Check if we're in Node.js environment and try to load fs
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    readFileSync = require('fs').readFileSync
  } catch {
    // fs not available
  }
}

/**
 * Parse SGF input and return structured game data
 * Supports string content, file paths, and File/Blob objects
 */
export async function parseSgf(input: SgfInput): Promise<ParsedGame> {
  let sgfContent: string

  let parsedSgf

  // Handle different input types
  if (typeof input === 'string') {
    // Check if it's a file path or SGF content
    if (input.startsWith('(') || input.includes('(;')) {
      // It's SGF content - parse directly
      try {
        parsedSgf = sgf.parse(input)
      } catch (error) {
        throw new InvalidSgfError(
          `Failed to parse SGF content: ${(error as Error).message}`
        )
      }
    } else {
      // Assume it's a file path - read and parse
      try {
        if (!readFileSync) {
          throw new Error(
            'File system access not available in browser environment'
          )
        }
        sgfContent = readFileSync(input, 'utf8')
        parsedSgf = sgf.parse(sgfContent)
      } catch (error) {
        throw new InvalidSgfError(
          `Failed to read/parse SGF file: ${(error as Error).message}`
        )
      }
    }
  } else if (input instanceof File || input instanceof Blob) {
    // Handle File/Blob objects
    try {
      sgfContent = await input.text()
      parsedSgf = sgf.parse(sgfContent)
    } catch (error) {
      throw new InvalidSgfError(
        `Failed to read/parse SGF from File/Blob: ${(error as Error).message}`
      )
    }
  } else {
    throw new InvalidSgfError('Invalid input type for SGF data')
  }

  if (!parsedSgf || parsedSgf.length === 0) {
    throw new InvalidSgfError('No valid SGF games found')
  }

  // The first node is the root node with game properties
  const rootNode = parsedSgf[0]

  if (!rootNode || !rootNode.data) {
    throw new InvalidSgfError('Invalid SGF structure: missing root node data')
  }

  // Extract board size
  const boardSize = extractBoardSize(rootNode)
  validateBoardSize(boardSize)

  // Extract game info
  const gameInfo = extractGameInfo(rootNode)

  // Extract main sequence moves (ignore variations)
  const moves = extractMainSequenceMoves(rootNode)

  return {
    boardSize,
    moves,
    gameInfo,
  }
}

/**
 * Extract board size from root node
 */
function extractBoardSize(rootNode: GameTreeNode): number {
  // Check for SZ property (board size)
  if (rootNode.data.SZ) {
    const sizeValue = rootNode.data.SZ[0]
    if (typeof sizeValue === 'string') {
      // Handle "19:19" format or simple "19"
      const parts = sizeValue.split(':')
      const size = parseInt(parts[0], 10)
      if (!isNaN(size)) {
        return size
      }
    }
  }

  // Default to 19x19 if not specified
  return 19
}

/**
 * Validate that board size is supported
 */
function validateBoardSize(boardSize: number): void {
  const supportedSizes = [9, 13, 19]
  if (!supportedSizes.includes(boardSize)) {
    throw new InvalidSgfError(
      `Unsupported board size: ${boardSize}. Supported sizes: ${supportedSizes.join(
        ', '
      )}`
    )
  }
}

/**
 * Extract game information from root node
 */
function extractGameInfo(rootNode: GameTreeNode): GameInfo {
  const data = rootNode.data

  const gameInfo: GameInfo = {
    playerBlack: data.PB?.[0],
    playerWhite: data.PW?.[0],
    result: data.RE?.[0],
    date: data.DT?.[0],
    event: data.EV?.[0],
  }

  if (data.KM?.[0]) {
    gameInfo.komi = parseFloat(data.KM[0])
  }

  return gameInfo
}

/**
 * Extract main sequence moves, ignoring variation branches
 */
function extractMainSequenceMoves(rootNode: GameTreeNode): Move[] {
  const moves: Move[] = []
  let currentNode = rootNode
  let moveNumber = 0

  // Traverse the main sequence (first child path)
  while (currentNode) {
    const data = currentNode.data

    // Check for black move
    if (data.B) {
      moveNumber++
      const position = parsePosition(data.B[0])
      moves.push({
        color: 'black',
        position,
        moveNumber,
      })
    }

    // Check for white move
    if (data.W) {
      moveNumber++
      const position = parsePosition(data.W[0])
      moves.push({
        color: 'white',
        position,
        moveNumber,
      })
    }

    // Move to the next node in main sequence (first child)
    currentNode = currentNode.children?.[0]
  }

  return moves
}

/**
 * Parse SGF position format (e.g., "dd" for D4) to coordinates
 */
function parsePosition(sgfPos: string): Position | null {
  if (!sgfPos || sgfPos === '') {
    // Empty string represents a pass move
    return null
  }

  if (sgfPos.length !== 2) {
    throw new InvalidSgfError(`Invalid SGF position format: ${sgfPos}`)
  }

  // SGF uses letters a-s for coordinates (excluding i)
  // a=0, b=1, ..., h=7, j=8, ..., s=18
  const x = sgfPosToCoord(sgfPos[0])
  const y = sgfPosToCoord(sgfPos[1])

  return { x, y }
}

/**
 * Convert SGF position character to numeric coordinate
 */
function sgfPosToCoord(char: string): number {
  // SGF coordinates: a-h, j-t (skipping i) for 19x19 board
  const coordMap: Record<string, number> = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
    j: 8,
    k: 9,
    l: 10,
    m: 11,
    n: 12,
    o: 13,
    p: 14,
    q: 15,
    r: 16,
    s: 17,
    t: 18,
  }

  if (char in coordMap) {
    return coordMap[char]
  } else {
    throw new InvalidSgfError(`Invalid SGF coordinate character: ${char}`)
  }
}
