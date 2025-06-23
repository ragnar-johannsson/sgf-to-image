import type { StoneColor, Position } from '../types'

/**
 * Represents an immutable Go board state
 */
export class Board {
  readonly size: number
  private readonly grid: StoneColor[][]

  /**
   * Create a new board
   */
  constructor(size: number, grid?: StoneColor[][]) {
    if (size < 1 || size > 25) {
      throw new Error(`Invalid board size: ${size}. Must be between 1 and 25`)
    }

    this.size = size
    this.grid =
      grid ||
      Array(size)
        .fill(null)
        .map(() => Array(size).fill('empty'))
  }

  /**
   * Get the stone color at a position
   */
  getStone(position: Position): StoneColor {
    if (!this.isValidPosition(position)) {
      return 'empty'
    }
    return this.grid[position.y][position.x]
  }

  /**
   * Check if a position is valid on this board
   */
  isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    )
  }

  /**
   * Place a stone and return a new board state (immutable)
   * Handles capturing of opponent stones
   */
  placeStone(position: Position, color: StoneColor): Board {
    if (!this.isValidPosition(position)) {
      throw new Error(`Invalid position: ${position.x}, ${position.y}`)
    }

    if (this.getStone(position) !== 'empty') {
      throw new Error(`Position already occupied: ${position.x}, ${position.y}`)
    }

    if (color === 'empty') {
      throw new Error('Cannot place empty stone')
    }

    // Create new grid with the stone placed
    const newGrid = this.grid.map((row) => [...row])
    newGrid[position.y][position.x] = color

    let boardAfterCaptures = new Board(this.size, newGrid)

    // Check for captures of opponent stones
    const opponentColor: StoneColor = color === 'black' ? 'white' : 'black'
    const neighbors = this.getNeighbors(position)

    for (const neighbor of neighbors) {
      if (boardAfterCaptures.getStone(neighbor) === opponentColor) {
        const group = boardAfterCaptures.getGroup(neighbor)
        if (!boardAfterCaptures.hasLiberties(group)) {
          boardAfterCaptures = boardAfterCaptures.removeStones(group)
        }
      }
    }

    // Check if the placed stone's group has liberties (suicide rule)
    const placedGroup = boardAfterCaptures.getGroup(position)
    if (!boardAfterCaptures.hasLiberties(placedGroup)) {
      throw new Error(`Suicide move not allowed: ${position.x}, ${position.y}`)
    }

    return boardAfterCaptures
  }

  /**
   * Get all positions that belong to the same group as the given position
   */
  getGroup(position: Position): Position[] {
    const stoneColor = this.getStone(position)
    if (stoneColor === 'empty') {
      return []
    }

    const group: Position[] = []
    const visited = new Set<string>()
    const stack = [position]

    while (stack.length > 0) {
      const current = stack.pop()!
      const key = `${current.x},${current.y}`

      if (visited.has(key)) {
        continue
      }

      visited.add(key)

      if (this.getStone(current) === stoneColor) {
        group.push(current)

        // Add neighbors to stack
        for (const neighbor of this.getNeighbors(current)) {
          const neighborKey = `${neighbor.x},${neighbor.y}`
          if (!visited.has(neighborKey)) {
            stack.push(neighbor)
          }
        }
      }
    }

    return group
  }

  /**
   * Check if a group has any liberties (empty adjacent positions)
   */
  hasLiberties(group: Position[]): boolean {
    const liberties = new Set<string>()

    for (const position of group) {
      for (const neighbor of this.getNeighbors(position)) {
        if (this.getStone(neighbor) === 'empty') {
          liberties.add(`${neighbor.x},${neighbor.y}`)
        }
      }
    }

    return liberties.size > 0
  }

  /**
   * Remove stones from the board and return new board state
   */
  removeStones(positions: Position[]): Board {
    const newGrid = this.grid.map((row) => [...row])

    for (const position of positions) {
      if (this.isValidPosition(position)) {
        newGrid[position.y][position.x] = 'empty'
      }
    }

    return new Board(this.size, newGrid)
  }

  /**
   * Get valid neighbors of a position (up, down, left, right)
   */
  private getNeighbors(position: Position): Position[] {
    const neighbors: Position[] = []
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 }, // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 }, // right
    ]

    for (const dir of directions) {
      const neighbor = {
        x: position.x + dir.x,
        y: position.y + dir.y,
      }

      if (this.isValidPosition(neighbor)) {
        neighbors.push(neighbor)
      }
    }

    return neighbors
  }

  /**
   * Create an empty board of the given size
   */
  static empty(size: number): Board {
    return new Board(size)
  }

  /**
   * Get a copy of the board grid for testing/debugging
   */
  toArray(): StoneColor[][] {
    return this.grid.map((row) => [...row])
  }

  /**
   * Compare two boards for equality
   */
  equals(other: Board): boolean {
    if (this.size !== other.size) {
      return false
    }

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[y][x] !== other.grid[y][x]) {
          return false
        }
      }
    }

    return true
  }
}
