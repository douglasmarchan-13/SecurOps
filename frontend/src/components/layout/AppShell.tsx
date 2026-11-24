import { Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Command, Menu, Search, X } from 'lucide-react'
import { NAV, MOBILE_NAV } from './nav'
import { Logo } from './Logo'
import { SyncPill } from './SyncPill'
import { CommandPalette } from './CommandPalette'
import { Toaster } from '@/components/ui/Toaster'
import { useAutoSync, useOnline } from '@/hooks/useOnline'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const groups = ['Operación', 'Soluciones', 'Comercial', 'Sistema'] as const

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-6" aria-label="Principal">
      {groups.map((g) => (
        <div key={g}>
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">{g}</p>
          <ul className="flex flex-col gap-0.5">
            {NAV.filter((n) => n.group === g).map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                      isActive ? 'bg-gradient-to-r from-volt-400/15 to-transparent text-ink-100' : 'text-ink-400 hover:bg-white/[0.03] hover:text-ink-200',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={cn('absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-volt-400 transition', isActive ? 'opacity-100' : 'opacity-0')} />
                      <n.icon className={cn('size-[18px]', isActive ? 'text-volt-400' : 'text-ink-500 group-hover:text-ink-300')} />
                      {n.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function PageFallback() {
  return (
    <div className="grid gap-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-white/5" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  )
}

export function AppShell() {
  useAutoSync()
  const online = useOnline()
  const hydrated = useStore((s) => s.hydrated)
  const [palette, setPalette] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Con llaves: en Chrome reciente scrollTo devuelve una Promise y React la trataría como función de limpieza.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="min-h-dvh">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-ink-950/60 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="mb-8 px-2">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <div className="mt-4 rounded-2xl border border-white/5 bg-gradient-to-br from-volt-400/10 via-transparent to-arc-400/10 p-4">
          <p className="text-xs font-semibold">Modo campo</p>
          <p className="mt-1 text-xs text-ink-400">Todo se guarda en el dispositivo y se sincroniza al volver la señal.</p>
        </div>
      </aside>

      {/* Drawer móvil */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 animate-rise flex-col bg-ink-900 px-4 py-5">
            <div className="mb-6 flex items-center justify-between px-2">
              <Logo />
              <button onClick={() => setDrawer(false)} aria-label="Cerrar menú" className="grid size-9 place-items-center rounded-xl hover:bg-white/5">
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <SidebarNav onNavigate={() => setDrawer(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-900/70 backdrop-blur-xl">
          {!online && <div className="bg-red-500/15 py-1 text-center text-xs font-medium text-red-300">Trabajando sin conexión — tus cambios están a salvo en este dispositivo</div>}
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <button onClick={() => setDrawer(true)} aria-label="Abrir menú" className="grid size-10 place-items-center rounded-xl hover:bg-white/5 lg:hidden">
              <Menu className="size-5" />
            </button>
            <div className="lg:hidden">
              <Logo compact />
            </div>
            <button
              onClick={() => setPalette(true)}
              className="ml-auto flex h-10 flex-1 items-center gap-2.5 rounded-xl border border-white/8 bg-ink-850/70 px-3 text-sm text-ink-400 transition hover:border-white/15 md:ml-0 md:max-w-md"
            >
              <Search className="size-4" />
              <span className="flex-1 text-left">Buscar…</span>
              <kbd className="hidden items-center gap-0.5 rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] md:flex">
                <Command className="size-3" />K
              </kbd>
            </button>
            <div className="flex items-center gap-2 md:ml-auto">
              <SyncPill />
              <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-volt-400 to-arc-400 font-display text-sm font-bold text-ink-950">SO</div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 pb-28 pt-6 md:px-8 lg:pb-10">
          {hydrated ? (
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          ) : (
            <PageFallback />
          )}
        </main>
      </div>

      {/* Bottom nav móvil */}
      <nav className="fixed inset-x-3 bottom-3 z-30 lg:hidden" aria-label="Accesos rápidos">
        <ul className="glass flex items-center justify-around rounded-2xl px-2 py-1.5 shadow-2xl">
          {NAV.filter((n) => MOBILE_NAV.includes(n.to)).map((n) => (
            <li key={n.to}>
              <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium', isActive ? 'text-volt-400' : 'text-ink-400')}>
                <n.icon className="size-5" />
                {n.label.split(' ')[0]}
              </NavLink>
            </li>
          ))}
          <li>
            <button onClick={() => setDrawer(true)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium text-ink-400">
              <Menu className="size-5" />
              Más
            </button>
          </li>
        </ul>
      </nav>

      {palette && <CommandPalette onClose={() => setPalette(false)} />}
      <Toaster />
    </div>
  )
}
