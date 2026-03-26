import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const OUTPUT_DIR = '.output'

/**
 * Serve the pre-built preview server.
 * Expects the output from `mail-please build` at `.output/`.
 */
export async function start(): Promise<void> {
  const builtPath = path.resolve(process.cwd(), OUTPUT_DIR)

  if (!fs.existsSync(builtPath)) {
    console.error(
      `Could not find ${OUTPUT_DIR}. Have you run 'mail-please build' first?`,
    )
    process.exit(1)
  }

  const serverEntry = path.join(builtPath, 'server', 'index.mjs')
  if (!fs.existsSync(serverEntry)) {
    console.error(
      `Built server entry not found at ${serverEntry}. Try running 'mail-please build' again.`,
    )
    process.exit(1)
  }

  const child = spawn(process.execPath, [serverEntry], {
    stdio: 'inherit',
    env: { ...process.env },
  })

  process.on('SIGINT', () => child.kill('SIGINT'))
  process.on('SIGTERM', () => child.kill('SIGTERM'))

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}
