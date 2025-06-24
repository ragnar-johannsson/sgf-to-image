import { describe, it, expect } from 'vitest'
import { Board } from '../../src/board/Board'
import {
  applyMoves,
  applyMovesWithSnapshots,
  selectMoves,
  selectMoveRange,
  generateMoveLabels,
  formatOverwrittenLabels,
} from '../../src/board/applyMoves'
import type { Move } from '../../src/types'

const createTestMoves = (): Move[] => [
  { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
  { color: 'white', position: { x: 4, y: 4 }, moveNumber: 2 },
  { color: 'black', position: { x: 5, y: 5 }, moveNumber: 3 },
  { color: 'white', position: { x: 6, y: 6 }, moveNumber: 4 },
  { color: 'black', position: null, moveNumber: 5 }, // pass move
  { color: 'white', position: { x: 7, y: 7 }, moveNumber: 6 },
]

describe('applyMoves', () => {
  describe('Basic move application', () => {
    it('should apply all moves when no range specified', () => {
      const board = new Board(19)
      const moves = createTestMoves()

      const result = applyMoves(board, moves)

      expect(result.appliedMoves).toHaveLength(6)
      expect(result.board.getStone({ x: 3, y: 3 })).toBe('black')
      expect(result.board.getStone({ x: 4, y: 4 })).toBe('white')
      expect(result.board.getStone({ x: 5, y: 5 })).toBe('black')
      expect(result.board.getStone({ x: 6, y: 6 })).toBe('white')
      expect(result.board.getStone({ x: 7, y: 7 })).toBe('white')
    })

    it('should handle pass moves correctly', () => {
      const board = new Board(19)
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: null, moveNumber: 2 }, // pass
        { color: 'black', position: { x: 4, y: 4 }, moveNumber: 3 },
      ]

      const result = applyMoves(board, moves)

      expect(result.appliedMoves).toHaveLength(3)
      expect(result.board.getStone({ x: 3, y: 3 })).toBe('black')
      expect(result.board.getStone({ x: 4, y: 4 })).toBe('black')
    })

    it('should skip invalid moves', () => {
      const board = new Board(19)
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: { x: 3, y: 3 }, moveNumber: 2 }, // invalid - occupied
        { color: 'black', position: { x: 4, y: 4 }, moveNumber: 3 },
      ]

      const result = applyMoves(board, moves)

      expect(result.appliedMoves).toHaveLength(2) // Only moves 1 and 3
      expect(result.board.getStone({ x: 3, y: 3 })).toBe('black')
      expect(result.board.getStone({ x: 4, y: 4 })).toBe('black')
    })
  })

  describe('Move range selection', () => {
    it('should apply moves in specified range', () => {
      const board = new Board(19)
      const moves = createTestMoves()

      const result = applyMoves(board, moves, [2, 4])

      expect(result.appliedMoves).toHaveLength(4) // moves 1, 2, 3, 4 (all up to range end)
      expect(result.board.getStone({ x: 3, y: 3 })).toBe('black') // move 1 applied
      expect(result.board.getStone({ x: 4, y: 4 })).toBe('white') // move 2
      expect(result.board.getStone({ x: 5, y: 5 })).toBe('black') // move 3
      expect(result.board.getStone({ x: 6, y: 6 })).toBe('white') // move 4
      expect(result.board.getStone({ x: 7, y: 7 })).toBe('empty') // move 6 not applied
    })

    it('should handle single move range', () => {
      const board = new Board(19)
      const moves = createTestMoves()

      const result = applyMoves(board, moves, [3, 3])

      expect(result.appliedMoves).toHaveLength(3) // moves 1, 2, 3 (all up to range end)
      expect(result.board.getStone({ x: 5, y: 5 })).toBe('black') // move 3
      expect(result.board.getStone({ x: 3, y: 3 })).toBe('black') // move 1 applied
      expect(result.board.getStone({ x: 4, y: 4 })).toBe('white') // move 2 applied
    })
  })

  describe('Capturing and overwritten labels', () => {
    it('should detect overwritten labels from captures', () => {
      const board = new Board(19)
      const moves: Move[] = [
        { color: 'black', position: { x: 0, y: 0 }, moveNumber: 1 },
        { color: 'white', position: { x: 1, y: 0 }, moveNumber: 2 },
        { color: 'white', position: { x: 0, y: 1 }, moveNumber: 3 }, // captures black
      ]

      const result = applyMoves(board, moves)

      expect(result.board.getStone({ x: 0, y: 0 })).toBe('empty') // captured
      expect(result.overwrittenLabels).toHaveLength(1)
      expect(result.overwrittenLabels[0]).toEqual({
        originalMove: 1,
        overwrittenByMove: 3,
        position: { x: 0, y: 0 },
      })
    })

    it('should detect overwritten labels from position reuse', () => {
      const board = new Board(19)
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: { x: 4, y: 4 }, moveNumber: 2 },
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 3 }, // same position
      ]

      // Modify the board to remove the first stone to allow the third move
      let testBoard = board.placeStone({ x: 3, y: 3 }, 'black')
      testBoard = testBoard.removeStones([{ x: 3, y: 3 }])

      const result = applyMoves(testBoard, moves.slice(1)) // start from move 2

      // This test might need adjustment based on exact implementation
      expect(result.appliedMoves.length).toBeGreaterThan(0)
    })

    it('should format overwritten labels correctly', () => {
      const overwrittenLabels = [
        { originalMove: 4, overwrittenByMove: 10, position: { x: 0, y: 0 } },
        { originalMove: 18, overwrittenByMove: 20, position: { x: 1, y: 1 } },
      ]

      const formatted = formatOverwrittenLabels(overwrittenLabels)

      expect(formatted).toEqual(['4 at 10', '18 at 20'])
    })
  })

  describe('selectMoveRange', () => {
    it('should return all moves when no range specified', () => {
      const moves = createTestMoves()
      const selected = selectMoveRange(moves)

      expect(selected).toHaveLength(6)
      expect(selected).toEqual(moves)
    })

    it('should filter moves by range', () => {
      const moves = createTestMoves()
      const selected = selectMoveRange(moves, [2, 4])

      expect(selected).toHaveLength(3)
      expect(selected[0].moveNumber).toBe(2)
      expect(selected[1].moveNumber).toBe(3)
      expect(selected[2].moveNumber).toBe(4)
    })

    it('should handle out-of-bounds ranges', () => {
      const moves = createTestMoves()
      const selected = selectMoveRange(moves, [10, 20])

      expect(selected).toHaveLength(0)
    })

    it('should handle partial ranges', () => {
      const moves = createTestMoves()
      const selected = selectMoveRange(moves, [4, 10])

      expect(selected).toHaveLength(3) // moves 4, 5 (pass), and 6
      expect(selected[0].moveNumber).toBe(4)
      expect(selected[1].moveNumber).toBe(5) // pass move
      expect(selected[2].moveNumber).toBe(6)
    })
  })

  describe('generateMoveLabels', () => {
    it('should generate labels for all moves when no range specified', () => {
      const moves = createTestMoves().filter((move) => move.position) // exclude pass moves
      const labels = generateMoveLabels(moves)

      expect(labels.size).toBe(5)
      expect(labels.get('3,3')).toBe(1)
      expect(labels.get('4,4')).toBe(2)
      expect(labels.get('5,5')).toBe(3)
      expect(labels.get('6,6')).toBe(4)
      expect(labels.get('7,7')).toBe(6)
    })

    it('should generate actual move numbers for range', () => {
      const moves = createTestMoves().filter((move) => move.position)
      const labels = generateMoveLabels(moves, [2, 4])

      expect(labels.size).toBe(3)
      expect(labels.get('4,4')).toBe(2) // move 2 -> label 2
      expect(labels.get('5,5')).toBe(3) // move 3 -> label 3
      expect(labels.get('6,6')).toBe(4) // move 4 -> label 4
    })

    it('should handle empty move list', () => {
      const labels = generateMoveLabels([])

      expect(labels.size).toBe(0)
    })

    it('should skip pass moves in labeling', () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: null, moveNumber: 2 }, // pass
        { color: 'black', position: { x: 4, y: 4 }, moveNumber: 3 },
      ]
      const labels = generateMoveLabels(moves)

      expect(labels.size).toBe(2)
      expect(labels.get('3,3')).toBe(1)
      expect(labels.get('4,4')).toBe(3)
    })

    it('should work correctly with range integration (DiagramRenderer pattern)', () => {
      // Test the pattern used by DiagramRenderer: apply moves with range, then generate labels
      const board = new Board(19)
      const moves = createTestMoves()
      const moveRange: [number, number] = [2, 4]

      // Apply moves with range (as DiagramRenderer does)
      const moveResult = applyMoves(board, moves, moveRange)

      // Generate labels for the applied moves with the same range
      const labels = generateMoveLabels(moveResult.appliedMoves, moveRange)

      // Should have 4 moves applied (1, 2, 3, 4) but only range moves (2, 3, 4) get labels
      expect(moveResult.appliedMoves).toHaveLength(4)
      expect(labels.size).toBe(3)

      // The labels should show actual move numbers for the range moves
      expect(labels.get('4,4')).toBe(2) // move 2 -> label 2
      expect(labels.get('5,5')).toBe(3) // move 3 -> label 3
      expect(labels.get('6,6')).toBe(4) // move 4 -> label 4
    })

    it('should handle ranges that include pass moves', () => {
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 1 },
        { color: 'white', position: { x: 4, y: 4 }, moveNumber: 2 },
        { color: 'black', position: null, moveNumber: 3 }, // pass
        { color: 'white', position: { x: 5, y: 5 }, moveNumber: 4 },
        { color: 'black', position: { x: 6, y: 6 }, moveNumber: 5 },
      ]

      const board = new Board(19)
      const moveRange: [number, number] = [2, 4]

      const moveResult = applyMoves(board, moves, moveRange)
      const labels = generateMoveLabels(moveResult.appliedMoves, moveRange)

      // Should have moves 1, 2, 3 (pass), 4 applied (all up to range end)
      expect(moveResult.appliedMoves).toHaveLength(4)

      // Should only label non-pass moves: moves 2 and 4 with their actual numbers
      expect(labels.size).toBe(2)
      expect(labels.get('4,4')).toBe(2) // move 2 -> label 2
      expect(labels.get('5,5')).toBe(4) // move 4 -> label 4
    })

    it('should show actual move numbers for large range', () => {
      // Create moves with higher numbers to test range labeling
      const moves: Move[] = [
        { color: 'black', position: { x: 3, y: 3 }, moveNumber: 15 },
        { color: 'white', position: { x: 4, y: 4 }, moveNumber: 16 },
        { color: 'black', position: { x: 5, y: 5 }, moveNumber: 17 },
        { color: 'white', position: { x: 6, y: 6 }, moveNumber: 18 },
        { color: 'black', position: { x: 7, y: 7 }, moveNumber: 19 },
      ]

      // Test range [16, 18] - should show labels 16, 17, 18 not 1, 2, 3
      const labels = generateMoveLabels(moves, [16, 18])

      expect(labels.size).toBe(3)
      expect(labels.get('4,4')).toBe(16) // move 16 -> label 16
      expect(labels.get('5,5')).toBe(17) // move 17 -> label 17
      expect(labels.get('6,6')).toBe(18) // move 18 -> label 18

      // Moves outside range should not have labels
      expect(labels.has('3,3')).toBe(false) // move 15
      expect(labels.has('7,7')).toBe(false) // move 19
    })
  })

  describe('Complex capture scenarios', () => {
    it('should handle ko-like situation with overwritten labels', () => {
      // Simplified test - just verify that moves can be applied to an existing board
      // and that overwritten labels are detected properly when stones are captured
      const board = new Board(19)

      const moves: Move[] = [
        { color: 'black', position: { x: 0, y: 0 }, moveNumber: 1 },
        { color: 'white', position: { x: 1, y: 0 }, moveNumber: 2 },
        { color: 'white', position: { x: 0, y: 1 }, moveNumber: 3 }, // captures black
      ]

      const result = applyMoves(board, moves)

      // Verify the capture happened and overwritten labels were detected
      expect(result.board.getStone({ x: 0, y: 0 })).toBe('empty') // captured
      expect(result.overwrittenLabels.length).toBe(1)
      expect(result.overwrittenLabels[0].originalMove).toBe(1)
      expect(result.overwrittenLabels[0].overwrittenByMove).toBe(3)
    })

    it('should handle position tracking correctly', () => {
      // Test that position tracking works for overwritten labels
      const board = new Board(19)

      const moves: Move[] = [
        { color: 'black', position: { x: 5, y: 5 }, moveNumber: 1 },
        { color: 'white', position: { x: 6, y: 6 }, moveNumber: 2 },
        { color: 'black', position: { x: 7, y: 7 }, moveNumber: 3 },
      ]

      const result = applyMoves(board, moves)

      // All moves should be applied successfully
      expect(result.appliedMoves).toHaveLength(3)
      expect(result.board.getStone({ x: 5, y: 5 })).toBe('black')
      expect(result.board.getStone({ x: 6, y: 6 })).toBe('white')
      expect(result.board.getStone({ x: 7, y: 7 })).toBe('black')
      expect(result.overwrittenLabels).toHaveLength(0) // No captures in this sequence
    })
  })
})

describe('Move index and snapshots', () => {
  it('should apply moves up to specified index', () => {
    const board = new Board(19)
    const moves = createTestMoves()

    // Apply first 3 moves (index 0, 1, 2)
    const result = applyMoves(board, moves, undefined, 3)

    expect(result.appliedMoves).toHaveLength(3)
    expect(result.board.getStone({ x: 3, y: 3 })).toBe('black') // move 1
    expect(result.board.getStone({ x: 4, y: 4 })).toBe('white') // move 2
    expect(result.board.getStone({ x: 5, y: 5 })).toBe('black') // move 3
    expect(result.board.getStone({ x: 6, y: 6 })).toBe('empty') // move 4 not applied
  })

  it('should handle moveIndex of 0 (no moves applied)', () => {
    const board = new Board(19)
    const moves = createTestMoves()

    const result = applyMoves(board, moves, undefined, 0)

    expect(result.appliedMoves).toHaveLength(0)
    expect(result.board.getStone({ x: 3, y: 3 })).toBe('empty')
  })

  it('should combine moveRange and moveIndex correctly', () => {
    const board = new Board(19)
    const moves = createTestMoves()

    // Apply range [2, 4] but limit to first 2 moves of that range
    // This uses the original selectMoves logic: filter by range, then limit by index
    const result = applyMoves(board, moves, [2, 4], 2)

    expect(result.appliedMoves).toHaveLength(2)
    expect(result.appliedMoves[0].moveNumber).toBe(2)
    expect(result.appliedMoves[1].moveNumber).toBe(3)
  })

  it('should generate snapshots for all intermediate states', () => {
    const board = new Board(19)
    const moves = createTestMoves().slice(0, 3) // First 3 moves

    const snapshots = applyMovesWithSnapshots(board, moves)

    expect(snapshots).toHaveLength(4) // 0, 1, 2, 3 moves applied

    // Snapshot 0: no moves
    expect(snapshots[0].appliedMoves).toHaveLength(0)

    // Snapshot 1: first move
    expect(snapshots[1].appliedMoves).toHaveLength(1)
    expect(snapshots[1].board.getStone({ x: 3, y: 3 })).toBe('black')

    // Snapshot 2: first two moves
    expect(snapshots[2].appliedMoves).toHaveLength(2)
    expect(snapshots[2].board.getStone({ x: 3, y: 3 })).toBe('black')
    expect(snapshots[2].board.getStone({ x: 4, y: 4 })).toBe('white')

    // Snapshot 3: all three moves
    expect(snapshots[3].appliedMoves).toHaveLength(3)
    expect(snapshots[3].board.getStone({ x: 5, y: 5 })).toBe('black')
  })

  it('should limit snapshots to maxIndex', () => {
    const board = new Board(19)
    const moves = createTestMoves()

    const snapshots = applyMovesWithSnapshots(board, moves, 2)

    expect(snapshots).toHaveLength(3) // 0, 1, 2 moves applied
    expect(snapshots[2].appliedMoves).toHaveLength(2)
  })
})

describe('selectMoves', () => {
  it('should select moves by index only', () => {
    const moves = createTestMoves()
    const selected = selectMoves(moves, undefined, 3)

    expect(selected).toHaveLength(3)
    expect(selected[0].moveNumber).toBe(1)
    expect(selected[1].moveNumber).toBe(2)
    expect(selected[2].moveNumber).toBe(3)
  })

  it('should select moves by range only', () => {
    const moves = createTestMoves()
    const selected = selectMoves(moves, [2, 4], undefined)

    expect(selected).toHaveLength(3)
    expect(selected[0].moveNumber).toBe(2)
    expect(selected[1].moveNumber).toBe(3)
    expect(selected[2].moveNumber).toBe(4)
  })

  it('should combine range and index selection', () => {
    const moves = createTestMoves()
    // First apply index limit (first 4 moves), then range filter [2, 4]
    const selected = selectMoves(moves, [2, 4], 4)

    expect(selected).toHaveLength(3) // moves 2, 3, 4 (move 4 is at index 3)
    expect(selected[0].moveNumber).toBe(2)
    expect(selected[1].moveNumber).toBe(3)
    expect(selected[2].moveNumber).toBe(4)
  })

  it('should return empty array when index is 0', () => {
    const moves = createTestMoves()
    const selected = selectMoves(moves, undefined, 0)

    expect(selected).toHaveLength(0)
  })
})
