import { CanvasContext, type CanvasLike } from './CanvasFactory'
import type { Board } from '../board/Board'
import type { Position, StoneColor, Markup } from '../types'
import { LabelType } from '../types'

/**
 * Configuration options for board rendering
 */
export interface RenderOptions {
  size: number // Canvas size in pixels
  showCoordinates: boolean
  backgroundColor: string
  lineColor: string
  stoneColors: {
    black: string
    white: string
  }
  textColor: string
  textStrokeColor: string
}

/**
 * Default rendering options
 */
export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  size: 480,
  showCoordinates: false,
  backgroundColor: '#ffffff',
  lineColor: '#000000',
  stoneColors: {
    black: '#000000',
    white: '#ffffff',
  },
  textColor: '#000000',
  textStrokeColor: '#ffffff',
}

/**
 * Star point positions for different board sizes
 */
const STAR_POINTS: Record<number, Position[]> = {
  9: [
    { x: 2, y: 2 },
    { x: 6, y: 2 },
    { x: 4, y: 4 },
    { x: 2, y: 6 },
    { x: 6, y: 6 },
  ],
  13: [
    { x: 3, y: 3 },
    { x: 9, y: 3 },
    { x: 6, y: 6 },
    { x: 3, y: 9 },
    { x: 9, y: 9 },
  ],
  19: [
    { x: 3, y: 3 },
    { x: 9, y: 3 },
    { x: 15, y: 3 },
    { x: 3, y: 9 },
    { x: 9, y: 9 },
    { x: 15, y: 9 },
    { x: 3, y: 15 },
    { x: 9, y: 15 },
    { x: 15, y: 15 },
  ],
}

/**
 * Board renderer for drawing Go boards with stones and labels
 */
export class BoardRenderer {
  private canvas: CanvasLike
  private ctx: CanvasContext
  private boardSize: number
  private options: RenderOptions
  private cellSize: number
  private margin: number

  constructor(
    canvas: CanvasLike,
    boardSize: number,
    options: Partial<RenderOptions> = {}
  ) {
    this.canvas = canvas
    this.ctx = new CanvasContext(canvas)
    this.boardSize = boardSize
    this.options = { ...DEFAULT_RENDER_OPTIONS, ...options }

    // Calculate cell size and margin. Use a generous margin to ensure stones on
    // the first/last lines never clip the image edge.
    const coordinateSpace = this.options.showCoordinates ? 50 : 40
    const availableSpace = this.options.size - coordinateSpace * 2
    this.cellSize = availableSpace / (boardSize - 1)
    this.margin = coordinateSpace

    // Set canvas size
    this.canvas.width = this.options.size
    this.canvas.height = this.options.size
  }

  /**
   * Render the complete board with background, grid, star points, and coordinates
   */
  renderBoard(): void {
    this.clearCanvas()
    this.drawBackground()
    this.drawGrid()
    this.drawStarPoints()
    if (this.options.showCoordinates) {
      this.drawCoordinates()
    }
  }

  /**
   * Render stones on the board
   */
  renderStones(board: Board): void {
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        const position = { x, y }
        const stone = board.getStone(position)
        if (stone !== 'empty') {
          this.drawStone(position, stone)
        }
      }
    }
  }

  /**
   * Render move labels on stones
   */
  renderMoveLabels(
    labels: Map<string, number>,
    board?: Board,
    labelType: LabelType = LabelType.Numeric
  ): void {
    for (const [positionKey, label] of labels.entries()) {
      const [x, y] = positionKey.split(',').map(Number)
      const position = { x, y }
      let stoneColor: StoneColor = 'black'
      if (board) {
        const color = board.getStone(position)
        if (color === 'empty') {
          continue
        }
        stoneColor = color
      }
      this.drawMoveLabel(position, label.toString(), stoneColor, labelType)
    }
  }

  /**
   * Render markup shapes and labels on the board
   */
  renderMarkup(markup: Markup[], board?: Board): void {
    for (const mark of markup) {
      let stoneColor: StoneColor = 'empty'
      if (board) {
        stoneColor = board.getStone(mark.position)
      }

      switch (mark.type) {
        case 'circle':
          this.drawMarkupShape(mark.position, 'circle', stoneColor)
          break
        case 'square':
          this.drawMarkupShape(mark.position, 'square', stoneColor)
          break
        case 'triangle':
          this.drawMarkupShape(mark.position, 'triangle', stoneColor)
          break
        case 'label':
          this.drawMarkupLabel(mark.position, mark.text || '', stoneColor)
          break
      }
    }
  }

  /**
   * Render overwritten labels caption beneath the board
   */
  renderOverwrittenLabels(overwrittenLabels: string[]): void {
    if (overwrittenLabels.length === 0) {
      return
    }

    const captionY = this.options.size - 10
    const captionText = overwrittenLabels.join(', ')

    this.ctx.setFont('12px monospace')
    this.ctx.setTextAlign('center')
    this.ctx.setTextBaseline('bottom')
    this.ctx.setFillStyle(this.options.textColor)

    this.ctx.fillText(captionText, this.options.size / 2, captionY)
  }

  /**
   * Clear the entire canvas
   */
  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Draw the background
   */
  private drawBackground(): void {
    this.ctx.setFillStyle(this.options.backgroundColor)
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Draw the grid lines
   */
  private drawGrid(): void {
    this.ctx.setStrokeStyle(this.options.lineColor)
    this.ctx.setLineWidth(1)
    this.ctx.beginPath()

    // Draw vertical lines
    for (let i = 0; i < this.boardSize; i++) {
      const x = this.margin + i * this.cellSize
      this.ctx.moveTo(x, this.margin)
      this.ctx.lineTo(x, this.margin + (this.boardSize - 1) * this.cellSize)
    }

    // Draw horizontal lines
    for (let i = 0; i < this.boardSize; i++) {
      const y = this.margin + i * this.cellSize
      this.ctx.moveTo(this.margin, y)
      this.ctx.lineTo(this.margin + (this.boardSize - 1) * this.cellSize, y)
    }

    this.ctx.stroke()

    // Draw an outer border around the grid for a crisp edge (example style)
    this.ctx.beginPath()
    this.ctx.moveTo(this.margin, this.margin)
    this.ctx.lineTo(
      this.margin + (this.boardSize - 1) * this.cellSize,
      this.margin
    )
    this.ctx.lineTo(
      this.margin + (this.boardSize - 1) * this.cellSize,
      this.margin + (this.boardSize - 1) * this.cellSize
    )
    this.ctx.lineTo(
      this.margin,
      this.margin + (this.boardSize - 1) * this.cellSize
    )
    this.ctx.lineTo(this.margin, this.margin) // back to start to complete rectangle
    this.ctx.stroke()
  }

  /**
   * Draw star points
   */
  private drawStarPoints(): void {
    const starPoints = STAR_POINTS[this.boardSize] || []
    // Smaller, subtler star-points (roughly 5% of a cell or 2px minimum)
    const radius = Math.max(2, this.cellSize * 0.05)

    this.ctx.setFillStyle(this.options.lineColor)

    for (const point of starPoints) {
      const x = this.margin + point.x * this.cellSize
      const y = this.margin + point.y * this.cellSize

      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  /**
   * Draw coordinate labels around the board
   */
  private drawCoordinates(): void {
    const fontSize = Math.max(10, this.cellSize * 0.3)
    this.ctx.setFont(`${fontSize}px sans-serif`)
    this.ctx.setTextAlign('center')
    this.ctx.setTextBaseline('middle')
    this.ctx.setFillStyle(this.options.textColor)

    // Column labels (A, B, C, ...)
    for (let i = 0; i < this.boardSize; i++) {
      const letter = String.fromCharCode(65 + i + (i >= 8 ? 1 : 0)) // Skip 'I'
      const x = this.margin + i * this.cellSize

      // Top
      this.ctx.fillText(letter, x, this.margin / 2)
      // Bottom
      this.ctx.fillText(letter, x, this.options.size - this.margin / 2)
    }

    // Row labels (1, 2, 3, ...)
    for (let i = 0; i < this.boardSize; i++) {
      const number = (this.boardSize - i).toString()
      const y = this.margin + i * this.cellSize

      // Left
      this.ctx.fillText(number, this.margin / 2, y)
      // Right
      this.ctx.fillText(number, this.options.size - this.margin / 2, y)
    }
  }

  /**
   * Draw a stone at the given position
   */
  private drawStone(position: Position, color: StoneColor): void {
    const x = this.margin + position.x * this.cellSize
    const y = this.margin + position.y * this.cellSize
    // Make stones slightly larger so adjacent stones touch and grid lines
    // are not visible between them.
    const radius = this.cellSize * 0.49

    // Draw main stone (flat – no shadow for the minimalist style)
    const stoneColor =
      color === 'black'
        ? this.options.stoneColors.black
        : this.options.stoneColors.white
    this.ctx.setFillStyle(stoneColor)
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()

    // Draw stone border
    this.ctx.setStrokeStyle(this.options.lineColor)
    this.ctx.setLineWidth(1)
    this.ctx.stroke()
  }

  /**
   * Draw a move label on a stone
   */
  private drawMoveLabel(
    position: Position,
    label: string,
    stoneColor: StoneColor,
    labelType: LabelType = LabelType.Numeric
  ): void {
    // Check if this is a special last move label
    const labelNum = parseInt(label, 10)
    if (labelNum === -1) {
      // Draw a triangle for the last move
      this.drawLastMoveMarker(position, stoneColor)
      return
    }

    // Convert label text based on label type
    const displayText = this.convertLabelToText(label, labelType)

    // Handle different label rendering modes
    switch (labelType) {
      case LabelType.Circle:
        this.drawMarkupShape(position, 'circle', stoneColor)
        this.drawTextLabel(position, displayText, stoneColor)
        break
      case LabelType.Square:
        this.drawMarkupShape(position, 'square', stoneColor)
        this.drawTextLabel(position, displayText, stoneColor)
        break
      case LabelType.Triangle:
        this.drawMarkupShape(position, 'triangle', stoneColor)
        this.drawTextLabel(position, displayText, stoneColor)
        break
      case LabelType.Numeric:
      case LabelType.Letters:
      default:
        this.drawTextLabel(position, displayText, stoneColor)
        break
    }
  }

  /**
   * Draw a special marker for the last move (triangle)
   */
  private drawLastMoveMarker(position: Position, stoneColor: StoneColor): void {
    const x = this.margin + position.x * this.cellSize
    const y = this.margin + position.y * this.cellSize
    const size = this.cellSize * 0.25

    this.ctx.beginPath()
    this.ctx.moveTo(x, y - size) // top point
    this.ctx.lineTo(x - size, y + size) // bottom left
    this.ctx.lineTo(x + size, y + size) // bottom right
    this.ctx.lineTo(x, y - size) // back to top to close triangle

    const fillColor = stoneColor === 'black' ? '#ffffff' : '#000000'
    this.ctx.setFillStyle(fillColor)
    this.ctx.fill()

    // Add a stroke for better visibility
    this.ctx.setStrokeStyle(stoneColor === 'black' ? '#000000' : '#ffffff')
    this.ctx.setLineWidth(1)
    this.ctx.stroke()
  }

  /**
   * Draw markup shapes (circle, square, triangle) on the board
   */
  private drawMarkupShape(
    position: Position,
    shape: 'circle' | 'square' | 'triangle',
    stoneColor: StoneColor
  ): void {
    const x = this.margin + position.x * this.cellSize
    const y = this.margin + position.y * this.cellSize
    const size = this.cellSize * 0.3

    // Choose appropriate stroke/fill colors based on background
    const strokeColor =
      stoneColor === 'empty'
        ? this.options.lineColor
        : stoneColor === 'black'
          ? '#ffffff'
          : '#000000'
    const fillColor = 'transparent'

    this.ctx.setStrokeStyle(strokeColor)
    this.ctx.setLineWidth(2)
    this.ctx.setFillStyle(fillColor)

    switch (shape) {
      case 'circle':
        this.ctx.beginPath()
        this.ctx.arc(x, y, size, 0, Math.PI * 2)
        this.ctx.stroke()
        break

      case 'square':
        this.ctx.beginPath()
        this.ctx.moveTo(x - size, y - size) // top left
        this.ctx.lineTo(x + size, y - size) // top right
        this.ctx.lineTo(x + size, y + size) // bottom right
        this.ctx.lineTo(x - size, y + size) // bottom left
        this.ctx.lineTo(x - size, y - size) // back to top left
        this.ctx.stroke()
        break

      case 'triangle':
        this.ctx.beginPath()
        this.ctx.moveTo(x, y - size) // top point
        this.ctx.lineTo(x - size, y + size) // bottom left
        this.ctx.lineTo(x + size, y + size) // bottom right
        this.ctx.lineTo(x, y - size) // back to top
        this.ctx.stroke()
        break
    }
  }

  /**
   * Draw markup label text on the board
   */
  private drawMarkupLabel(
    position: Position,
    text: string,
    stoneColor: StoneColor
  ): void {
    const x = this.margin + position.x * this.cellSize
    const y = this.margin + position.y * this.cellSize
    const fontSize = Math.max(10, this.cellSize * 0.4)

    this.ctx.setFont(`bold ${fontSize}px monospace`)
    this.ctx.setTextAlign('center')
    this.ctx.setTextBaseline('middle')

    // Choose text color based on background
    const fillColor =
      stoneColor === 'empty'
        ? this.options.textColor
        : stoneColor === 'black'
          ? '#ffffff'
          : '#000000'

    this.ctx.setFillStyle(fillColor)
    this.ctx.fillText(text, x, y)
  }

  /**
   * Draw text label at position with monospaced font
   */
  private drawTextLabel(
    position: Position,
    text: string,
    stoneColor: StoneColor
  ): void {
    const x = this.margin + position.x * this.cellSize
    const y = this.margin + position.y * this.cellSize
    const fontSize = Math.max(10, this.cellSize * 0.4)

    this.ctx.setFont(`bold ${fontSize}px monospace`)
    this.ctx.setTextAlign('center')
    this.ctx.setTextBaseline('middle')

    const fillColor = stoneColor === 'black' ? '#ffffff' : '#000000'
    this.ctx.setFillStyle(fillColor)
    this.ctx.fillText(text, x, y)
  }

  /**
   * Convert numeric label to letter based on label type
   */
  private convertLabelToText(label: string, labelType: LabelType): string {
    const labelNum = parseInt(label, 10)

    switch (labelType) {
      case LabelType.Letters:
        if (labelNum >= 1 && labelNum <= 26) {
          return String.fromCharCode(64 + labelNum) // A, B, C...
        }
        return label // fallback to original

      case LabelType.Numeric:
      default:
        return label
    }
  }

  /**
   * Get the canvas instance
   */
  getCanvas(): CanvasLike {
    return this.canvas
  }
}
