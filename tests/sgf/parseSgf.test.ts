import { describe, it, expect, afterEach } from 'vitest'
import { writeFileSync, unlinkSync, existsSync } from 'fs'
import { parseSgf } from '../../src/sgf/parseSgf'
import { InvalidSgfError } from '../../src/types'

describe('parseSgf', () => {
  const testSgfFile = 'test-game.sgf'

  afterEach(() => {
    // Clean up test files
    if (existsSync(testSgfFile)) {
      unlinkSync(testSgfFile)
    }
  })

  describe('SGF string input', () => {
    it('should parse a simple SGF string', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[pd];W[dp];B[pp];W[dd])'
      const result = await parseSgf(sgfContent)

      expect(result.boardSize).toBe(19)
      expect(result.moves).toHaveLength(4)
      expect(result.moves[0]).toEqual({
        color: 'black',
        position: { x: 14, y: 3 }, // pd = p(14), d(3)
        moveNumber: 1,
      })
      expect(result.moves[1]).toEqual({
        color: 'white',
        position: { x: 3, y: 14 }, // dp = d(3), p(14)
        moveNumber: 2,
      })
    })

    it('should parse SGF with game information', async () => {
      const sgfContent =
        '(;FF[4]GM[1]SZ[19]PB[Black Player]PW[White Player]RE[B+R]DT[2023-01-01]KM[6.5];B[pd];W[dp])'
      const result = await parseSgf(sgfContent)

      expect(result.gameInfo.playerBlack).toBe('Black Player')
      expect(result.gameInfo.playerWhite).toBe('White Player')
      expect(result.gameInfo.result).toBe('B+R')
      expect(result.gameInfo.date).toBe('2023-01-01')
      expect(result.gameInfo.komi).toBe(6.5)
    })

    it('should handle pass moves', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[pd];W[];B[pp])'
      const result = await parseSgf(sgfContent)

      expect(result.moves).toHaveLength(3)
      expect(result.moves[1]).toEqual({
        color: 'white',
        position: null, // pass move
        moveNumber: 2,
      })
    })

    it('should parse real SGF file with multiple moves', async () => {
      const sgfFile = './tests/fixtures/simple-game.sgf'
      const result = await parseSgf(sgfFile)

      expect(result.boardSize).toBe(19)
      expect(result.gameInfo.playerBlack).toBe('Black Player')
      expect(result.gameInfo.playerWhite).toBe('White Player')
      expect(result.moves.length).toBeGreaterThan(15) // Should have many moves
      expect(result.moves[0]).toEqual({
        color: 'black',
        position: { x: 14, y: 3 }, // pd
        moveNumber: 1,
      })
    })

    it('should handle different board sizes', async () => {
      const sgfFile = './tests/fixtures/simple-9x9.sgf'
      const result = await parseSgf(sgfFile)

      expect(result.boardSize).toBe(9)
      expect(result.moves.length).toBeGreaterThan(5)
    })

    it('should default to 19x19 when no size specified', async () => {
      const sgfContent = '(;FF[4]GM[1];B[pd])'
      const result = await parseSgf(sgfContent)

      expect(result.boardSize).toBe(19)
    })

    it('should throw error for unsupported board sizes', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[21];B[aa])'

      await expect(parseSgf(sgfContent)).rejects.toThrow(InvalidSgfError)
      await expect(parseSgf(sgfContent)).rejects.toThrow(
        'Unsupported board size: 21'
      )
    })

    it('should throw error for invalid SGF content', async () => {
      const invalidSgf = 'not a valid sgf'

      await expect(parseSgf(invalidSgf)).rejects.toThrow(InvalidSgfError)
    })
  })

  describe('File path input', () => {
    it('should parse SGF from file path', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[pd];W[dp])'
      writeFileSync(testSgfFile, sgfContent)

      const result = await parseSgf(testSgfFile)

      expect(result.boardSize).toBe(19)
      expect(result.moves).toHaveLength(2)
    })

    it('should throw error for non-existent file', async () => {
      await expect(parseSgf('non-existent-file.sgf')).rejects.toThrow(
        InvalidSgfError
      )
    })
  })

  describe('File/Blob input', () => {
    it('should parse SGF from File object', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[pd];W[dp])'
      const file = new File([sgfContent], 'test.sgf', {
        type: 'application/x-go-sgf',
      })

      const result = await parseSgf(file)

      expect(result.boardSize).toBe(19)
      expect(result.moves).toHaveLength(2)
    })

    it('should parse SGF from Blob object', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[pd];W[dp])'
      const blob = new Blob([sgfContent], { type: 'application/x-go-sgf' })

      const result = await parseSgf(blob)

      expect(result.boardSize).toBe(19)
      expect(result.moves).toHaveLength(2)
    })
  })

  describe('Position parsing', () => {
    it('should correctly parse SGF coordinates', async () => {
      // Test various positions to ensure coordinate conversion is correct
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[aa];W[ss];B[jj])'
      const result = await parseSgf(sgfContent)

      expect(result.moves[0].position).toEqual({ x: 0, y: 0 }) // aa = top-left
      expect(result.moves[1].position).toEqual({ x: 17, y: 17 }) // ss = s(17), s(17)
      expect(result.moves[2].position).toEqual({ x: 8, y: 8 }) // jj = j(8), j(8)
    })

    it('should handle coordinates that skip "i"', async () => {
      // SGF format skips the letter 'i'
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[hh];W[jj])'
      const result = await parseSgf(sgfContent)

      expect(result.moves[0].position).toEqual({ x: 7, y: 7 }) // h = 7
      expect(result.moves[1].position).toEqual({ x: 8, y: 8 }) // j = 8 (skips i)
    })

    it('should throw error for invalid coordinates', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[zz])'

      await expect(parseSgf(sgfContent)).rejects.toThrow(InvalidSgfError)
    })
  })

  describe('Error handling', () => {
    it('should throw error for invalid input type', async () => {
      // @ts-expect-error - Testing invalid input type
      await expect(parseSgf(123)).rejects.toThrow(InvalidSgfError)
    })

    it('should throw error for empty SGF', async () => {
      await expect(parseSgf('')).rejects.toThrow(InvalidSgfError)
    })

    it('should throw error for malformed SGF', async () => {
      const malformedSgf = '(;FF[4]GM[1]SZ[19];B[pd'

      await expect(parseSgf(malformedSgf)).rejects.toThrow(InvalidSgfError)
    })
  })
})
