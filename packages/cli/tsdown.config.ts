import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  deps: {
    neverBundle: [
      'vue',
      '@vue/server-renderer',
      '@mail-please/vue-email',
      '@nuxt/kit',
      'nuxt',
      'chokidar',
      'commander',
      'conf',
      'esbuild',
      'socket.io',
      'socket.io-client',
      'resend',
      'ora',
      'prompts',
    ],
  },
})
