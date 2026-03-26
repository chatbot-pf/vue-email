/**
 * E2E integration test: discovery → bundling → hot-reload pipeline
 *
 * Verifies the full dev-server data flow without starting Nuxt:
 *   1. Template discovery (`getEmailsDirectoryMetadata`)
 *   2. Template bundling and rendering (`createTemplateBundler`)
 *   3. Hot-reload Socket.io broadcast (`setupHotReloading`)
 */
import type { TemplateBundler } from '../utils/bundling'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { io as ioClient } from 'socket.io-client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTemplateBundler } from '../utils/bundling'
import { getEmailsDirectoryMetadata } from '../utils/discovery'
import { setupHotReloading } from '../utils/hot-reloading/setup-hot-reloading'

const VUE_TEMPLATE = `\
<script>
export default { name: 'InviteEmail' }
</script>
<template>
  <div>Hello from Vue email</div>
</template>
`

const TSX_TEMPLATE = `\
export default {
  name: 'WelcomeEmail',
  render() {
    return null
  },
}
`

let tmpDir: string
let bundler: TemplateBundler | null = null
let server: http.Server | null = null

function writeEmail(relPath: string, content: string): string {
  const full = path.join(tmpDir, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
  return full
}

function listenOnRandomPort(srv: http.Server): Promise<number> {
  return new Promise((resolve) => {
    srv.listen(0, '127.0.0.1', () => {
      resolve((srv.address() as { port: number }).port)
    })
  })
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-test-'))
})

afterEach(async () => {
  if (bundler) {
    await bundler.close()
    bundler = null
  }
  if (server) {
    await new Promise<void>(resolve => server!.close(() => resolve()))
    server = null
  }
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('e2E: template discovery', () => {
  it('discovers .vue and .tsx email templates', async () => {
    writeEmail('invite.vue', VUE_TEMPLATE)
    writeEmail('welcome.tsx', TSX_TEMPLATE)

    const metadata = await getEmailsDirectoryMetadata(tmpDir)

    expect(metadata).toBeDefined()
    expect(metadata!.emailFilenames).toContain('invite')
    expect(metadata!.emailFilenames).toContain('welcome')
  })

  it('discovers templates nested in subdirectories', async () => {
    writeEmail('newsletters/weekly.vue', VUE_TEMPLATE)
    writeEmail('magic-links/verify.tsx', TSX_TEMPLATE)

    const metadata = await getEmailsDirectoryMetadata(tmpDir)

    expect(metadata).toBeDefined()
    expect(metadata!.subDirectories).toHaveLength(2)
    const dirNames = metadata!.subDirectories.map(d => d.directoryName).sort()
    expect(dirNames).toEqual(['magic-links', 'newsletters'])
  })

  it('ignores non-email files', async () => {
    writeEmail('utils.ts', 'export function helper() {}')
    writeEmail('styles.css', '.foo { color: red }')
    writeEmail('readme.md', '# Email templates')

    const metadata = await getEmailsDirectoryMetadata(tmpDir)

    expect(metadata!.emailFilenames).toHaveLength(0)
  })
})

describe('e2E: template bundling', () => {
  it('loads a .tsx template via the bundler', async () => {
    writeEmail('welcome.tsx', TSX_TEMPLATE)

    bundler = await createTemplateBundler(tmpDir)
    const mod = await bundler.loadComponent(path.join(tmpDir, 'welcome.tsx'))

    expect(mod).toBeDefined()
    expect(mod.default).toBeDefined()
  })

  it('loads a .vue template via the bundler', async () => {
    writeEmail('invite.vue', VUE_TEMPLATE)

    bundler = await createTemplateBundler(tmpDir)
    const mod = await bundler.loadComponent(path.join(tmpDir, 'invite.vue'))

    expect(mod).toBeDefined()
    expect(mod.default).toBeDefined()
  })

  it('throws for a missing template', async () => {
    bundler = await createTemplateBundler(tmpDir)

    await expect(
      bundler.loadComponent(path.join(tmpDir, 'nonexistent.tsx')),
    ).rejects.toThrow()
  })
})

describe('e2E: hot-reload broadcast', () => {
  it('broadcasts a reload event when a template file changes', async () => {
    const file = writeEmail('welcome.tsx', TSX_TEMPLATE)
    server = http.createServer()
    const port = await listenOnRandomPort(server)

    const watcher = await setupHotReloading(server, tmpDir)

    const changes = await new Promise<Array<{ filename: string, event: string }>>((resolve, reject) => {
      const client = ioClient(`http://127.0.0.1:${port}`)

      const timer = setTimeout(() => {
        client.disconnect()
        reject(new Error('Timeout: no reload event received within 3 s'))
      }, 3000)

      client.on('reload', (data: Array<{ filename: string, event: string }>) => {
        clearTimeout(timer)
        client.disconnect()
        resolve(data)
      })

      client.on('connect', () => {
        // Trigger file change after the client is connected
        fs.writeFileSync(file, `${TSX_TEMPLATE}\n// updated`)
      })
    })

    expect(Array.isArray(changes)).toBe(true)
    expect(changes.some(c => c.filename.includes('welcome'))).toBe(true)

    await watcher.close()
  }, 5000)

  it('includes changed filename in the reload payload', async () => {
    writeEmail('invite.vue', VUE_TEMPLATE)
    const inviteFile = path.join(tmpDir, 'invite.vue')

    server = http.createServer()
    const port = await listenOnRandomPort(server)

    const watcher = await setupHotReloading(server, tmpDir)

    const changes = await new Promise<Array<{ filename: string, event: string }>>((resolve, reject) => {
      const client = ioClient(`http://127.0.0.1:${port}`)

      const timer = setTimeout(() => {
        client.disconnect()
        reject(new Error('Timeout'))
      }, 3000)

      client.on('reload', (data: Array<{ filename: string, event: string }>) => {
        clearTimeout(timer)
        client.disconnect()
        resolve(data)
      })

      client.on('connect', () => {
        fs.writeFileSync(inviteFile, `${VUE_TEMPLATE}\n<!-- updated -->`)
      })
    })

    const filenames = changes.map(c => c.filename)
    expect(filenames.some(f => f.includes('invite'))).toBe(true)

    await watcher.close()
  }, 5000)
})
