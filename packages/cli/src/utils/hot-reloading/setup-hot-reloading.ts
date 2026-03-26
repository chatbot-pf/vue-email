import type http from 'node:http'
import type { Socket } from 'socket.io'
import path from 'node:path'
import process from 'node:process'
import { watch } from 'chokidar'
import debounce from 'debounce'
import { Server as SocketServer } from 'socket.io'
import { createDependencyGraph } from './dependency-graph'

export interface HotReloadChange {
  event: string
  filename: string
}

/**
 * Attach a Socket.io server to an existing HTTP server and watch `emailsDir`
 * for file changes. When files change, a debounced `reload` event is broadcast
 * to all connected clients carrying the list of changed files.
 *
 * Returns the chokidar watcher (call `.close()` on it to stop watching).
 */
export async function setupHotReloading(
  devServer: http.Server,
  emailsDir: string,
): Promise<ReturnType<typeof watch>> {
  const absoluteEmailsDir = path.resolve(emailsDir)

  let clients: Socket[] = []
  const io = new SocketServer(devServer)

  io.on('connection', (client) => {
    clients.push(client)
    client.on('disconnect', () => {
      clients = clients.filter(c => c !== client)
    })
  })

  let changes: HotReloadChange[] = []

  const flush = debounce(() => {
    const toSend = changes.filter(change =>
      path
        .resolve(absoluteEmailsDir, change.filename)
        .startsWith(absoluteEmailsDir),
    )
    for (const client of clients) {
      client.emit('reload', toSend)
    }
    changes = []
  }, 150)

  const [dependencyGraph, updateDependencyGraph, { resolveDependentsOf }]
    = await createDependencyGraph(absoluteEmailsDir)

  const watcher = watch('', {
    ignoreInitial: true,
    cwd: absoluteEmailsDir,
  })

  const getFilesOutsideEmailsDir = () =>
    Object.keys(dependencyGraph).filter(p =>
      path.relative(absoluteEmailsDir, p).startsWith('..'),
    )

  let externalFiles = getFilesOutsideEmailsDir()
  for (const p of externalFiles) {
    watcher.add(p)
  }

  const exit = async () => {
    await watcher.close()
  }
  process.on('SIGINT', exit)
  process.on('uncaughtException', exit)

  watcher.on('all', async (event, relPath) => {
    if (!relPath)
      return

    const absolutePath = path.resolve(absoluteEmailsDir, relPath)

    await updateDependencyGraph(event, absolutePath)

    // Update external file watchers
    const newExternalFiles = getFilesOutsideEmailsDir()
    for (const p of externalFiles) {
      if (!newExternalFiles.includes(p))
        watcher.unwatch(p)
    }
    for (const p of newExternalFiles) {
      if (!externalFiles.includes(p))
        watcher.add(p)
    }
    externalFiles = newExternalFiles

    changes.push({ event, filename: relPath })

    // Also notify dependents
    for (const depPath of resolveDependentsOf(absolutePath)) {
      changes.push({
        event: 'change',
        filename: path.relative(absoluteEmailsDir, depPath),
      })
    }

    flush()
  })

  return watcher
}
