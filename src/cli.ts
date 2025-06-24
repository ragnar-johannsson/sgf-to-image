/* eslint-disable no-console */
import { Command } from 'commander'
import { writeFileSync } from 'fs'
import { extname, resolve } from 'path'
import { convertSgfToImage } from './index'
import { LabelType } from './types'
import type { ConvertOptions, ImageFormat } from './types'

/**
 * Parse a range string like "1-5" into a tuple [1, 5]
 */
function parseRange(rangeStr: string): [number, number] {
  const parts = rangeStr.split('-')
  if (parts.length !== 2) {
    throw new Error(
      `Invalid range format: ${rangeStr}. Expected format: "start-end" (e.g., "1-5")`
    )
  }

  const start = parseInt(parts[0], 10)
  const end = parseInt(parts[1], 10)

  if (isNaN(start) || isNaN(end)) {
    throw new Error(
      `Invalid range values: ${rangeStr}. Both start and end must be numbers`
    )
  }

  if (start < 1 || end < 1) {
    throw new Error(
      `Invalid range values: ${rangeStr}. Range values must be positive integers`
    )
  }

  if (start > end) {
    throw new Error(
      `Invalid range: ${rangeStr}. Start value must be less than or equal to end value`
    )
  }

  return [start, end]
}

/**
 * Derive output format from file extension
 */
function deriveFormatFromExtension(outputPath: string): ImageFormat {
  const ext = extname(outputPath).toLowerCase()
  switch (ext) {
    case '.png':
      return 'png'
    case '.jpg':
    case '.jpeg':
      return 'jpeg'
    default:
      throw new Error(
        `Cannot derive format from extension "${ext}". Please specify --format or use .png/.jpg/.jpeg extension`
      )
  }
}

/**
 * Parse label type from string
 */
function parseLabelType(labelTypeStr: string): LabelType {
  switch (labelTypeStr.toLowerCase()) {
    case 'numeric':
      return LabelType.Numeric
    case 'letters':
      return LabelType.Letters
    case 'circle':
      return LabelType.Circle
    case 'square':
      return LabelType.Square
    case 'triangle':
      return LabelType.Triangle
    default:
      throw new Error(
        `Invalid label type: ${labelTypeStr}. Valid options: numeric, letters, circle, square, triangle`
      )
  }
}

/**
 * Parse size option (preset or WxH format)
 */
function parseSize(sizeStr: string) {
  // Check if it's a preset
  if (['small', 'medium', 'large'].includes(sizeStr)) {
    return sizeStr as 'small' | 'medium' | 'large'
  }

  // Check if it's WxH format
  const parts = sizeStr.split('x')
  if (parts.length === 2) {
    const width = parseInt(parts[0], 10)
    const height = parseInt(parts[1], 10)

    if (isNaN(width) || isNaN(height)) {
      throw new Error(
        `Invalid size format: ${sizeStr}. Expected format: "WIDTHxHEIGHT" (e.g., "800x600") or preset (small, medium, large)`
      )
    }

    if (width <= 0 || height <= 0) {
      throw new Error(
        `Invalid size values: ${sizeStr}. Width and height must be positive integers`
      )
    }

    return { width, height }
  }

  throw new Error(
    `Invalid size format: ${sizeStr}. Expected format: "WIDTHxHEIGHT" (e.g., "800x600") or preset (small, medium, large)`
  )
}

/**
 * Main CLI function
 */
export async function main(): Promise<void> {
  const program = new Command()

  program
    .name('sgf-to-image')
    .description(
      'Convert SGF (Smart Game Format) files to high-quality PNG/JPEG diagrams'
    )
    .version('0.1.0')
    .argument('<input>', 'SGF file path to convert')
    .argument('<output>', 'Output image file path')
    .option(
      '-s, --size <size>',
      'Size preset (small, medium, large) or WIDTHxHEIGHT (e.g., 800x600)',
      'medium'
    )
    .option(
      '-f, --format <format>',
      'Output format (png, jpeg) - auto-detected from extension if not specified'
    )
    .option(
      '-r, --range <range>',
      'Move range to show (e.g., "1-10" for moves 1 through 10)'
    )
    .option(
      '-m, --move <number>',
      'Show board state up to specific move number (1-based)',
      (value) => {
        const num = parseInt(value, 10)
        if (isNaN(num) || num < 1) {
          throw new Error('Move number must be a positive integer')
        }
        return num - 1 // Convert to 0-based for internal use
      }
    )
    .option('--last-move-label', 'Mark the last move with a triangle')
    .option('--coordinates', 'Show coordinate labels around the board')
    .option(
      '-l, --label-type <type>',
      'Label rendering type (numeric, letters, circle, square, triangle)',
      'numeric'
    )
    .option(
      '--label-text <text>',
      'Custom text for labels (overrides automatic numbering/lettering)'
    )
    .option(
      '-q, --quality <number>',
      'JPEG quality (1-100, only for JPEG format)',
      (value) => {
        const num = parseFloat(value)
        if (isNaN(num) || num < 1 || num > 100) {
          throw new Error('Quality must be a number between 1 and 100')
        }
        return num
      }
    )

  program.parse()

  const args = program.args
  const options = program.opts()

  const inputPath = args[0]
  const outputPath = args[1]

  try {
    // Validate mutually exclusive options
    if (options.range && options.move !== undefined) {
      throw new Error(
        'Cannot specify both --range and --move options. They are mutually exclusive.'
      )
    }

    // Parse and validate options
    const size = parseSize(options.size)
    const format = options.format
      ? (options.format as ImageFormat)
      : deriveFormatFromExtension(outputPath)
    const labelType = parseLabelType(options.labelType)

    // Validate format
    if (!['png', 'jpeg'].includes(format)) {
      throw new Error(`Invalid format: ${format}. Valid formats: png, jpeg`)
    }

    // Build convert options
    const convertOptions: ConvertOptions = {
      sgf: resolve(inputPath),
      size,
      format,
      showCoordinates: options.coordinates || false,
      labelType,
    }

    // Add optional parameters
    if (options.range) {
      convertOptions.moveRange = parseRange(options.range)
    }

    if (options.move !== undefined) {
      convertOptions.move = options.move
    }

    if (options.lastMoveLabel) {
      convertOptions.lastMoveLabel = true
    }

    if (options.labelText) {
      convertOptions.labelText = options.labelText
    }

    if (options.quality && format === 'jpeg') {
      convertOptions.quality = options.quality
    } else if (options.quality && format === 'png') {
      console.warn('Warning: --quality option is ignored for PNG format')
    }

    // Convert SGF to image
    console.log(`Converting ${inputPath} to ${outputPath}...`)
    const result = await convertSgfToImage(convertOptions)

    // Write output file
    writeFileSync(outputPath, result.imageBuffer)

    // Show success message with stats
    console.log(`✅ Successfully converted SGF to ${format.toUpperCase()}`)
    console.log(`   Board size: ${result.boardSize}x${result.boardSize}`)
    console.log(`   Total moves: ${result.totalMoves}`)
    console.log(
      `   Output: ${outputPath} (${Math.round(result.imageBuffer.length / 1024)}KB)`
    )

    if (result.overwrittenLabels.length > 0) {
      console.log(
        `   Note: Some labels were overwritten: ${result.overwrittenLabels.join(', ')}`
      )
    }
  } catch (error) {
    // Provide descriptive error messages
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`)

      // Provide helpful hints for common errors
      if (error.message.includes('No such file')) {
        console.error(
          '   Make sure the SGF file path is correct and the file exists.'
        )
      } else if (error.message.includes('format')) {
        console.error(
          '   Use --format png or --format jpeg, or ensure output file has .png/.jpg/.jpeg extension.'
        )
      } else if (
        error.message.includes('range') ||
        error.message.includes('move')
      ) {
        console.error(
          '   Check the --range or --move option format. Range should be like "1-10", move should be a positive number.'
        )
      }
    } else {
      console.error('❌ An unexpected error occurred:', error)
    }
    process.exit(1)
  }
}
