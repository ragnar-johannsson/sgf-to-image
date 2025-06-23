import { describe, it, expect } from 'vitest'
import { convertSgfToImage } from '../src/index'

describe('sgf-to-image', () => {
  it('should export the main function', () => {
    expect(typeof convertSgfToImage).toBe('function')
  })

  it('should throw not implemented error', async () => {
    await expect(
      convertSgfToImage({
        sgf: '',
        size: 'medium',
        format: 'png',
      })
    ).rejects.toThrow('Not implemented yet')
  })
})
