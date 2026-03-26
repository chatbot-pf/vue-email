import type http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ora from 'ora'
import { setupHotReloading } from '../utils/hot-reloading/setup-hot-reloading'
import { conf } from './resend'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** The Nuxt preview-server directory bundled inside @mail-please/cli */
const PREVIEW_SERVER_DIR = path.resolve(__dirname, '..', '..', 'preview-server')

export interface DevConfig {
  emailsDir: string
  port: number
  nuxtRootDir: string
}

export interface DevArgs {
  emailsDir: string
  port?: number
}

/** Build the effective dev config (useful for testing without side-effects). */
export function buildDevConfig(args: DevArgs): DevConfig {
  return {
    emailsDir: args.emailsDir,
    port: args.port ?? 3000,
    nuxtRootDir: PREVIEW_SERVER_DIR,
  }
}

/**
 * Start the development server:
 * 1. Launch Nuxt preview-server programmatically via @nuxt/kit
 * 2. Attach Socket.io hot-reload on the same HTTP server
 * 3. Watch emailsDir for changes
 */
export async function dev(args: DevArgs): Promise<void> {
  const config = buildDevConfig(args)

  if (!fs.existsSync(config.emailsDir)) {
    console.error(`Could not find emails directory: ${config.emailsDir}`)
    process.exit(1)
  }

  const spinner = ora('Starting preview server…').start()

  // Set env vars consumed by the Nuxt preview server
  process.env.MAIL_PLEASE_EMAILS_DIR = path.resolve(config.emailsDir)
  process.env.MAIL_PLEASE_ROOT = process.cwd()
  process.env.MAIL_PLEASE_RESEND_API_KEY = conf.get('resendApiKey') ?? ''

  // Dynamically import @nuxt/kit so the CLI can be installed without requiring
  // a full Nuxt installation at the workspace root.
  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')

  const nuxt = await loadNuxt({
    cwd: config.nuxtRootDir,
    dev: true,
    overrides: {
      devServer: { port: config.port },
    },
  })

  try {
    await buildNuxt(nuxt)
  }
  catch (err) {
    spinner.fail(`Preview server failed to build: ${err}`)
    process.exit(1)
  }

  // After Nuxt is listening, get the underlying http.Server to attach Socket.io
  const httpServer: http.Server = (nuxt as any).server?.httpServer
  if (httpServer) {
    await setupHotReloading(httpServer, config.emailsDir)
  }
  else {
    console.warn('Could not attach hot-reload: Nuxt HTTP server not accessible')
  }

  spinner.succeed(`Preview server running at http://localhost:${config.port}`)
}
