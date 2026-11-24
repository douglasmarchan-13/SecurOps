import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search, UserRound } from 'lucide-react'
import { NAV } from './nav'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

interface Item {
  id: string
  label: string
  hint: string
  icon: typeof Search
  run: () => void
}

/** Paleta de comandos (Ctrl/⌘ + K): navega módulos y busca clientes al instante. */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const nav = useNavigate()
  const clients = useStore((s) => s.clients)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)

  const items = useMemo<Item[]>(() => {
    const term = q.trim().toLowerCase()
    const go = (to: string) => () => {
      nav(to)
      onClose()
    }
    const pages = NAV.filter((n) => !term || `${n.label} ${n.keywords ?? ''}`.toLowerCase().includes(term)).map((n) => ({ id: n.to, label: n.label, hint: n.group, icon: n.icon, run: go(n.to) }))
    const people = term
      ? clients
          .filter((c) => `${c.name} ${c.zone} ${c.phone}`.toLowerCase().includes(term))
          .slice(0, 6)
          .map((c) => ({ id: c.id, label: c.name, hint: `Cliente · ${c.zone}`, icon: UserRound, run: go(`/clientes?id=${c.id}`) }))
      : []
    return [...people, ...pages]
  }, [q, clients, nav, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/70 px-4 pt-[12vh] backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-xl animate-rise overflow-hidden rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/5 px-4">
          <Search className="size-5 text-ink-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => Math.min(items.length - 1, a + 1))
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(0, a - 1))
              }
              if (e.key === 'Enter') items[active]?.run()
            }}
            placeholder="Buscar módulos, clientes…"
            className="h-14 flex-1 bg-transparent text-base placeholder:text-ink-500 focus:outline-none"
          />
          <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-ink-400">ESC</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-400">Sin resultados</li>}
          {items.map((it, i) => (
            <li key={it.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={it.run}
                className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left', i === active ? 'bg-volt-400/10 text-ink-100' : 'text-ink-300')}
              >
                <it.icon className={cn('size-4', i === active ? 'text-volt-400' : 'text-ink-500')} />
                <span className="flex-1 text-sm">{it.label}</span>
                <span className="text-xs text-ink-500">{it.hint}</span>
                {i === active && <CornerDownLeft className="size-3.5 text-ink-400" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
