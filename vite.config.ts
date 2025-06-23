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
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SgfToImage',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['canvas', '@sabaki/sgf', 'fs'],
      output: {
        globals: {
          canvas: 'canvas',
          '@sabaki/sgf': 'SGF',
          fs: 'fs',
        },
      },
    },
  },
})
