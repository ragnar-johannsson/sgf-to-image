/**
 * Canvas-like interface that works with both browser and node-canvas
 */
export interface CanvasLike {
  width: number
  height: number
  getContext(contextId: '2d'): CanvasRenderingContext2D | null
  toDataURL(type?: string, quality?: number): string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toBuffer?(mime?: string, config?: any): Buffer // node-canvas specific
}

/**
 * Canvas factory that creates canvas instances for both browser and Node.js environments
 */
export class CanvasFactory {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static nodeCanvas: any

  /**
   * Initialize the canvas backend for the current environment
   */
  static async initialize(): Promise<void> {
    // Try to load node-canvas in Node.js environment
    if (typeof window === 'undefined') {
      try {
        // Dynamic import to avoid bundling issues
        CanvasFactory.nodeCanvas = await import('canvas')
      } catch (error) {
        throw new Error(
          `node-canvas is required for server-side rendering. Install with: npm install canvas. Error: ${(error as Error).message}`
        )
      }
    }
  }

  /**
   * Create a canvas with specified dimensions
   */
  static createCanvas(width: number, height: number): CanvasLike {
    if (typeof window !== 'undefined') {
      // Browser environment
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      return canvas
    } else {
      // Node.js environment
      if (!CanvasFactory.nodeCanvas) {
        throw new Error(
          'Canvas factory not initialized. Call CanvasFactory.initialize() first.'
        )
      }
      return CanvasFactory.nodeCanvas.createCanvas(width, height)
    }
  }

  /**
   * Check if we're in a browser environment
   */
  static isBrowser(): boolean {
    return typeof window !== 'undefined'
  }

  /**
   * Check if we're in a Node.js environment
   */
  static isNode(): boolean {
    return typeof window === 'undefined'
  }
}

/**
 * Canvas context wrapper for consistent API
 */
export class CanvasContext {
  private ctx: CanvasRenderingContext2D

  constructor(canvas: CanvasLike) {
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get 2D rendering context')
    }
    this.ctx = context
  }

  /**
   * Get the underlying canvas context
   */
  get context(): CanvasRenderingContext2D {
    return this.ctx
  }

  /**
   * Set fill style
   */
  setFillStyle(style: string | CanvasGradient | CanvasPattern): void {
    this.ctx.fillStyle = style
  }

  /**
   * Set stroke style
   */
  setStrokeStyle(style: string | CanvasGradient | CanvasPattern): void {
    this.ctx.strokeStyle = style
  }

  /**
   * Set line width
   */
  setLineWidth(width: number): void {
    this.ctx.lineWidth = width
  }

  /**
   * Set font
   */
  setFont(font: string): void {
    this.ctx.font = font
  }

  /**
   * Set text alignment
   */
  setTextAlign(align: CanvasTextAlign): void {
    this.ctx.textAlign = align
  }

  /**
   * Set text baseline
   */
  setTextBaseline(baseline: CanvasTextBaseline): void {
    this.ctx.textBaseline = baseline
  }

  /**
   * Begin a new path
   */
  beginPath(): void {
    this.ctx.beginPath()
  }

  /**
   * Move to a point
   */
  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x, y)
  }

  /**
   * Draw a line to a point
   */
  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x, y)
  }

  /**
   * Draw a circle (arc)
   */
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): void {
    this.ctx.arc(x, y, radius, startAngle, endAngle)
  }

  /**
   * Fill the current path
   */
  fill(): void {
    this.ctx.fill()
  }

  /**
   * Stroke the current path
   */
  stroke(): void {
    this.ctx.stroke()
  }

  /**
   * Fill text at a position
   */
  fillText(text: string, x: number, y: number): void {
    this.ctx.fillText(text, x, y)
  }

  /**
   * Stroke text at a position
   */
  strokeText(text: string, x: number, y: number): void {
    this.ctx.strokeText(text, x, y)
  }

  /**
   * Measure text width
   */
  measureText(text: string): TextMetrics {
    return this.ctx.measureText(text)
  }

  /**
   * Clear a rectangular area
   */
  clearRect(x: number, y: number, width: number, height: number): void {
    this.ctx.clearRect(x, y, width, height)
  }

  /**
   * Fill a rectangle
   */
  fillRect(x: number, y: number, width: number, height: number): void {
    this.ctx.fillRect(x, y, width, height)
  }

  /**
   * Save the current drawing state
   */
  save(): void {
    this.ctx.save()
  }

  /**
   * Restore the previous drawing state
   */
  restore(): void {
    this.ctx.restore()
  }
}
