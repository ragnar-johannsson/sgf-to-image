import type { CanvasLike } from './CanvasFactory'
import type { ImageFormat } from '../types'
import { RenderError } from '../types'

/**
 * Default JPEG quality setting
 */
const DEFAULT_JPEG_QUALITY = 0.85

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
      return canvas.toBuffer('image/png')
    } else {
      const qualityValue = quality || DEFAULT_JPEG_QUALITY
      return canvas.toBuffer('image/jpeg', { quality: qualityValue })
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
}
