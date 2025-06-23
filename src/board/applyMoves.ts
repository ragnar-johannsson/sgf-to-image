import { Board } from './Board'
import type { Move, Position } from '../types'

/**
 * Result of applying moves to a board
 */
export interface ApplyMovesResult {
  board: Board
  appliedMoves: Move[]
  overwrittenLabels: OverwrittenLabel[]
}

/**
 * Information about labels that were overwritten (e.g., due to captures)
 */
export interface OverwrittenLabel {
  originalMove: number
  overwrittenByMove: number
  position: Position
}

/**
 * Apply a sequence of moves to a board and return the final state
 * Handles capturing and tracks overwritten labels
 */
export function applyMoves(
  board: Board,
  moves: Move[],
  moveRange?: [number, number]
): ApplyMovesResult {
  let currentBoard = board
  const appliedMoves: Move[] = []
  const overwrittenLabels: OverwrittenLabel[] = []
  const movePositionMap = new Map<string, number>() // position -> move number

  // Determine which moves to apply
  const selectedMoves = selectMoveRange(moves, moveRange)

  for (const move of selectedMoves) {
    // Skip pass moves
    if (!move.position) {
      appliedMoves.push(move)
      continue
    }

    const positionKey = `${move.position.x},${move.position.y}`

    // Check if this position had a previous move that will be overwritten
    const previousMove = movePositionMap.get(positionKey)
    if (previousMove !== undefined) {
      overwrittenLabels.push({
        originalMove: previousMove,
        overwrittenByMove: move.moveNumber,
        position: move.position,
      })
    }

    try {
      // Store board state before move
      const boardBeforeMove = currentBoard

      // Apply the move
      currentBoard = currentBoard.placeStone(move.position, move.color)
      appliedMoves.push(move)

      // Track this move's position
      movePositionMap.set(positionKey, move.moveNumber)

      // Check for captures and track overwritten labels
      const capturedPositions = findCapturedPositions(
        boardBeforeMove,
        currentBoard
      )
      for (const capturedPos of capturedPositions) {
        const capturedPosKey = `${capturedPos.x},${capturedPos.y}`
        const capturedMove = movePositionMap.get(capturedPosKey)
        if (capturedMove !== undefined) {
          overwrittenLabels.push({
            originalMove: capturedMove,
            overwrittenByMove: move.moveNumber,
            position: capturedPos,
          })
          // Remove from position map since stone was captured
          movePositionMap.delete(capturedPosKey)
        }
      }
    } catch (error) {
      // Skip invalid moves (suicide, occupied position, etc.)
      // TODO: Consider logging this to a proper logger instead of console
      void error // Acknowledge error to avoid unused variable warning
    }
  }

  return {
    board: currentBoard,
    appliedMoves,
    overwrittenLabels,
  }
}

/**
 * Select moves based on range specification
 */
export function selectMoveRange(
  moves: Move[],
  range?: [number, number]
): Move[] {
  if (!range) {
    // Return all moves
    return moves
  }

  const [startMove, endMove] = range
  return moves.filter(
    (move) => move.moveNumber >= startMove && move.moveNumber <= endMove
  )
}

/**
 * Generate numeric labels for the selected move range
 * Returns a map from position to label number
 */
export function generateMoveLabels(
  appliedMoves: Move[],
  moveRange?: [number, number]
): Map<string, number> {
  const labels = new Map<string, number>()

  // If no range specified, label all moves with their move number
  if (!moveRange) {
    for (const move of appliedMoves) {
      if (move.position) {
        const posKey = `${move.position.x},${move.position.y}`
        labels.set(posKey, move.moveNumber)
      }
    }
    return labels
  }

  // For ranged moves, use sequential labels starting from 1
  const [startMove, endMove] = moveRange
  let labelNumber = 1

  for (const move of appliedMoves) {
    if (
      move.position &&
      move.moveNumber >= startMove &&
      move.moveNumber <= endMove
    ) {
      const posKey = `${move.position.x},${move.position.y}`
      labels.set(posKey, labelNumber++)
    }
  }

  return labels
}

/**
 * Find positions where stones were captured by comparing before/after board states
 */
function findCapturedPositions(
  beforeBoard: Board,
  afterBoard: Board
): Position[] {
  const capturedPositions: Position[] = []

  for (let y = 0; y < beforeBoard.size; y++) {
    for (let x = 0; x < beforeBoard.size; x++) {
      const pos = { x, y }
      const beforeStone = beforeBoard.getStone(pos)
      const afterStone = afterBoard.getStone(pos)

      // If there was a stone before but not after, it was captured
      if (beforeStone !== 'empty' && afterStone === 'empty') {
        capturedPositions.push(pos)
      }
    }
  }

  return capturedPositions
}

/**
 * Format overwritten labels for display
 * Returns strings like "4 at 10", "18 at 20"
 */
export function formatOverwrittenLabels(
  overwrittenLabels: OverwrittenLabel[]
): string[] {
  return overwrittenLabels.map(
    (label) => `${label.originalMove} at ${label.overwrittenByMove}`
  )
}
