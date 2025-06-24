# sgf-to-image v1.1 – Product Requirements Document (PRD)

## 1. Introduction / Overview

`sgf-to-image` currently converts SGF data into static board diagrams focused on a full–game or last–move snapshot. This enhancement release (v1.1) introduces quality-of-life features frequently requested by educators, developers, and automation scripts:

- Accurate rendering when only a **custom move range** is selected.
- A zero-config **CLI / `npx` script** for one-off conversions and CI pipelines.
- Support for **alternate stone labels** (circle, square, triangle) to highlight key positions.
- Ability to show the **board state at an arbitrary move number** with an optional last-move marker.

These changes aim to streamline content creation workflows while preserving the deterministic, high-quality output of v1.0.

## 2. Goals

1. Render the complete board state preceding and including any requested move range.
2. Provide an `npx sgf-to-image` CLI that mirrors the library API and accepts common options.
3. Allow shape labels (circle, square, triangle) in place of numeric move labels, following SGF markup (`CR`, `SQ`, `TR`).
4. Support **letter labels** (A, B, …) via SGF `LB` property to annotate key points.
5. Permit rendering of the board at **exact move _N_** with an optional circle marker on the last move.
6. Maintain existing visual style, performance targets (< 100 ms for 19×19 medium), and 100 % test coverage.

## 3. User Stories

1. **As a Go teacher**, I want to mark key moves with circles instead of numbers so that beginners can focus on strategic points.
2. **As a technical writer**, I want to render only moves 11-15 while still showing the full board position so that intermediate steps are clear.
3. **As a CI engineer**, I want to call `npx sgf-to-image` inside a build pipeline to automatically generate diagrams for released articles.
4. **As a developer**, I want to render the position at move 120 with a circle on that move so readers immediately see the game's turning point.

## 4. Functional Requirements

### 4.1 Input Handling (unchanged from v1)

See PRD-01 §4.1

### 4.2 Move Range Rendering

1. When `range = "M-N"` is supplied, the renderer **MUST**:
   1.1 Apply all moves **up to N** to compute the board state.
   1.2 Draw numeric labels **only** for moves _M … N_.
   1.3 Place labels on empty intersections when the corresponding stone has been captured (§12).

### 4.3 Board State at Move _N_

1. When `move = N` (mutually exclusive with `range`), the renderer **MUST**:
   1.1 Produce the board position after executing move _N_.
   1.2 Render **no sequence labels** by default.
   1.3 When `lastMoveLabel = true`, draw a **circle** on move _N_.

### 4.4 Alternate Labels (Shapes & Letters)

1. The renderer **MUST** honor SGF markup properties:
   • `CR` → circle   • `SQ` → square   • `TR` → triangle   • `LB` → custom **letter** (e.g., "A", "B").
2. CLI & API **MUST** expose a `label` option to override SGF markup with a single type for all labels: `circle | square | triangle | letter` (where `letter` may be provided as `--label-text "A"`).
3. Labels **MUST** share stroke/fill color with the text color used on that stone color.
4. Letter glyphs **MUST** be uppercase Latin characters, centered within the stone, and rendered in a monospaced font matching numeric labels.

### 4.5 CLI (`npx sgf-to-image`)

1. The package **MUST** expose a binary executable so users can run:
   ```sh
   npx sgf-to-image <input.sgf> <output.png> [options]
   ```
2. **Required args**:
   • `input` – SGF file path or `-` for stdin
   • `output` – target image path
3. **Options**:
   | Flag | Type | Default | Notes |
   |------|------|---------|-------|
   | `--range` | `"M-N"` | ― | Mutually exclusive with `--move` |
   | `--move` | integer | ― | Board at move _N_ |
   | `--last-move-label` | boolean | `false` | Only valid with `--move` |
   | `--quality` | `1-100` | `90` | JPEG only |
   | `--show-coordinates` | boolean | `false` | |
   | `--size` | `small\|medium\|large` | `small` | |
   | `--width` | integer px | ― | Overrides preset size |
   | `--height` | integer px | ― | Overrides preset size |
   | `--format` | `png\|jpeg` | Derived from `output` ext | |
   | `--label-shape` | `circle\|square\|triangle` | Derived from SGF / numbers | Overrides default |
4. The CLI **SHOULD** display `--help` and common-sense error messages.

### 4.6 Image Output & Performance

Unchanged from PRD-01 §4.3 & §4.7

## 5. Non-Goals (Out of Scope)

- Support for mixed numeric and shape labels on the same board.
- Custom colors or themed shapes (inherit text color only).
- Variation branches, interactive diagrams, or animated playback (unchanged).

## 6. Design Considerations (Optional)

- Preserve existing visual style (`docs/example_diagram.png`).
- Circle/Square/Triangle glyphs should align to the stone center and maintain equal visual weight across board sizes.
- CLI output should be silent except for errors unless `--verbose` is added.
- Accepting JSON config via stdin for batch operations is **out of scope** for v1.1.

## 7. Technical Considerations (Optional)

- CLI built with `bin` entry in `package.json`; no additional runtime deps beyond library.
- Parsing SGF markup for `CR`, `SQ`, `TR` can leverage existing `@sabaki/sgf` AST.
- Validate mutually exclusive flags (`--range` vs `--move`).
- Reuse rendering pipeline; shapes can be drawn on the `CanvasRenderingContext2D` layer currently used for numeric text.

## 8. Success Metrics

- All new unit tests pass (≥ 100 % coverage for new features).
- CLI binary runs in < 150 ms for a 19×19 medium diagram on M1.
- Visual regression tests show ≥ 95 % pixel-exact match vs reference diagrams with shapes and ranges.
- Internal doc build pipeline replaces manual scripts with CLI.
