import { useEffect, useSyncExternalStore } from 'react'
import { useStore } from '@/store/useStore'

const subscribe = (cb: () => void) => {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

export const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true)

/** Sincroniza la cola pendiente al recuperar conexión y cada 30 s mientras haya cambios. */
export function useAutoSync() {
  const online = useOnline()
  const pending = useStore((s) => s.queue.length)
  const flush = useStore((s) => s.flushQueue)
  useEffect(() => {
    if (!online || !pending) return
    const t = setTimeout(flush, 2500)
    const i = setInterval(flush, 30_000)
    return () => {
      clearTimeout(t)
      clearInterval(i)
    }
  }, [online, pending, flush])
}
