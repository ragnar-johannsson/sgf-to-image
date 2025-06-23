# sgf-to-image

A library in Typescript for processing Go SGF data/files and returning images (PNG/JPEG) with diagrams of the Go positions in the SGF data. A diagram consists of a go board drawn of the board size specified in the SGF, and the stones (black/white) played on (minus the ones possibly taken off) the board at the move number requested. If a sequence is requested, say move 11-15, then the board is rendered at move 15, with each stone having a label (a text centrally alignined within the stone being rendered) showing each of the numbers of the sequence. If no move number is specified the whole game should be rendered, as if a sequence from move 1 to <last move>. Stone labels overwritten with other labels (for instance due to a ko) should be shown under the diagram for clarification with the stone rendered under the label (for example: <stone>4</stone> at <stone>10</stone>, <stone>18</stone> at <stone>20</stone>).

## Implementation notes for the first version

    - Use vite and vitest.
    - Setup a rigorous testing, type-checking, formatting and linting infrastructure and use it.
    - Use @sabaki/sgf for SGF parsing.
    - Focus on a black-and-white diagram, but account for later configuration possibilities of styling the board and stones.
    - SGF allows for variations; focus on the main variation for the first version.
