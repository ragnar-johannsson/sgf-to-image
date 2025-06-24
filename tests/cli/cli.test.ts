import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { execa } from 'execa'
import { writeFileSync, existsSync, unlinkSync } from 'fs'
import { resolve } from 'path'

describe('CLI end-to-end tests', () => {
  const testSgfFile = 'test-cli-game.sgf'
  const testOutputFile = 'test-cli-output.png'
  const testJpegOutputFile = 'test-cli-output.jpg'
  const cliPath = resolve('./bin/sgf-to-image.cjs')

  beforeAll(async () => {
    // Create a test SGF file
    const testSgf =
      '(;FF[4]GM[1]SZ[9]PB[Test Black]PW[Test White];B[dd];W[pd];B[dp])'
    writeFileSync(testSgfFile, testSgf)
  })

  afterAll(() => {
    // Clean up test SGF file
    if (existsSync(testSgfFile)) {
      unlinkSync(testSgfFile)
    }
  })

  afterEach(() => {
    // Clean up output files
    const outputFiles = [
      testOutputFile,
      testJpegOutputFile,
      'test-output-custom.png',
    ]
    for (const file of outputFiles) {
      if (existsSync(file)) {
        unlinkSync(file)
      }
    }
  })

  describe('Basic functionality', () => {
    it('should convert SGF to JPEG with explicit format', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testJpegOutputFile,
        '--format',
        'jpeg',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted SGF to JPEG')
      expect(existsSync(testJpegOutputFile)).toBe(true)
    })

    it('should auto-detect format from file extension', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testJpegOutputFile,
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted SGF to JPEG')
      expect(existsSync(testJpegOutputFile)).toBe(true)
    })
  })

  describe('Size options', () => {
    it('should accept size presets', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--size',
        'large',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testOutputFile)).toBe(true)
    })

    it('should accept custom size in WxH format', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--size',
        '800x800',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testOutputFile)).toBe(true)
    })

    it('should reject invalid size format', async () => {
      const result = await execa(
        'node',
        [cliPath, testSgfFile, testOutputFile, '--size', 'invalid'],
        {
          reject: false,
        }
      )

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Invalid size format')
    })
  })

  describe('Move range and selection options', () => {
    it('should accept range option', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--range',
        '1-3',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testOutputFile)).toBe(true)
    })

    it('should accept move option', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--move',
        '2',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testOutputFile)).toBe(true)
    })

    it('should reject mutually exclusive range and move options', async () => {
      const result = await execa(
        'node',
        [cliPath, testSgfFile, testOutputFile, '--range', '1-3', '--move', '2'],
        {
          reject: false,
        }
      )

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Cannot specify both --range and --move')
    })

    it('should reject invalid range format', async () => {
      const result = await execa(
        'node',
        [cliPath, testSgfFile, testOutputFile, '--range', 'invalid'],
        {
          reject: false,
        }
      )

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Invalid range format')
    })

    it('should reject invalid move number', async () => {
      const result = await execa(
        'node',
        [cliPath, testSgfFile, testOutputFile, '--move', '0'],
        {
          reject: false,
        }
      )

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Move number must be a positive integer')
    })
  })

  describe('Label options', () => {
    it('should accept numeric label type', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--label-type',
        'numeric',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testOutputFile)).toBe(true)
    }, 10000) // 10 second timeout

    it('should accept letters label type', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--label-type',
        'letters',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testOutputFile)).toBe(true)
    }, 10000) // 10 second timeout

    it('should reject invalid label type', async () => {
      const result = await execa(
        'node',
        [cliPath, testSgfFile, testOutputFile, '--label-type', 'invalid'],
        {
          reject: false,
        }
      )

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Invalid label type')
    })

    it('should accept custom label text', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--label-text',
        'Custom',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testOutputFile)).toBe(true)
    })

    it('should accept last move label option', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--last-move-label',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testOutputFile)).toBe(true)
    })
  })

  describe('Quality options', () => {
    it('should accept quality option for JPEG', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testJpegOutputFile,
        '--quality',
        '80',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testJpegOutputFile)).toBe(true)
    })

    it('should warn about quality option for PNG', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--quality',
        '80',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stderr).toContain(
        'Warning: --quality option is ignored for PNG format'
      )
      expect(existsSync(testOutputFile)).toBe(true)
    })

    it('should reject invalid quality values', async () => {
      const result = await execa(
        'node',
        [cliPath, testSgfFile, testJpegOutputFile, '--quality', '150'],
        {
          reject: false,
        }
      )

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain(
        'Quality must be a number between 1 and 100'
      )
    })
  })

  describe('Coordinate options', () => {
    it('should accept coordinates option', async () => {
      const result = await execa('node', [
        cliPath,
        testSgfFile,
        testOutputFile,
        '--coordinates',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted')
      expect(existsSync(testOutputFile)).toBe(true)
    })
  })

  describe('Help and version', () => {
    it('should show help when requested', async () => {
      const result = await execa('node', [cliPath, '--help'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Usage:')
      expect(result.stdout).toContain('Convert SGF')
      expect(result.stdout).toContain('Options:')
    })

    it('should show version when requested', async () => {
      const result = await execa('node', [cliPath, '--version'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('0.1.0')
    })
  })

  describe('Error handling', () => {
    it('should handle missing input file', async () => {
      const result = await execa(
        'node',
        [cliPath, 'nonexistent.sgf', testOutputFile],
        {
          reject: false,
        }
      )

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Error:')
    })

    it('should handle missing arguments', async () => {
      const result = await execa('node', [cliPath], {
        reject: false,
      })

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('error: missing required argument')
    })

    it('should handle unsupported file extension', async () => {
      const result = await execa('node', [cliPath, testSgfFile, 'output.txt'], {
        reject: false,
      })

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Cannot derive format from extension')
    })
  })

  describe('Output format derivation', () => {
    it('should derive PNG format from .png extension', async () => {
      const result = await execa('node', [cliPath, testSgfFile, 'test.png'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted SGF to PNG')
      expect(existsSync('test.png')).toBe(true)

      // Clean up
      unlinkSync('test.png')
    })

    it('should derive JPEG format from .jpg extension', async () => {
      const result = await execa('node', [cliPath, testSgfFile, 'test.jpg'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted SGF to JPEG')
      expect(existsSync('test.jpg')).toBe(true)

      // Clean up
      unlinkSync('test.jpg')
    })

    it('should derive JPEG format from .jpeg extension', async () => {
      const result = await execa('node', [cliPath, testSgfFile, 'test.jpeg'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Successfully converted SGF to JPEG')
      expect(existsSync('test.jpeg')).toBe(true)

      // Clean up
      unlinkSync('test.jpeg')
    })
  })
})
