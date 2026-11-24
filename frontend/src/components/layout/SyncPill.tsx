import { useState } from 'react'
import { CloudOff, RefreshCw, Cloud } from 'lucide-react'
import { useOnline } from '@/hooks/useOnline'
import { useStore } from '@/store/useStore'
import { cn, fmtDateTime } from '@/lib/utils'

export function SyncPill() {
  const online = useOnline()
  const pending = useStore((s) => s.queue.length)
  const lastSyncAt = useStore((s) => s.lastSyncAt)
  const flush = useStore((s) => s.flushQueue)
  const [busy, setBusy] = useState(false)

  const state = !online ? 'offline' : pending ? 'pending' : 'ok'
  const label = state === 'offline' ? `Sin conexión${pending ? ` · ${pending} en cola` : ''}` : state === 'pending' ? `${pending} por sincronizar` : 'Sincronizado'

  return (
    <button
      onClick={async () => {
        setBusy(true)
        await flush()
        setBusy(false)
      }}
      disabled={!online || !pending}
      title={lastSyncAt ? `Última sincronización: ${fmtDateTime(lastSyncAt)}` : 'Los datos se guardan en el dispositivo'}
      className={cn(
        'flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition',
        state === 'ok' && 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
        state === 'pending' && 'border-amber-400/25 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20',
        state === 'offline' && 'border-red-400/25 bg-red-400/10 text-red-300',
      )}
    >
      {state === 'offline' ? <CloudOff className="size-4" /> : state === 'pending' ? <RefreshCw className={cn('size-4', busy && 'animate-spin')} /> : <Cloud className="size-4" />}
      <span className="hidden sm:inline">{label}</span>
      <span className={cn('size-1.5 rounded-full', state === 'ok' ? 'bg-emerald-400' : state === 'pending' ? 'animate-pulse bg-amber-400' : 'bg-red-400')} />
    </button>
  )
}
