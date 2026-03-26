#!/usr/bin/env node
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import { build } from './commands/build'
import { dev } from './commands/dev'
import { exportTemplates } from './commands/export'
import { resendReset, resendSetup } from './commands/resend'
import { start } from './commands/start'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read version from package.json at runtime
async function getVersion(): Promise<string> {
  try {
    const { createRequire } = await import('node:module')
    const require = createRequire(import.meta.url)
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    return (pkg as { version: string }).version
  }
  catch {
    return '0.0.0'
  }
}

async function main(): Promise<void> {
  const version = await getVersion()
  const program = new Command()

  program
    .name('mail-please')
    .description('Preview and manage Vue email templates')
    .version(version)

  // dev command
  program
    .command('dev')
    .description('Start the email preview development server')
    .option('-d, --dir <path>', 'Path to emails directory', './emails')
    .option('-p, --port <number>', 'Port to run the preview server on', '3000')
    .action(async (options: { dir: string, port: string }) => {
      await dev({
        emailsDir: path.resolve(options.dir),
        port: Number(options.port),
      })
    })

  // build command
  program
    .command('build')
    .description('Pre-build the preview server for production deployment')
    .option('-d, --dir <path>', 'Path to emails directory', './emails')
    .action(async (options: { dir: string }) => {
      await build({ emailsDir: path.resolve(options.dir) })
    })

  // start command
  program
    .command('start')
    .description('Serve the pre-built preview server')
    .action(async () => {
      await start()
    })

  // export command
  program
    .command('export')
    .description('Export all email templates to static HTML files')
    .option('-d, --dir <path>', 'Path to emails directory', './emails')
    .option('-o, --out-dir <path>', 'Output directory', './out')
    .option('--pretty', 'Prettify the HTML output', false)
    .option('--plain-text', 'Export as plain text instead of HTML', false)
    .action(async (options: { dir: string, outDir: string, pretty: boolean, plainText: boolean }) => {
      await exportTemplates(
        path.resolve(options.dir),
        path.resolve(options.outDir),
        {
          pretty: options.pretty,
          plainText: options.plainText,
        },
      )
    })

  // resend commands
  const resend = program
    .command('resend')
    .description('Manage Resend API key integration')

  resend
    .command('setup')
    .description('Configure your Resend API key')
    .action(async () => {
      await resendSetup()
    })

  resend
    .command('reset')
    .description('Remove the stored Resend API key')
    .action(() => {
      resendReset()
    })

  await program.parseAsync(process.argv)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
