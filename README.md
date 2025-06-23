# SGF to Image

Convert SGF (Smart Game Format) files to high-quality PNG/JPEG diagrams for Go/Baduk/Weiqi games.

## Features

- Multiple input formats: SGF strings, file paths, or File/Blob objects
- Support for various board sizes (9x9, 13x13, 19x19, etc.)
- High-quality rendering with anti-aliasing
- Multiple output sizes: small (480×480), medium (1080×1080), large (2160×2160)
- Automatic move numbering and overwritten label detection
- Optional coordinate labels
- Fast rendering (< 100ms for 19×19 medium size)
- Dual format support: ESM and CommonJS
- TypeScript support with full type definitions

## Installation

```bash
npm install sgf-to-image
```

## Quick Start

### Basic Usage

```typescript
import { convertSgfToImage } from 'sgf-to-image'

// From SGF string
const sgfContent = '(;FF[4]GM[1]SZ[19];B[pd];W[dp];B[pp];W[dd])'
const result = await convertSgfToImage({
  sgf: sgfContent,
  size: 'medium',
  format: 'png',
})

// Save the image
import { writeFileSync } from 'fs'
writeFileSync('diagram.png', result.imageBuffer)
```

### From File

```typescript
import { convertSgfToImage } from 'sgf-to-image'

const result = await convertSgfToImage({
  sgf: './game.sgf',
  size: 'large',
  format: 'jpeg',
  showCoordinates: true,
})
```

### Advanced Options

```typescript
const result = await convertSgfToImage({
  sgf: sgfContent,
  size: 'medium',
  format: 'png',
  moveRange: [1, 50], // Show moves 1-50
  showCoordinates: true,
  quality: 90, // JPEG quality (1-100)
})

console.log(result.overwrittenLabels) // ['A1', 'B2'] - moves that were overwritten
```

## API Reference

### `convertSgfToImage(options: ConvertOptions): Promise<ImageResult>`

#### Options

- `sgf`: SGF content (string, file path, or File/Blob)
- `size`: Output size (`'small'` | `'medium'` | `'large'` or custom `{width: number, height: number}`)
- `format`: Output format (`'png'` | `'jpeg'`)
- `moveRange?`: Array `[start, end]` to show specific move range
- `showCoordinates?`: Boolean to show coordinate labels (default: `false`)
- `quality?`: JPEG quality 1-100 (default: `85`, only for JPEG format)

#### Result

```typescript
interface ImageResult {
  imageBuffer: Buffer // The generated image data
  overwrittenLabels: string[] // Coordinates where labels were overwritten (e.g., ko)
  boardSize: number // The detected board size
  totalMoves: number // Total number of moves in the game
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT
