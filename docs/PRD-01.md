# sgf-to-image v1 – Product Requirements Document (PRD)

## 1. Introduction / Overview
`sgf-to-image` is a TypeScript library that converts Smart Game Format (SGF) data for the game of Go into static diagram images. The primary purpose is to allow developers, educators, and content creators to embed clear, high-quality board positions in websites, documents, or teaching materials without relying on interactive viewers. Version 1 focuses on single-variation, black-and-white diagrams with optional coordinate labels.

## 2. Goals
1. Accept SGF input (string, file path, or File/Blob object) and output a rendered diagram.
2. Support PNG and JPEG formats, selectable by the calling code.
3. Provide three preset output sizes – **small** (480 × 480 px), **medium** (1080 × 1080 px), **large** (2160 × 2160 px, "4K"). If no size is specified, default to **small**.
4. Render optional coordinate labels (A-T, 1-19) around the board edge.
5. Deliver deterministic rendering that matches an example style (`docs/example_diagram.png`).
6. Offer simple TypeScript API with first-class types and thorough tests.

## 3. User Stories
1. **As a Go teacher**, I want to generate an image of a specific move sequence so that I can paste it into my lesson slides.
2. **As a web developer**, I want to convert user-submitted SGF files to static images on the server so that mobile users see diagrams without heavy JS libraries.
3. **As a blogger**, I want to display the final position of famous games in my articles so that readers understand key moments without clicking external links.

## 4. Functional Requirements
1. **Input Handling**
   1.1 The library MUST accept SGF as:
        • Raw string
        • File path (Node)
        • File/Blob object (browser)
2. **Move Selection**
   2.1 If no range is specified, the diagram MUST show the full game up to the last move.
   2.2 If a move or range (e.g., 11-15) is specified, the diagram MUST render the board state at the final move in that range, with overlaid numeric labels for each move in the range.
3. **Image Output**
   3.1 The library MUST export the rendered board as PNG or JPEG based on a `format` option (`"png" | "jpeg"`).
   3.2 The library MUST support sizes `"small"` (480 × 480 px), `"medium"` (1080 × 1080 px), and `"large"` (2160 × 2160 px).
   3.3 If no size option is provided, the output MUST default to `"small"`.
4. **Board Rendering**
   4.1 The board MUST be black-and-white only in v1.
   4.2 Stones MUST be drawn with anti-aliasing and centered numeric labels for sequences **using a monospaced font**.
   4.3 Overwritten labels (e.g., ko captures) MUST be listed beneath the diagram as text (see Mission spec).
5. **Coordinate Labels**
   5.1 When `showCoordinates = true`, the diagram MUST render letter/number coordinates around the board edge.
6. **Error Handling**
   6.1 The library MUST throw a descriptive error for invalid SGF, unsupported board sizes, or malformed options.
7. **Performance**
   7.1 Rendering a 19×19 board at "medium" size SHOULD complete in < 100 ms on a typical M1 Mac.

## 5. Non-Goals (Out of Scope)
* Interactive or animated diagrams.
* Rendering variation branches or alternate game trees.
* Theming or custom board/stones styling (beyond black-and-white).
* Export formats other than PNG/JPEG.

## 6. Design Considerations (Optional)
* Use the style shown in `docs/example_diagram.png` as the reference for stone size, line thickness, and font.
* Maintain high contrast for accessibility (WCAG AA for text labels).
* Ensure output images are optimized (PNG quantization, JPEG quality setting) without visible artifacts.

## 7. Technical Considerations (Optional)
* Language & Tooling: TypeScript ≥ 5, built with Vite; tests via Vitest.
* SGF Parsing: leverage `@sabaki/sgf`.
* Packaging: produce ESM & CJS bundles; publish under `sgf-to-image` on npm.
* Dependencies: prefer latest stable versions; no native add-ons.
* CI: lint, type-check, test on Node 18 & 20.

## 8. Success Metrics
* 100 % unit-test coverage of core rendering logic.
* Rendered images visually match reference diagrams (manual review) for 95 %+ of tested SGFs.
* Bundle size ≤ 150 kB minified+gzipped.
* Rendering speed target met (Section 4.7.1).
