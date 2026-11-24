import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { del, get, set } from 'idb-keyval'
import type { Appointment, Campaign, Client, LogEntry, Quote, Settings, SyncOp } from '@/types'
import { defaultSettings, seedAppointments, seedCampaigns, seedClients, seedLogs, seedQuotes } from '@/data/seed'
import { nowIso, uid } from '@/lib/utils'

/** IndexedDB: soporta mucho más que localStorage (fotos de bitácora) y funciona sin internet. */
const idbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: (name, value) => set(name, value),
  removeItem: (name) => del(name),
}

type Entity = SyncOp['entity']
type Collections = {
  clients: Client[]
  logs: LogEntry[]
  appointments: Appointment[]
  quotes: Quote[]
  campaigns: Campaign[]
}
type CollectionKey = keyof Collections
const ENTITY: Record<CollectionKey, Entity> = {
  clients: 'client',
  logs: 'log',
  appointments: 'appointment',
  quotes: 'quote',
  campaigns: 'campaign',
}

interface State extends Collections {
  settings: Settings
  queue: SyncOp[]
  lastSyncAt?: string
  hydrated: boolean
  upsert: <K extends CollectionKey>(key: K, item: Collections[K][number]) => void
  remove: (key: CollectionKey, id: string) => void
  updateSettings: (s: Settings) => void
  flushQueue: () => Promise<void>
  resetDemo: () => void
}

const enqueue = (queue: SyncOp[], entity: Entity, action: SyncOp['action'], refId: string): SyncOp[] => [
  ...queue,
  { id: uid(), entity, action, refId, at: nowIso() },
]

export const useStore = create<State>()(
  persist(
    (setState, getState) => ({
      clients: seedClients,
      logs: seedLogs,
      appointments: seedAppointments,
      quotes: seedQuotes,
      campaigns: seedCampaigns,
      settings: defaultSettings,
      queue: [],
      hydrated: false,

      upsert: (key, item) =>
        setState((s) => {
          const list = s[key] as { id: string }[]
          const exists = list.some((x) => x.id === item.id)
          return {
            [key]: exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list],
            queue: enqueue(s.queue, ENTITY[key], exists ? 'update' : 'create', item.id),
          } as Partial<State>
        }),

      remove: (key, id) =>
        setState((s) => ({
          [key]: (s[key] as { id: string }[]).filter((x) => x.id !== id),
          queue: enqueue(s.queue, ENTITY[key], 'delete', id),
        }) as Partial<State>),

      updateSettings: (settings) => setState((s) => ({ settings, queue: enqueue(s.queue, 'settings', 'update', 'settings') })),

      /**
       * Punto de integración con el backend: aquí se enviará `queue` a la API (POST /sync)
       * y se resolverán conflictos. Por ahora simula la latencia de red.
       */
      flushQueue: async () => {
        if (!getState().queue.length || !navigator.onLine) return
        await new Promise((r) => setTimeout(r, 900))
        setState({ queue: [], lastSyncAt: nowIso() })
      },

      resetDemo: () =>
        setState({
          clients: seedClients,
          logs: seedLogs,
          appointments: seedAppointments,
          quotes: seedQuotes,
          campaigns: seedCampaigns,
          settings: defaultSettings,
          queue: [],
        }),
    }),
    {
      name: 'securops-db',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    },
  ),
)

export const useClient = (id?: string) => useStore((s) => s.clients.find((c) => c.id === id))
