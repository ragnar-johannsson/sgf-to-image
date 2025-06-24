## Relevant Files

- `src/board/applyMoves.ts` – Applies SGF moves to a board; must support ranges and snapshots.
- `src/board/Board.ts` – Data structure representing the board; may need helper for captured-stone labels.
- `src/render/BoardRenderer.ts` – Low-level drawing utilities for stones, labels, and shapes.
- `src/render/DiagramRenderer.ts` – High-level façade that orchestrates rendering based on options (range, move, labels).
- `src/render/ImageExporter.ts` – Exports canvas to PNG/JPEG; touched to support CLI quality flag.
- `src/sgf/parseSgf.ts` – SGF parser; extend to emit CR, SQ, TR, and LB markup.
- `src/types.ts` – Shared TypeScript types for public API and CLI options.
- `src/cli.ts` (new) – Thin wrapper that maps parsed CLI args to library calls.
- `bin/sgf-to-image.js` (new) – Node executable invoked via `npx`.
- `package.json` – Add `bin` entry and dependencies (e.g., `commander`).
- `README.md` – Document new API options and CLI usage.
- `tests/board/applyMoves.test.ts` – Extend tests for ranges and snapshots.
- `tests/render/BoardRenderer.test.ts` – Add shape/letter rendering assertions.
- `tests/render/DiagramRenderer.test.ts` – Integration tests for new options.
- `tests/cli/cli.test.ts` (new) – End-to-end tests for the CLI using `execa`.
- `tests/performance/PerformanceBenchmark.test.ts` – Ensure performance remains within target.

### Notes

- Place new unit tests under `tests/`.
- Use `npm test` to execute the full test suite; individual tests can be run by path.
- After completing a major task, run `npm test`, `npm run type-check`, `npm run format` and `npm run lint` to verify code quality.

## Tasks

- [x] 1.0 Update board rendering logic for custom move ranges and snapshots
  - [x] 1.1 Extend `applyMoves.ts` to apply moves up to an index _N_ and return intermediate states
  - [x] 1.2 Add support for `range` (M-N) to compute labels only for moves in the range
  - [x] 1.3 Update `BoardRenderer.ts` to draw numeric labels only for moves in the provided range
  - [x] 1.4 Expose `move`, `range`, and `lastMoveLabel` options in `DiagramRenderer.ts`
  - [x] 1.5 Update and add tests in `tests/board/` & `tests/render/` to cover range/snapshot scenarios

- [x] 2.0 Implement alternate label rendering (circle, square, triangle, letters)
  - [x] 2.1 Extend `parseSgf.ts` to parse `CR`, `SQ`, `TR`, and `LB` SGF properties
  - [x] 2.2 Add `LabelType` enum & related options to `types.ts`
  - [x] 2.3 Update `BoardRenderer.ts` to render shapes and letters with correct stroke/fill color
  - [x] 2.4 Ensure letter glyphs use monospaced font and are centered on stones
  - [x] 2.5 Create unit tests for each label type in `tests/render/BoardRenderer.test.ts`

- [x] 3.0 Build CLI executable (`npx sgf-to-image`)
  - [x] 3.1 Create `bin/sgf-to-image.js` with shebang and delegate logic to `src/cli.ts`
  - [x] 3.2 Implement argument parsing in `src/cli.ts` (commander or yargs)
  - [x] 3.3 Map CLI flags (`--range`, `--move`, `--last-move-label`, etc.) to library API options
  - [x] 3.4 Derive output format from file extension when `--format` not provided
  - [x] 3.5 Validate mutually exclusive flags (`--range` vs `--move`)
  - [x] 3.6 Provide `--help` output and descriptive errors
  - [x] 3.7 Add end-to-end tests in `tests/cli/cli.test.ts` using `execa`

- [x] 4.0 Extend library API, types, and validation
  - [x] 4.1 Add new option interfaces to `types.ts` (`range`, `move`, `labelType`, `labelText`, `quality`)
  - [x] 4.2 Update `index.ts` to surface the new options in the public API
  - [x] 4.3 Implement runtime validation with descriptive error messages
  - [x] 4.4 Ensure existing functions remain backward compatible (default behavior unchanged)
  - [x] 4.5 Update `README.md` with examples of new API usage

- [x] 5.0 Add tests, performance checks, and documentation updates
  - [x] 5.1 Achieve 100 % coverage for new code paths
  - [x] 5.2 Add visual regression snapshots for shape/letter labels and range rendering
  - [x] 5.3 Update `PerformanceBenchmark.test.ts` to include scenarios with shapes and letters
  - [x] 5.4 Confirm 19×19 medium diagram renders in < 150 ms on M1 (update threshold if needed)
  - [x] 5.5 Update project documentation (`README.md`, example commands, changelog)
