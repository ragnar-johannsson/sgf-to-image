import type { CanvasLike } from './CanvasFactory'
import type { ImageFormat } from '../types'
import { RenderError } from '../types'

/**
 * Default JPEG quality setting (85% for optimal size/quality balance)
 */
const DEFAULT_JPEG_QUALITY = 0.85

/**
 * PNG compression level (0-9, where 9 is maximum compression)
 */
const PNG_COMPRESSION_LEVEL = 6

/**
 * Image export utility for converting canvas to various formats
 */
export class ImageExporter {
  /**
   * Export canvas to image buffer
   */
  static exportToBuffer(
    canvas: CanvasLike,
    format: ImageFormat,
    quality?: number
  ): Buffer {
    try {
      if (typeof window !== 'undefined') {
        // Browser environment - convert dataURL to buffer
        return ImageExporter.dataUrlToBuffer(canvas, format, quality)
      } else {
        // Node.js environment - use canvas.toBuffer()
        return ImageExporter.nodeCanvasToBuffer(canvas, format, quality)
      }
    } catch (error) {
      throw new RenderError(
        `Failed to export image: ${(error as Error).message}`
      )
    }
  }

  /**
   * Export canvas to data URL (browser compatible)
   */
  static exportToDataUrl(
    canvas: CanvasLike,
    format: ImageFormat,
    quality?: number
  ): string {
    try {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const qualityValue =
        format === 'jpeg' ? quality || DEFAULT_JPEG_QUALITY : undefined

      return canvas.toDataURL(mimeType, qualityValue)
    } catch (error) {
      throw new RenderError(
        `Failed to export data URL: ${(error as Error).message}`
      )
    }
  }

  /**
   * Convert canvas data URL to buffer (browser environment)
   */
  private static dataUrlToBuffer(
    canvas: CanvasLike,
    format: ImageFormat,
    quality?: number
  ): Buffer {
    const dataUrl = ImageExporter.exportToDataUrl(canvas, format, quality)
    const base64Data = dataUrl.split(',')[1]
    return Buffer.from(base64Data, 'base64')
  }

  /**
   * Export using node-canvas toBuffer method (Node.js environment)
   */
  private static nodeCanvasToBuffer(
    canvas: CanvasLike,
    format: ImageFormat,
    quality?: number
  ): Buffer {
    if (!canvas.toBuffer) {
      throw new RenderError('Canvas does not support buffer export')
    }

    if (format === 'png') {
      return canvas.toBuffer('image/png', {
        compressionLevel: PNG_COMPRESSION_LEVEL,
        filters: canvas.width > 1000 ? 'auto' : 'none', // Apply filters for large images
      })
    } else {
      const qualityValue = quality || DEFAULT_JPEG_QUALITY
      return canvas.toBuffer('image/jpeg', {
        quality: qualityValue,
        progressive: true, // Enable progressive JPEG
        chromaSubsampling: false, // Better quality for diagrams
      })
    }
  }

  /**
   * Get optimal quality setting for format
   */
  static getOptimalQuality(format: ImageFormat): number | undefined {
    return format === 'jpeg' ? DEFAULT_JPEG_QUALITY : undefined
  }

  /**
   * Validate image format
   */
  static validateFormat(format: string): asserts format is ImageFormat {
    if (format !== 'png' && format !== 'jpeg') {
      throw new RenderError(
        `Unsupported image format: ${format}. Supported formats: png, jpeg`
      )
    }
  }

  /**
   * Get MIME type for format
   */
  static getMimeType(format: ImageFormat): string {
    return format === 'png' ? 'image/png' : 'image/jpeg'
  }

  /**
   * Get file extension for format
   */
  static getFileExtension(format: ImageFormat): string {
    return format === 'png' ? '.png' : '.jpg'
  }

  /**
   * Enhanced export function with size and format optimization
   */
  static async exportImage(
    canvas: CanvasLike,
    options: {
      format: ImageFormat
      quality?: number
      optimize?: boolean
    }
  ): Promise<{ buffer: Buffer; size: number; format: ImageFormat }> {
    const startTime = performance.now()

    try {
      const { format, quality, optimize = true } = options

      // Apply optimizations if requested
      const exportQuality = optimize
        ? ImageExporter.getOptimizedQuality(format, canvas.width, quality)
        : quality || ImageExporter.getOptimalQuality(format)

      const buffer = ImageExporter.exportToBuffer(canvas, format, exportQuality)
      const exportTime = performance.now() - startTime

      // Log performance metrics in development
      if (
        typeof process !== 'undefined' &&
        process.env.NODE_ENV !== 'production'
      ) {
        // eslint-disable-next-line no-console
        console.log(
          `Image export: ${canvas.width}×${canvas.height} ${format.toUpperCase()} in ${exportTime.toFixed(1)}ms (${buffer.length} bytes)`
        )
      }

      return {
        buffer,
        size: buffer.length,
        format,
      }
    } catch (error) {
      throw new RenderError(`Image export failed: ${(error as Error).message}`)
    }
  }

  /**
   * Get optimized quality based on image size and format
   */
  private static getOptimizedQuality(
    format: ImageFormat,
    imageSize: number,
    requestedQuality?: number
  ): number | undefined {
    if (format === 'png') {
      return undefined // PNG quality is handled by compression level
    }

    // For JPEG, adjust quality based on image size
    if (requestedQuality !== undefined) {
      return requestedQuality
    }

    if (imageSize >= 2000) {
      return 0.9 // Higher quality for large images
    } else if (imageSize >= 1000) {
      return DEFAULT_JPEG_QUALITY
    } else {
      return 0.8 // Lower quality acceptable for small images
    }
  }

  /**
   * Estimate output file size before export
   */
  static estimateFileSize(
    width: number,
    height: number,
    format: ImageFormat,
    quality?: number
  ): number {
    const pixels = width * height

    if (format === 'png') {
      // PNG size estimation: ~3-4 bytes per pixel for typical Go diagrams
      return Math.floor(pixels * 3.5)
    } else {
      // JPEG size estimation based on quality
      const q = quality || DEFAULT_JPEG_QUALITY
      const bytesPerPixel = 0.5 + q * 2 // Higher quality = more bytes
      return Math.floor(pixels * bytesPerPixel)
    }
  }
}
