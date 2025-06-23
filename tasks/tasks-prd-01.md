## Relevant Files

- `src/index.ts` – Public API entry point exposing the main conversion function and types
- `src/types.ts` – Shared TypeScript type definitions (options, enums, error types)
- `src/types/sabaki-sgf.d.ts` – Type declarations for @sabaki/sgf module
- `src/sgf/parseSgf.ts` – Functions for accepting raw SGF/string/File path/Blob and returning a parsed tree (uses `@sabaki/sgf`)
- `tests/sgf/parseSgf.test.ts` – Unit tests for SGF parsing & input handling
- `tests/index.test.ts` – Basic API tests for the main entry point
- `vitest.config.ts` – Test runner configuration
- `package.json` – Project configuration with dependencies and scripts
- `tsconfig.json` – TypeScript configuration with strict type checking
- `.eslintrc.json` – ESLint configuration for code quality
- `.prettierrc` – Code formatting configuration
- `vite.config.ts` – Build configuration for ESM/CJS library output
- `.github/workflows/ci.yml` – CI/CD pipeline for automated testing

### Notes

- Keep unit tests adjacent in the `tests/` directory for clarity.
- Run all tests via `npm test`. Use `npm test tests/sgf/parseSgf.test.ts` to target a specific suite.
- After completing a major task, run `npm test`, `npm run type-check`, `npm run format` and `npm run lint` to verify code quality.

## Tasks

- [x] 1.0 Project scaffolding and tooling setup
  - [x] 1.1 Scaffold a Vite‐based TypeScript library project
  - [x] 1.2 Configure `tsconfig.json` for strict type-checking and ESM + CJS output
  - [x] 1.3 Install & configure ESLint and Prettier per coding guidelines
  - [x] 1.4 Add Vitest and create `vitest.config.ts`
  - [x] 1.5 Add GitHub Actions (Node 18 & 20) for lint, test, and type-check steps
  - [x] 1.6 Create a basic `README.md` with install & usage examples

- [x] 2.0 SGF input handling and parsing
  - [x] 2.1 Install `@sabaki/sgf`
  - [x] 2.2 Implement `parseSgf(input: SgfInput): ParsedGame` to support string, file path, and Blob/File
  - [x] 2.3 Ignore variation branches; extract main sequence moves only
  - [x] 2.4 Validate board size and throw `InvalidSgfError` for unsupported sizes
  - [x] 2.5 Write unit tests covering all accepted input types & error cases

- [x] 3.0 Board model and move selection logic
  - [x] 3.1 Design immutable `Board` class supporting arbitrary board sizes
  - [x] 3.2 Implement `applyMoves(board, moves)` returning final board state
  - [x] 3.3 Implement range selection: full game or specific move/move-range
  - [x] 3.4 Generate numeric label mapping for selected range
  - [x] 3.5 Detect overwritten labels (e.g., ko) and produce list for caption
  - [x] 3.6 Unit tests for capturing, ko, overwritten labels, and edge cases

- [x] 4.0 Diagram rendering engine (board, stones, labels, coordinates)
  - [x] 4.1 Choose rendering backend (`canvas` in browser, `node-canvas` in Node)
  - [x] 4.2 Draw grid lines & star-points per board size
  - [x] 4.3 Render stones with anti-aliasing and centered numeric labels (monospaced font)
  - [x] 4.4 Conditionally render coordinate labels when `showCoordinates=true`
  - [x] 4.5 Render overwritten-label caption beneath diagram
  - [x] 4.6 Snapshot tests comparing output to `docs/example_diagram.png`

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
