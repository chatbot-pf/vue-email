import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

export interface HotReloadChange {
  filename: string
  event:
    | 'all'
    | 'ready'
    | 'add'
    | 'change'
    | 'addDir'
    | 'unlink'
    | 'unlinkDir'
    | 'raw'
    | 'error'
}

/**
 * Composable that connects to the CLI's Socket.io server and calls
 * the provided callback whenever a 'reload' event is received.
 *
 * Port from vendor/react-email/packages/preview-server/src/hooks/use-hot-reload.ts
 */
export function useHotReload(onShouldReload: (changes: HotReloadChange[]) => void) {
  const socket = ref<Socket | null>(null)

  onMounted(() => {
    socket.value = io()
    socket.value.on('reload', (changes: HotReloadChange[]) => {
      console.debug('[useHotReload] Reloading...', changes)
      onShouldReload(changes)
    })
  })

  onUnmounted(() => {
    socket.value?.off()
    socket.value?.disconnect()
    socket.value = null
  })

  return { socket: readonly(socket) }
}
