import { describe, it, expect } from 'vitest'
import { Board } from '../../src/board/Board'

describe('Board', () => {
  describe('Construction', () => {
    it('should create an empty board of correct size', () => {
      const board = new Board(19)
      expect(board.size).toBe(19)

      // Check that all positions are empty
      for (let x = 0; x < 19; x++) {
        for (let y = 0; y < 19; y++) {
          expect(board.getStone({ x, y })).toBe('empty')
        }
      }
    })

    it('should create boards of different sizes', () => {
      const sizes = [9, 13, 19]
      for (const size of sizes) {
        const board = new Board(size)
        expect(board.size).toBe(size)
      }
    })

    it('should throw error for invalid board sizes', () => {
      expect(() => new Board(0)).toThrow('Invalid board size: 0')
      expect(() => new Board(-1)).toThrow('Invalid board size: -1')
      expect(() => new Board(26)).toThrow('Invalid board size: 26')
    })

    it('should create empty board using static method', () => {
      const board = Board.empty(19)
      expect(board.size).toBe(19)
      expect(board.getStone({ x: 0, y: 0 })).toBe('empty')
    })
  })

  describe('Stone placement', () => {
    it('should place a stone on empty position', () => {
      const board = new Board(19)
      const newBoard = board.placeStone({ x: 3, y: 3 }, 'black')

      expect(newBoard.getStone({ x: 3, y: 3 })).toBe('black')
      expect(board.getStone({ x: 3, y: 3 })).toBe('empty') // Original unchanged
    })

    it('should place stones of different colors', () => {
      const board = new Board(19)
      const board1 = board.placeStone({ x: 3, y: 3 }, 'black')
      const board2 = board1.placeStone({ x: 4, y: 4 }, 'white')

      expect(board2.getStone({ x: 3, y: 3 })).toBe('black')
      expect(board2.getStone({ x: 4, y: 4 })).toBe('white')
    })

    it('should throw error for invalid positions', () => {
      const board = new Board(19)

      expect(() => board.placeStone({ x: -1, y: 0 }, 'black')).toThrow(
        'Invalid position'
      )
      expect(() => board.placeStone({ x: 19, y: 0 }, 'black')).toThrow(
        'Invalid position'
      )
      expect(() => board.placeStone({ x: 0, y: -1 }, 'black')).toThrow(
        'Invalid position'
      )
      expect(() => board.placeStone({ x: 0, y: 19 }, 'black')).toThrow(
        'Invalid position'
      )
    })

    it('should throw error for occupied positions', () => {
      const board = new Board(19)
      const newBoard = board.placeStone({ x: 3, y: 3 }, 'black')

      expect(() => newBoard.placeStone({ x: 3, y: 3 }, 'white')).toThrow(
        'Position already occupied'
      )
    })

    it('should throw error for empty stone color', () => {
      const board = new Board(19)

      expect(() => board.placeStone({ x: 3, y: 3 }, 'empty')).toThrow(
        'Cannot place empty stone'
      )
    })
  })

  describe('Position validation', () => {
    it('should correctly validate positions', () => {
      const board = new Board(19)

      expect(board.isValidPosition({ x: 0, y: 0 })).toBe(true)
      expect(board.isValidPosition({ x: 18, y: 18 })).toBe(true)
      expect(board.isValidPosition({ x: 9, y: 9 })).toBe(true)

      expect(board.isValidPosition({ x: -1, y: 0 })).toBe(false)
      expect(board.isValidPosition({ x: 19, y: 0 })).toBe(false)
      expect(board.isValidPosition({ x: 0, y: -1 })).toBe(false)
      expect(board.isValidPosition({ x: 0, y: 19 })).toBe(false)
    })

    it('should return empty for invalid positions', () => {
      const board = new Board(19)

      expect(board.getStone({ x: -1, y: 0 })).toBe('empty')
      expect(board.getStone({ x: 19, y: 0 })).toBe('empty')
      expect(board.getStone({ x: 0, y: -1 })).toBe('empty')
      expect(board.getStone({ x: 0, y: 19 })).toBe('empty')
    })
  })

  describe('Group detection', () => {
    it('should detect single stone group', () => {
      const board = new Board(19)
      const newBoard = board.placeStone({ x: 3, y: 3 }, 'black')

      const group = newBoard.getGroup({ x: 3, y: 3 })
      expect(group).toHaveLength(1)
      expect(group[0]).toEqual({ x: 3, y: 3 })
    })

    it('should detect connected group', () => {
      let board = new Board(19)
      board = board.placeStone({ x: 3, y: 3 }, 'black')
      board = board.placeStone({ x: 3, y: 4 }, 'black')
      board = board.placeStone({ x: 4, y: 3 }, 'black')

      const group = board.getGroup({ x: 3, y: 3 })
      expect(group).toHaveLength(3)
      expect(group).toContainEqual({ x: 3, y: 3 })
      expect(group).toContainEqual({ x: 3, y: 4 })
      expect(group).toContainEqual({ x: 4, y: 3 })
    })

    it('should return empty for empty position', () => {
      const board = new Board(19)
      const group = board.getGroup({ x: 3, y: 3 })
      expect(group).toHaveLength(0)
    })

    it('should not include different colored stones', () => {
      let board = new Board(19)
      board = board.placeStone({ x: 3, y: 3 }, 'black')
      board = board.placeStone({ x: 3, y: 4 }, 'white')

      const blackGroup = board.getGroup({ x: 3, y: 3 })
      const whiteGroup = board.getGroup({ x: 3, y: 4 })

      expect(blackGroup).toHaveLength(1)
      expect(whiteGroup).toHaveLength(1)
      expect(blackGroup[0]).toEqual({ x: 3, y: 3 })
      expect(whiteGroup[0]).toEqual({ x: 3, y: 4 })
    })
  })

  describe('Liberty detection', () => {
    it('should detect liberties for single stone', () => {
      const board = new Board(19)
      const newBoard = board.placeStone({ x: 3, y: 3 }, 'black')

      const group = newBoard.getGroup({ x: 3, y: 3 })
      expect(newBoard.hasLiberties(group)).toBe(true)
    })

    it('should detect when group has no liberties', () => {
      let board = new Board(19)
      // Place black stone in corner
      board = board.placeStone({ x: 0, y: 0 }, 'black')
      // Surround it with white stones
      board = board.placeStone({ x: 1, y: 0 }, 'white')
      board = board.placeStone({ x: 0, y: 1 }, 'white')

      const blackGroup = board.getGroup({ x: 0, y: 0 })
      expect(board.hasLiberties(blackGroup)).toBe(false)
    })

    it('should detect liberties for connected group', () => {
      let board = new Board(19)
      board = board.placeStone({ x: 3, y: 3 }, 'black')
      board = board.placeStone({ x: 3, y: 4 }, 'black')

      const group = board.getGroup({ x: 3, y: 3 })
      expect(board.hasLiberties(group)).toBe(true)
    })
  })

  describe('Capturing', () => {
    it('should capture single stone', () => {
      let board = new Board(19)
      // Place black stone in corner
      board = board.placeStone({ x: 0, y: 0 }, 'black')
      // Surround with white stones, last move should capture
      board = board.placeStone({ x: 1, y: 0 }, 'white')
      const finalBoard = board.placeStone({ x: 0, y: 1 }, 'white')

      expect(finalBoard.getStone({ x: 0, y: 0 })).toBe('empty')
      expect(finalBoard.getStone({ x: 1, y: 0 })).toBe('white')
      expect(finalBoard.getStone({ x: 0, y: 1 })).toBe('white')
    })

    it('should capture connected group', () => {
      let board = new Board(19)
      // Place black stones
      board = board.placeStone({ x: 1, y: 1 }, 'black')
      board = board.placeStone({ x: 1, y: 2 }, 'black')

      // Surround with white stones
      board = board.placeStone({ x: 0, y: 1 }, 'white')
      board = board.placeStone({ x: 0, y: 2 }, 'white')
      board = board.placeStone({ x: 2, y: 1 }, 'white')
      board = board.placeStone({ x: 2, y: 2 }, 'white')
      board = board.placeStone({ x: 1, y: 0 }, 'white')
      const finalBoard = board.placeStone({ x: 1, y: 3 }, 'white')

      expect(finalBoard.getStone({ x: 1, y: 1 })).toBe('empty')
      expect(finalBoard.getStone({ x: 1, y: 2 })).toBe('empty')
    })

    it('should prevent suicide moves', () => {
      let board = new Board(19)
      // Create a situation where placing a stone would be suicide
      board = board.placeStone({ x: 1, y: 0 }, 'white')
      board = board.placeStone({ x: 0, y: 1 }, 'white')

      expect(() => board.placeStone({ x: 0, y: 0 }, 'black')).toThrow(
        'Suicide move not allowed'
      )
    })

    it('should allow capture even if it looks like suicide', () => {
      let board = new Board(19)
      // Set up a position where white can capture even though it seems like suicide
      board = board.placeStone({ x: 1, y: 0 }, 'black')
      board = board.placeStone({ x: 0, y: 1 }, 'black')
      board = board.placeStone({ x: 2, y: 0 }, 'white')
      board = board.placeStone({ x: 1, y: 1 }, 'white')

      // This should capture the black stone at (1,0) and be legal
      const finalBoard = board.placeStone({ x: 0, y: 0 }, 'white')
      expect(finalBoard.getStone({ x: 0, y: 0 })).toBe('white')
      expect(finalBoard.getStone({ x: 1, y: 0 })).toBe('empty') // captured
    })
  })

  describe('Board equality and utilities', () => {
    it('should detect equal boards', () => {
      const board1 = new Board(19)
      const board2 = new Board(19)

      expect(board1.equals(board2)).toBe(true)
    })

    it('should detect different boards', () => {
      const board1 = new Board(19)
      const board2 = board1.placeStone({ x: 3, y: 3 }, 'black')

      expect(board1.equals(board2)).toBe(false)
    })

    it('should detect different sized boards', () => {
      const board1 = new Board(19)
      const board2 = new Board(13)

      expect(board1.equals(board2)).toBe(false)
    })

    it('should convert to array correctly', () => {
      let board = new Board(3)
      board = board.placeStone({ x: 1, y: 1 }, 'black')

      const array = board.toArray()
      expect(array).toHaveLength(3)
      expect(array[0]).toEqual(['empty', 'empty', 'empty'])
      expect(array[1]).toEqual(['empty', 'black', 'empty'])
      expect(array[2]).toEqual(['empty', 'empty', 'empty'])
    })
  })
})
