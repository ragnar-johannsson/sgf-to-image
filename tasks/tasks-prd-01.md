## Relevant Files

- `src/index.ts` – Public API entry point exposing the main conversion function and types
- `src/types.ts` – Shared TypeScript type definitions (options, enums, error types)
- `src/sgf/parseSgf.ts` – Functions for accepting raw SGF/string/File path/Blob and returning a parsed tree (uses `@sabaki/sgf`)
- `src/model/Board.ts` – Immutable board representation & utility methods (play move, clone, etc.)
- `src/model/labels.ts` – Logic for assigning numeric labels & handling overwritten labels
- `src/render/canvasRenderer.ts` – Low-level drawing routines for board grid, stones, labels, coordinates (using `canvas`/`node-canvas`)
- `src/render/exportImage.ts` – Converts canvas to PNG or JPEG, applies preset sizes & image-quality settings
- `tests/sgf/parseSgf.test.ts` – Unit tests for SGF parsing & input handling
- `tests/model/Board.test.ts` – Unit tests for board state & move application
- `tests/render/render.test.ts` – Snapshot tests comparing generated diagrams to fixtures
- `vitest.config.ts` – Test runner configuration

### Notes

- Keep unit tests adjacent in the `tests/` directory for clarity.
- Run all tests via `npm test`. Use `npm test tests/sgf/parseSgf.test.ts` to target a specific suite.

## Tasks

- [ ] 1.0 Project scaffolding and tooling setup
  - [ ] 1.1 Scaffold a Vite‐based TypeScript library project
  - [ ] 1.2 Configure `tsconfig.json` for strict type-checking and ESM + CJS output
  - [ ] 1.3 Install & configure ESLint and Prettier per coding guidelines
  - [ ] 1.4 Add Vitest and create `vitest.config.ts`
  - [ ] 1.5 Add GitHub Actions (Node 18 & 20) for lint, test, and type-check steps
  - [ ] 1.6 Create a basic `README.md` with install & usage examples

- [ ] 2.0 SGF input handling and parsing
  - [ ] 2.1 Install `@sabaki/sgf`
  - [ ] 2.2 Implement `parseSgf(input: SgfInput): ParsedGame` to support string, file path, and Blob/File
  - [ ] 2.3 Ignore variation branches; extract main sequence moves only
  - [ ] 2.4 Validate board size and throw `InvalidSgfError` for unsupported sizes
  - [ ] 2.5 Write unit tests covering all accepted input types & error cases

- [ ] 3.0 Board model and move selection logic
  - [ ] 3.1 Design immutable `Board` class supporting arbitrary board sizes
  - [ ] 3.2 Implement `applyMoves(board, moves)` returning final board state
  - [ ] 3.3 Implement range selection: full game or specific move/move-range
  - [ ] 3.4 Generate numeric label mapping for selected range
  - [ ] 3.5 Detect overwritten labels (e.g., ko) and produce list for caption
  - [ ] 3.6 Unit tests for capturing, ko, overwritten labels, and edge cases

- [ ] 4.0 Diagram rendering engine (board, stones, labels, coordinates)
  - [ ] 4.1 Choose rendering backend (`canvas` in browser, `node-canvas` in Node)
  - [ ] 4.2 Draw grid lines & star-points per board size
  - [ ] 4.3 Render stones with anti-aliasing and centered numeric labels (monospaced font)
  - [ ] 4.4 Conditionally render coordinate labels when `showCoordinates=true`
  - [ ] 4.5 Render overwritten-label caption beneath diagram
  - [ ] 4.6 Snapshot tests comparing output to `docs/example_diagram.png`

- [ ] 5.0 Image export, size presets, and performance optimization
  - [ ] 5.1 Define preset resolutions: small 480×480, medium 1080×1080, large 2160×2160
  - [ ] 5.2 Implement `exportImage(canvas, {format, size})` returning `Buffer`/`Blob`
  - [ ] 5.3 Apply PNG quantization & JPEG quality (85%) optimizations
  - [ ] 5.4 Benchmark rendering speed; ensure < 100 ms for 19×19 medium
  - [ ] 5.5 Add automated performance test (skip CI failure but log)

- [ ] 6.0 Public API surface, error handling, and packaging
  - [ ] 6.1 Expose `convertSgfToImage(options): Promise<ImageResult>` in `src/index.ts`
  - [ ] 6.2 Create custom error classes (`InvalidSgfError`, `RenderError`, etc.) with helpful messages
  - [ ] 6.3 Build ESM & CJS bundles with type declarations using Vite
  - [ ] 6.4 Ensure bundle ≤ 150 kB min+gz; add size-check script
  - [ ] 6.5 Publish a beta version to npm under `sgf-to-image@next` (manual)
  - [ ] 6.6 Update `README.md` with API reference and sample code 