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
        position: { x: 15, y: 3 }, // pd = p(15), d(3)
        moveNumber: 1,
      })
      expect(result.moves[1]).toEqual({
        color: 'white',
        position: { x: 3, y: 15 }, // dp = d(3), p(15)
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
        position: { x: 15, y: 3 }, // pd
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
      expect(result.moves[1].position).toEqual({ x: 18, y: 18 }) // ss = s(18), s(18)
      expect(result.moves[2].position).toEqual({ x: 9, y: 9 }) // jj = j(9), j(9)
    })

    it('should handle coordinates that skip "i"', async () => {
      // SGF format skips the letter 'i'
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[hh];W[jj])'
      const result = await parseSgf(sgfContent)

      expect(result.moves[0].position).toEqual({ x: 7, y: 7 }) // h = 7
      expect(result.moves[1].position).toEqual({ x: 9, y: 9 }) // j = 9 (includes i)
    })

    it('should throw error for invalid coordinates', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[zz])'

      await expect(parseSgf(sgfContent)).rejects.toThrow(InvalidSgfError)
    })

    it('should accept "i" as a valid coordinate', async () => {
      // The letter 'i' should be a valid coordinate in SGF format
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[ii])'
      const result = await parseSgf(sgfContent)

      expect(result.moves).toHaveLength(1)
      expect(result.moves[0]).toEqual({
        color: 'black',
        position: { x: 8, y: 8 }, // i = 8
        moveNumber: 1,
      })
    })
  })

  describe('Markup parsing', () => {
    it('should parse circle markup (CR)', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19]CR[pd][qq];B[pd])'
      const result = await parseSgf(sgfContent)

      expect(result.markup).toHaveLength(2)
      expect(result.markup[0]).toEqual({
        type: 'circle',
        position: { x: 15, y: 3 }, // pd
      })
      expect(result.markup[1]).toEqual({
        type: 'circle',
        position: { x: 16, y: 16 }, // qq
      })
    })

    it('should parse square markup (SQ)', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19]SQ[dd][dp];B[pd])'
      const result = await parseSgf(sgfContent)

      expect(result.markup).toHaveLength(2)
      expect(result.markup[0]).toEqual({
        type: 'square',
        position: { x: 3, y: 3 }, // dd
      })
      expect(result.markup[1]).toEqual({
        type: 'square',
        position: { x: 3, y: 15 }, // dp
      })
    })

    it('should parse triangle markup (TR)', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19]TR[pd][pp];B[pd])'
      const result = await parseSgf(sgfContent)

      expect(result.markup).toHaveLength(2)
      expect(result.markup[0]).toEqual({
        type: 'triangle',
        position: { x: 15, y: 3 }, // pd
      })
      expect(result.markup[1]).toEqual({
        type: 'triangle',
        position: { x: 15, y: 15 }, // pp
      })
    })

    it('should parse label markup (LB)', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19]LB[pd:A][qq:B][dd:123];B[pd])'
      const result = await parseSgf(sgfContent)

      expect(result.markup).toHaveLength(3)
      expect(result.markup[0]).toEqual({
        type: 'label',
        position: { x: 15, y: 3 }, // pd
        text: 'A',
      })
      expect(result.markup[1]).toEqual({
        type: 'label',
        position: { x: 16, y: 16 }, // qq
        text: 'B',
      })
      expect(result.markup[2]).toEqual({
        type: 'label',
        position: { x: 3, y: 3 }, // dd
        text: '123',
      })
    })

    it('should parse mixed markup types', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19]CR[pd]SQ[qq]TR[dp]LB[dd:X];B[pd])'
      const result = await parseSgf(sgfContent)

      expect(result.markup).toHaveLength(4)
      expect(result.markup.map((m) => m.type)).toEqual([
        'circle',
        'square',
        'triangle',
        'label',
      ])
    })

    it('should parse markup from multiple nodes', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19]CR[pd];B[dd]SQ[qq];W[dp]LB[pp:A])'
      const result = await parseSgf(sgfContent)

      expect(result.markup).toHaveLength(3)
      expect(result.markup[0].type).toBe('circle')
      expect(result.markup[1].type).toBe('square')
      expect(result.markup[2].type).toBe('label')
    })

    it('should handle labels with colons in text', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19]LB[pd:A:B:C];B[pd])'
      const result = await parseSgf(sgfContent)

      expect(result.markup).toHaveLength(1)
      expect(result.markup[0]).toEqual({
        type: 'label',
        position: { x: 15, y: 3 }, // pd
        text: 'A:B:C',
      })
    })

    it('should return empty markup array when no markup present', async () => {
      const sgfContent = '(;FF[4]GM[1]SZ[19];B[pd];W[dp])'
      const result = await parseSgf(sgfContent)

      expect(result.markup).toEqual([])
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
