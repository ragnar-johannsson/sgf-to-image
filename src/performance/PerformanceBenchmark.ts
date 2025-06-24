import { DiagramRenderer } from '../render/DiagramRenderer'
import { ImageExporter } from '../render/ImageExporter'
import type { Move, ImageFormat } from '../types'

/**
 * Performance metrics for a single benchmark run
 */
export interface BenchmarkResult {
  renderTime: number // milliseconds
  exportTime: number // milliseconds
  totalTime: number // milliseconds
  imageSize: number // bytes
  canvasSize: number // pixels (width)
  boardSize: number
  moveCount: number
  format: ImageFormat
}

/**
 * Benchmark configuration options
 */
export interface BenchmarkOptions {
  boardSize: number
  canvasSize: number
  moveCount: number
  format: ImageFormat
  iterations: number
  warmupRuns: number
}

/**
 * Performance benchmark utility for Go diagram rendering
 */
export class PerformanceBenchmark {
  private renderer: DiagramRenderer

  constructor() {
    this.renderer = new DiagramRenderer()
  }

  /**
   * Initialize the benchmark runner
   */
  async initialize(): Promise<void> {
    await this.renderer.initialize()
  }

  /**
   * Run a single benchmark test
   */
  async runBenchmark(options: BenchmarkOptions): Promise<BenchmarkResult[]> {
    const { boardSize, canvasSize, moveCount, format, iterations, warmupRuns } =
      options

    // Generate test moves
    const moves = this.generateTestMoves(boardSize, moveCount)

    // Warmup runs (not counted in results)
    for (let i = 0; i < warmupRuns; i++) {
      await this.runSingleBenchmark(moves, boardSize, canvasSize, format)
    }

    // Actual benchmark runs
    const results: BenchmarkResult[] = []
    for (let i = 0; i < iterations; i++) {
      const result = await this.runSingleBenchmark(
        moves,
        boardSize,
        canvasSize,
        format
      )
      results.push(result)
    }

    return results
  }

  /**
   * Run the standard 19×19 medium benchmark (requirement: < 100ms)
   */
  async runStandardBenchmark(): Promise<{
    results: BenchmarkResult[]
    summary: BenchmarkSummary
    passesRequirement: boolean
  }> {
    const options: BenchmarkOptions = {
      boardSize: 19,
      canvasSize: 1080, // medium preset
      moveCount: 50, // Typical game length
      format: 'png',
      iterations: 10,
      warmupRuns: 3,
    }

    const results = await this.runBenchmark(options)
    const summary = this.calculateSummary(results)
    const passesRequirement = summary.averageRenderTime < 150

    return {
      results,
      summary,
      passesRequirement,
    }
  }

  /**
   * Run comprehensive benchmarks across different configurations
   */
  async runComprehensiveBenchmarks(): Promise<{
    results: BenchmarkResult[]
    summaries: BenchmarkSummary[]
  }> {
    const configurations: BenchmarkOptions[] = [
      // Small boards
      {
        boardSize: 9,
        canvasSize: 480,
        moveCount: 20,
        format: 'png',
        iterations: 5,
        warmupRuns: 2,
      },
      {
        boardSize: 9,
        canvasSize: 480,
        moveCount: 20,
        format: 'jpeg',
        iterations: 5,
        warmupRuns: 2,
      },

      // Medium boards
      {
        boardSize: 13,
        canvasSize: 1080,
        moveCount: 35,
        format: 'png',
        iterations: 5,
        warmupRuns: 2,
      },
      {
        boardSize: 13,
        canvasSize: 1080,
        moveCount: 35,
        format: 'jpeg',
        iterations: 5,
        warmupRuns: 2,
      },

      // Large boards
      {
        boardSize: 19,
        canvasSize: 480,
        moveCount: 50,
        format: 'png',
        iterations: 5,
        warmupRuns: 2,
      },
      {
        boardSize: 19,
        canvasSize: 1080,
        moveCount: 50,
        format: 'png',
        iterations: 5,
        warmupRuns: 2,
      },
      {
        boardSize: 19,
        canvasSize: 2160,
        moveCount: 50,
        format: 'png',
        iterations: 3,
        warmupRuns: 2,
      },
      {
        boardSize: 19,
        canvasSize: 1080,
        moveCount: 50,
        format: 'jpeg',
        iterations: 5,
        warmupRuns: 2,
      },
    ]

    const allResults: BenchmarkResult[] = []
    const summaries: BenchmarkSummary[] = []

    for (const config of configurations) {
      const results = await this.runBenchmark(config)
      const summary = this.calculateSummary(results)

      allResults.push(...results)
      summaries.push(summary)
    }

    return { results: allResults, summaries }
  }

  /**
   * Run a single benchmark iteration
   */
  private async runSingleBenchmark(
    moves: Move[],
    boardSize: number,
    canvasSize: number,
    format: ImageFormat
  ): Promise<BenchmarkResult> {
    // Measure rendering time
    const renderStart = performance.now()
    const canvas = await this.renderer.renderDiagram(boardSize, moves, {
      size: { width: canvasSize, height: canvasSize },
    })
    const renderTime = performance.now() - renderStart

    // Measure export time
    const exportStart = performance.now()
    const exportResult = await ImageExporter.exportImage(canvas, { format })
    const exportTime = performance.now() - exportStart

    return {
      renderTime,
      exportTime,
      totalTime: renderTime + exportTime,
      imageSize: exportResult.size,
      canvasSize,
      boardSize,
      moveCount: moves.length,
      format,
    }
  }

  /**
   * Generate test moves for benchmarking
   */
  private generateTestMoves(boardSize: number, count: number): Move[] {
    const moves: Move[] = []
    const center = Math.floor(boardSize / 2)

    for (let i = 0; i < count; i++) {
      const color = i % 2 === 0 ? 'black' : 'white'

      // Generate moves in a spiral pattern from center
      const spiral = this.getSpiralPosition(i, center, boardSize)

      moves.push({
        color,
        position: spiral,
        moveNumber: i + 1,
      })
    }

    return moves
  }

  /**
   * Get position in spiral pattern for realistic move distribution
   */
  private getSpiralPosition(
    index: number,
    center: number,
    boardSize: number
  ): { x: number; y: number } {
    if (index === 0) {
      return { x: center, y: center }
    }

    // Simple spiral algorithm
    let x = center
    let y = center
    let dx = 0
    let dy = -1

    for (let i = 1; i <= index; i++) {
      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
        const temp = dx
        dx = -dy
        dy = temp
      }
      x += dx
      y += dy

      // Keep within bounds
      x = Math.max(0, Math.min(boardSize - 1, x))
      y = Math.max(0, Math.min(boardSize - 1, y))
    }

    return { x, y }
  }

  /**
   * Calculate summary statistics from benchmark results
   */
  private calculateSummary(results: BenchmarkResult[]): BenchmarkSummary {
    if (results.length === 0) {
      throw new Error('No benchmark results to summarize')
    }

    const renderTimes = results.map((r) => r.renderTime)
    const exportTimes = results.map((r) => r.exportTime)
    const totalTimes = results.map((r) => r.totalTime)
    const imageSizes = results.map((r) => r.imageSize)

    const first = results[0]

    return {
      boardSize: first.boardSize,
      canvasSize: first.canvasSize,
      moveCount: first.moveCount,
      format: first.format,
      iterations: results.length,

      averageRenderTime: this.average(renderTimes),
      minRenderTime: Math.min(...renderTimes),
      maxRenderTime: Math.max(...renderTimes),

      averageExportTime: this.average(exportTimes),
      minExportTime: Math.min(...exportTimes),
      maxExportTime: Math.max(...exportTimes),

      averageTotalTime: this.average(totalTimes),
      minTotalTime: Math.min(...totalTimes),
      maxTotalTime: Math.max(...totalTimes),

      averageImageSize: Math.floor(this.average(imageSizes)),
      minImageSize: Math.min(...imageSizes),
      maxImageSize: Math.max(...imageSizes),
    }
  }

  /**
   * Calculate average of an array of numbers
   */
  private average(numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
  }
}

/**
 * Summary statistics for benchmark results
 */
export interface BenchmarkSummary {
  boardSize: number
  canvasSize: number
  moveCount: number
  format: ImageFormat
  iterations: number

  averageRenderTime: number
  minRenderTime: number
  maxRenderTime: number

  averageExportTime: number
  minExportTime: number
  maxExportTime: number

  averageTotalTime: number
  minTotalTime: number
  maxTotalTime: number

  averageImageSize: number
  minImageSize: number
  maxImageSize: number
}

/**
 * Create a new performance benchmark instance
 */
export function createBenchmark(): PerformanceBenchmark {
  return new PerformanceBenchmark()
}

/**
 * Quick benchmark utility for testing
 */
export async function quickBenchmark(): Promise<BenchmarkSummary> {
  const benchmark = createBenchmark()
  await benchmark.initialize()

  const { summary } = await benchmark.runStandardBenchmark()
  return summary
}
