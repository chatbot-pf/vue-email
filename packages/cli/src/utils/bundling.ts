import type { ViteDevServer } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createServer } from 'vite'

// Resolve deps from this package's own node_modules so user projects don't
// need to have vite/vue installed themselves.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = path.resolve(__dirname, '..', '..')

export interface TemplateBundler {
  /**
   * Load a Vue/TSX component module from disk using Vite SSR.
   * Returns the module exports (expect a `.default` component definition).
   */
  loadComponent: (absolutePath: string) => Promise<Record<string, unknown>>
  /** Shut down the underlying Vite server. */
  close: () => Promise<void>
}

/**
 * Create a Vite SSR dev server rooted at `root` that can compile and import
 * `.vue` SFCs and `.tsx` template files on demand via `ssrLoadModule()`.
 */
export async function createTemplateBundler(root: string): Promise<TemplateBundler> {
  const server: ViteDevServer = await createServer({
    // Use the cli package root so Vite can resolve vue, vue/server-renderer,
    // etc. from the cli's own node_modules regardless of where the user's
    // email templates live.
    root: PKG_ROOT,
    // Allow Vite to load modules from outside the root (the user's email dir)
    server: {
      middlewareMode: true,
      fs: {
        // Allow serving files from the user's email directory
        allow: [PKG_ROOT, root],
      },
    },
    appType: 'custom',
    plugins: [vue(), vueJsx()],
    logLevel: 'silent',
    resolve: {
      dedupe: ['vue'],
    },
    ssr: {
      // Let Node handle these natively (they ship proper ESM)
      external: ['vue', '@vue/server-renderer'],
    },
    optimizeDeps: {
      noDiscovery: true,
      include: [],
    },
  })

  return {
    async loadComponent(absolutePath: string): Promise<Record<string, unknown>> {
      // ssrLoadModule compiles the file and all its imports via Vite
      const mod = await server.ssrLoadModule(absolutePath)
      return mod as Record<string, unknown>
    },

    async close(): Promise<void> {
      await server.close()
    },
  }
}
