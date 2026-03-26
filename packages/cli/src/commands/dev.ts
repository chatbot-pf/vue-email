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
 * 2. Use listhen to create the HTTP server and attach Socket.io for hot-reload
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

  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')
  const { listen } = await import('listhen')

  const nuxt = await loadNuxt({
    cwd: config.nuxtRootDir,
    dev: true,
    ready: false,
    overrides: {
      devServer: { port: config.port },
    },
  })

  await nuxt.ready()

  try {
    await buildNuxt(nuxt)
  }
  catch (err) {
    spinner.fail(`Preview server failed to build: ${err}`)
    process.exit(1)
  }

  // Create HTTP listener via listhen so we can attach Socket.io
  const listener = await listen(
    (nuxt as any).server?.app ?? ((req: any, res: any) => { res.end(404) }),
    { port: config.port, showURL: false },
  )

  await setupHotReloading(listener.server, config.emailsDir)

  spinner.succeed(`Preview server running at ${listener.url}`)

  // Keep process alive
  process.on('SIGINT', async () => {
    await listener.close()
    await nuxt.close()
    process.exit(0)
  })
}
