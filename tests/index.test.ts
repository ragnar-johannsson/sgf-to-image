import { describe, it, expect } from 'vitest'
import { convertSgfToImage, InvalidSgfError, RenderError } from '../src/index'

describe('SGF to Image API', () => {
  describe('API Structure', () => {
    it('should export the main function', () => {
      expect(typeof convertSgfToImage).toBe('function')
    })

    it('should export error classes', () => {
      expect(InvalidSgfError).toBeDefined()
      expect(RenderError).toBeDefined()
    })
  })

  describe('Error handling', () => {
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
  })
})
