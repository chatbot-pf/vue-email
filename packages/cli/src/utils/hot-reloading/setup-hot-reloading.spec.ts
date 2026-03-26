import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { io as ioClient } from 'socket.io-client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { setupHotReloading } from './setup-hot-reloading'

let tmpDir: string
let server: http.Server
let port: number

function writeFile(relPath: string, content: string = '') {
  const full = path.join(tmpDir, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
  return full
}

function listen(srv: http.Server): Promise<number> {
  return new Promise((resolve) => {
    srv.listen(0, '127.0.0.1', () => {
      resolve((srv.address() as { port: number }).port)
    })
  })
}

beforeEach(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hot-reload-test-'))
  server = http.createServer()
  port = await listen(server)
})

afterEach(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()))
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('setupHotReloading', () => {
  it('returns a watcher with a close method', async () => {
    const watcher = await setupHotReloading(server, tmpDir)
    expect(watcher).toBeDefined()
    expect(typeof watcher.close).toBe('function')
    await watcher.close()
  })

  it('emits reload event to connected clients when a file changes', async () => {
    const file = writeFile('welcome.tsx', 'export default function Email() {}')
    const watcher = await setupHotReloading(server, tmpDir)

    const changes = await new Promise<unknown[]>((resolve, reject) => {
      const client = ioClient(`http://127.0.0.1:${port}`)
      const timer = setTimeout(() => {
        client.disconnect()
        reject(new Error('Timeout: no reload event received'))
      }, 3000)

      client.on('reload', (data: unknown[]) => {
        clearTimeout(timer)
        client.disconnect()
        resolve(data)
      })

      client.on('connect', () => {
        // Trigger a file change after connection
        fs.writeFileSync(file, 'export default function Email() { return null }')
      })
    })

    expect(Array.isArray(changes)).toBe(true)
    await watcher.close()
  }, 5000)

  it('includes filename in reload event payload', async () => {
    const file = writeFile('invite.tsx', 'export default function Email() {}')
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
        fs.writeFileSync(file, 'export default function Email() { return null }')
      })
    })

    const filenames = changes.map(c => c.filename)
    expect(filenames.some(f => f.includes('invite'))).toBe(true)
    await watcher.close()
  }, 5000)
})
