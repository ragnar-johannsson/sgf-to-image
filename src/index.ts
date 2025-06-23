// Main entry point for sgf-to-image library
// This is a placeholder that will be implemented in subsequent tasks

export interface ConvertOptions {
  sgf: string | File | Blob
  size: 'small' | 'medium' | 'large' | { width: number; height: number }
  format: 'png' | 'jpeg'
  moveRange?: [number, number]
  showCoordinates?: boolean
  quality?: number
}

export interface ImageResult {
  imageBuffer: Buffer
  overwrittenLabels: string[]
  boardSize: number
  totalMoves: number
}

/**
 * Convert SGF file to image
 * TODO: Implement this function in future tasks
 */
export async function convertSgfToImage(
  _options: ConvertOptions
): Promise<ImageResult> {
  throw new Error('Not implemented yet')
}
