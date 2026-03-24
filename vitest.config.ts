import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vueJsx()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['packages/*/src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.tsx', 'packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/**/*.spec.ts', 'packages/*/src/index.ts', 'packages/*/src/**/languages.ts'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
})
