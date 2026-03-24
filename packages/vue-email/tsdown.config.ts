import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  deps: {
    neverBundle: ['vue', '@vue/server-renderer', 'html-to-text', 'prettier', 'prismjs', 'marked'],
  },
})
