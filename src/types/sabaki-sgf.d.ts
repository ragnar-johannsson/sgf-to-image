// Type declarations for @sabaki/sgf module

declare module '@sabaki/sgf' {
  export interface GameTreeNode {
    id: number
    data: Record<string, string[]>
    parentId: number | null
    children: GameTreeNode[]
  }

  export function parse(content: string): GameTreeNode[]
  export function parseFile(filePath: string): GameTreeNode[]

  const _default: {
    parse: (content: string) => GameTreeNode[]
    parseFile: (filePath: string) => GameTreeNode[]
  }
  export default _default
}
