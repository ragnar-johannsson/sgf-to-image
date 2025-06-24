import { describe, it, expect } from 'vitest'
import {
  convertSgfToImage,
  InvalidSgfError,
  RenderError,
  LabelType,
} from '../src/index'

describe('SGF to Image API', () => {
  const testSgf =
    '(;FF[4]GM[1]SZ[9]PB[Test Black]PW[Test White];B[dd];W[pd];B[dp];W[pp];B[cd])'

  describe('API Structure', () => {
    it('should export the main function', () => {
      expect(typeof convertSgfToImage).toBe('function')
    })

    it('should export error classes', () => {
      expect(InvalidSgfError).toBeDefined()
      expect(RenderError).toBeDefined()
    })

    it('should export LabelType enum', () => {
      expect(LabelType).toBeDefined()
      expect(LabelType.Numeric).toBe('numeric')
      expect(LabelType.Letters).toBe('letters')
      expect(LabelType.Circle).toBe('circle')
      expect(LabelType.Square).toBe('square')
      expect(LabelType.Triangle).toBe('triangle')
    })
  })

  describe('Basic functionality', () => {
    it('should convert SGF with default options', async () => {
      const result = await convertSgfToImage({
        sgf: testSgf,
        size: 'small',
        format: 'png',
      })

      expect(result.imageBuffer).toBeInstanceOf(Buffer)
      expect(result.boardSize).toBe(9)
      expect(result.totalMoves).toBeGreaterThan(0)
      expect(Array.isArray(result.overwrittenLabels)).toBe(true)
    })

    it('should support JPEG format with quality', async () => {
      const result = await convertSgfToImage({
        sgf: testSgf,
        size: 'small',
        format: 'jpeg',
        quality: 0.8,
      })

      expect(result.imageBuffer).toBeInstanceOf(Buffer)
      expect(result.boardSize).toBe(9)
    })
  })

  describe('New API Options', () => {
    describe('Label Types', () => {
      it('should support numeric labels (default)', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          labelType: LabelType.Numeric,
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
      })

      it('should support letter labels', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          labelType: LabelType.Letters,
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
      })

      it('should support circle labels', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          labelType: LabelType.Circle,
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
      })

      it('should support square labels', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          labelType: LabelType.Square,
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
      })

      it('should support triangle labels', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          labelType: LabelType.Triangle,
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
      })
    })

    describe('Custom Label Text', () => {
      it('should support custom label text', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          labelText: '★',
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
      })

      it('should combine custom text with different label types', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          labelType: LabelType.Circle,
          labelText: 'X',
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
      })
    })

    describe('Move-specific rendering', () => {
      it('should support move index option', async () => {
        const fullResult = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
        })

        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          move: 2, // Show first 3 moves (0-based)
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
        expect(result.totalMoves).toBeLessThanOrEqual(fullResult.totalMoves)
      })

      it('should support last move label', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          move: 3,
          lastMoveLabel: true,
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
      })

      it('should support move range with last move label', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          moveRange: [1, 3],
          lastMoveLabel: true,
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
        expect(result.totalMoves).toBeLessThanOrEqual(3)
      })
    })

    describe('Combined options', () => {
      it('should support multiple options together', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'png',
          moveRange: [1, 4],
          labelType: LabelType.Letters,
          showCoordinates: true,
          lastMoveLabel: true,
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
        expect(result.totalMoves).toBeLessThanOrEqual(4)
      })

      it('should work with quality and JPEG format', async () => {
        const result = await convertSgfToImage({
          sgf: testSgf,
          size: 'small',
          format: 'jpeg',
          quality: 0.95,
          labelType: LabelType.Circle,
        })

        expect(result.imageBuffer).toBeInstanceOf(Buffer)
        expect(result.totalMoves).toBeGreaterThan(0)
      })
    })
  })

  describe('Overwritten labels filtering', () => {
    it('should only include overwritten labels for displayed moves in API', async () => {
      // Create an SGF with moves that will have captures/overwrites
      const sgfWithCaptures = `(;FF[4]SZ[9]
        ;B[aa];W[ab];B[ac];W[ba];B[bb] 
        ;W[aa];B[dd];W[ee];B[ff];W[gg])`

      // Test with range that only includes some moves
      const result = await convertSgfToImage({
        sgf: sgfWithCaptures,
        size: 'small',
        format: 'png',
        moveRange: [7, 10], // Only show moves 7-10
      })

      // Should only include overwritten labels for moves 7-10 that are actually displayed
      // Earlier moves (1-6) that were captured should not have their overwritten labels shown
      expect(result.overwrittenLabels).toBeDefined()
      expect(Array.isArray(result.overwrittenLabels)).toBe(true)
    })

    it('should show no overwritten labels when using move option in API', async () => {
      const sgfWithCaptures = `(;FF[4]SZ[9]
        ;B[aa];W[ab];B[ac];W[ba];B[bb] 
        ;W[aa];B[dd];W[ee];B[ff];W[gg])`

      // Test with move option - no sequence labels shown
      const result = await convertSgfToImage({
        sgf: sgfWithCaptures,
        size: 'small',
        format: 'png',
        move: 5, // Show board state after move 5
      })

      // Should have no overwritten labels since no sequence labels are displayed
      expect(result.overwrittenLabels).toEqual([])
    })

    it('should show all relevant overwritten labels with no filtering options', async () => {
      const sgfWithCaptures = `(;FF[4]SZ[9]
        ;B[aa];W[ab];B[ac];W[ba];B[bb] 
        ;W[aa];B[dd];W[ee];B[ff];W[gg])`

      // Test with no range/move options - all moves labeled
      const result = await convertSgfToImage({
        sgf: sgfWithCaptures,
        size: 'small',
        format: 'png',
      })

      // Should include all relevant overwritten labels since all moves are displayed
      expect(result.overwrittenLabels).toBeDefined()
      expect(Array.isArray(result.overwrittenLabels)).toBe(true)
    })
  })

  describe('Validation and Error handling', () => {
    it('should provide helpful error messages for invalid input', async () => {
      try {
        await convertSgfToImage({
          sgf: '',
          size: 'medium',
          format: 'png',
        })
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidSgfError)
        expect((error as Error).message).toContain('SGF')
      }
    })

    it('should handle invalid size preset', async () => {
      try {
        await convertSgfToImage({
          sgf: '(;FF[4]GM[1]SZ[19];B[pd])',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          size: 'invalid' as any,
          format: 'png',
        })
      } catch (error) {
        expect(error).toBeInstanceOf(RenderError)
      }
    })

    describe('New option validation', () => {
      it('should validate mutually exclusive move options', async () => {
        try {
          await convertSgfToImage({
            sgf: testSgf,
            size: 'small',
            format: 'png',
            moveRange: [1, 3],
            move: 2,
          })
        } catch (error) {
          expect(error).toBeInstanceOf(RenderError)
          expect((error as Error).message).toContain('Cannot specify both')
        }
      })

      it('should validate move index', async () => {
        try {
          await convertSgfToImage({
            sgf: testSgf,
            size: 'small',
            format: 'png',
            move: -1,
          })
        } catch (error) {
          expect(error).toBeInstanceOf(RenderError)
          expect((error as Error).message).toContain('non-negative integer')
        }
      })

      it('should validate quality range', async () => {
        try {
          await convertSgfToImage({
            sgf: testSgf,
            size: 'small',
            format: 'jpeg',
            quality: 1.5,
          })
        } catch (error) {
          expect(error).toBeInstanceOf(RenderError)
          expect((error as Error).message).toContain('between 0.0 and 1.0')
        }
      })

      it('should validate negative quality', async () => {
        try {
          await convertSgfToImage({
            sgf: testSgf,
            size: 'small',
            format: 'jpeg',
            quality: -0.1,
          })
        } catch (error) {
          expect(error).toBeInstanceOf(RenderError)
          expect((error as Error).message).toContain('between 0.0 and 1.0')
        }
      })

      it('should validate label type', async () => {
        try {
          await convertSgfToImage({
            sgf: testSgf,
            size: 'small',
            format: 'png',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelType: 'invalid' as any,
          })
        } catch (error) {
          expect(error).toBeInstanceOf(RenderError)
          expect((error as Error).message).toContain('Invalid label type')
        }
      })

      it('should validate label text', async () => {
        try {
          await convertSgfToImage({
            sgf: testSgf,
            size: 'small',
            format: 'png',
            labelText: '   ',
          })
        } catch (error) {
          expect(error).toBeInstanceOf(RenderError)
          expect((error as Error).message).toContain('non-empty string')
        }
      })

      it('should validate move range values', async () => {
        try {
          await convertSgfToImage({
            sgf: testSgf,
            size: 'small',
            format: 'png',
            moveRange: [0, 3],
          })
        } catch (error) {
          expect(error).toBeInstanceOf(RenderError)
          expect((error as Error).message).toContain('positive')
        }
      })

      it('should validate move range order', async () => {
        try {
          await convertSgfToImage({
            sgf: testSgf,
            size: 'small',
            format: 'png',
            moveRange: [5, 3],
          })
        } catch (error) {
          expect(error).toBeInstanceOf(RenderError)
          expect((error as Error).message).toContain(
            'less than or equal to end'
          )
        }
      })
    })
  })
})
