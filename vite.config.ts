import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        cli: resolve(__dirname, 'src/cli.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (entryName === 'cli') {
          return `cli.${format === 'es' ? 'js' : 'cjs'}`
        }
        return `index.${format === 'es' ? 'js' : 'cjs'}`
      },
    },
    rollupOptions: {
      external: ['canvas', '@sabaki/sgf', 'fs', 'path', 'commander'],
      output: {
        globals: {
          canvas: 'canvas',
          '@sabaki/sgf': 'SGF',
          fs: 'fs',
          path: 'path',
          commander: 'commander',
        },
      },
    },
  },
})
