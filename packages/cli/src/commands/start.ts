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

  const onSigint = () => child.kill('SIGINT')
  const onSigterm = () => child.kill('SIGTERM')
  process.on('SIGINT', onSigint)
  process.on('SIGTERM', onSigterm)

  child.on('exit', (code, signal) => {
    if (signal) {
      // Remove only our own listeners before re-raising to avoid a loop
      // without disrupting other signal handlers in the same process.
      process.removeListener('SIGINT', onSigint)
      process.removeListener('SIGTERM', onSigterm)
      process.kill(process.pid, signal)
    }
    else {
      process.exit(code ?? 0)
    }
  })
}
