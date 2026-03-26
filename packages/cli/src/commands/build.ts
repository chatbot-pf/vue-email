import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ora from 'ora'
import { conf } from './resend'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PREVIEW_SERVER_DIR = path.resolve(__dirname, '..', '..', 'preview-server')

export interface BuildArgs {
  emailsDir: string
  outDir?: string
  port?: number
}

export interface BuildConfig {
  emailsDir: string
  outDir: string
  nuxtRootDir: string
}

/** Build the effective build config (useful for testing without side-effects). */
export function buildBuildConfig(args: BuildArgs): BuildConfig {
  return {
    emailsDir: args.emailsDir,
    outDir: args.outDir ?? '.output',
    nuxtRootDir: PREVIEW_SERVER_DIR,
  }
}

/**
 * Pre-build the Nuxt preview server for production deployment.
 * Outputs to `.output/` (or `outDir`) in the user's project directory.
 */
export async function build(args: BuildArgs): Promise<void> {
  const config = buildBuildConfig(args)
  const emailsDir = path.resolve(config.emailsDir)

  if (!fs.existsSync(emailsDir)) {
    console.error(`Could not find emails directory: ${emailsDir}`)
    process.exit(1)
  }

  const spinner = ora('Building preview server…').start()

  const outputDir = path.resolve(process.cwd(), config.outDir)

  process.env.MAIL_PLEASE_EMAILS_DIR = emailsDir
  process.env.MAIL_PLEASE_ROOT = process.cwd()
  process.env.MAIL_PLEASE_RESEND_API_KEY = conf.get('resendApiKey') ?? ''

  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')

  const nuxt = await loadNuxt({
    cwd: config.nuxtRootDir,
    dev: false,
    ready: false,
    overrides: {
      nitro: {
        output: { dir: outputDir },
      },
    },
  })

  await nuxt.ready()

  try {
    await buildNuxt(nuxt)
    spinner.succeed(`Preview server built to ${outputDir}`)
  }
  catch (err) {
    spinner.fail(`Build failed: ${err}`)
    process.exit(1)
  }
  finally {
    await nuxt.close()
  }
}
