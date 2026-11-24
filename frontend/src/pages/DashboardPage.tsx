import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight, CalendarDays, Cctv, ClipboardList, DoorOpen, FileText, Megaphone, Wallet, Zap } from 'lucide-react'
import { Badge, Button, Card, CardHeader, Stat } from '@/components/ui/primitives'
import { APPT_KIND, APPT_STATUS, AREA, WORK_TYPE } from '@/lib/labels'
import { DUE_TONE, maintenanceDue } from '@/lib/maintenance'
import { quoteTotals } from '@/lib/quote'
import { useStore } from '@/store/useStore'
import { cn, fmtDate, money } from '@/lib/utils'

const MODULES = [
  { to: '/cercos', title: 'Cercos eléctricos', desc: 'Materiales por metro, hilos y Tipo A/B/C', icon: Zap, color: 'from-volt-400/25 text-volt-300' },
  { to: '/camaras', title: 'Cámaras CCTV', desc: 'Grabador, disco y cableado automático', icon: Cctv, color: 'from-arc-400/25 text-arc-300' },
  { to: '/portones', title: 'Motores y portones', desc: 'Motor ideal según peso y uso', icon: DoorOpen, color: 'from-violet-400/25 text-violet-300' },
]

export default function DashboardPage() {
  const nav = useNavigate()
  const { appointments, clients, logs, quotes, campaigns, settings } = useStore()
  const [today] = useState(() => new Date())
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const clientName = (id?: string) => clients.find((c) => c.id === id)?.name ?? '—'

  const todayAppts = useMemo(
    () => appointments.filter((a) => new Date(a.start).toDateString() === today.toDateString() && a.status !== 'cancelada').sort((a, b) => a.start.localeCompare(b.start)),
    [appointments, today],
  )
  const upcoming = useMemo(() => appointments.filter((a) => new Date(a.start) > today && a.status !== 'cancelada').sort((a, b) => a.start.localeCompare(b.start)).slice(0, 5),
    [appointments, today])
  const due = useMemo(() => clients.map((c) => ({ c, d: maintenanceDue(c) })).filter((x) => x.d.state === 'vencido' || x.d.state === 'proximo').sort((a, b) => (a.d.days ?? 0) - (b.d.days ?? 0)), [clients])
  const pipeline = quotes.filter((q) => q.status === 'enviado').reduce((s, q) => s + quoteTotals(q, settings.company.taxPct).total, 0)
  const monthLogs = logs.filter((l) => new Date(l.date).getMonth() === today.getMonth() && new Date(l.date).getFullYear() === today.getFullYear()).length
  const scheduled = campaigns.filter((c) => c.status === 'programada').length

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="relative animate-rise overflow-hidden p-6 md:p-8">
        <div className="grid-bg absolute inset-0 opacity-50 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
        <svg className="pointer-events-none absolute -right-10 top-0 hidden h-full w-[55%] md:block" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M0 ${40 + i * 30} L400 ${40 + i * 30}`} stroke="var(--color-volt-400)" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="4 36" className="animate-current" style={{ animationDelay: `${i * -0.3}s` }} />
          ))}
          {[60, 160, 260, 360].map((x) => (
            <rect key={x} x={x} y={25} width="4" height="160" rx="2" fill="var(--color-ink-500)" opacity="0.6" />
          ))}
        </svg>
        <div className="relative max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-volt-400">{today.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            {greeting}, <span className="text-gradient">equipo</span> ⚡
          </h1>
          <p className="mt-2 text-ink-300">
            Tienes <b className="text-ink-100">{todayAppts.length} servicios hoy</b> y <b className="text-ink-100">{due.length} mantenimientos</b> por atender.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" icon={<ClipboardList className="size-4" />} onClick={() => nav('/bitacora')}>
              Registrar bitácora
            </Button>
            <Button icon={<Zap className="size-4" />} onClick={() => nav('/cercos')}>
              Cotizar cerco
            </Button>
            <Button icon={<CalendarDays className="size-4" />} onClick={() => nav('/agenda')}>
              Ver agenda
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Servicios hoy" value={todayAppts.length} hint={`${upcoming.length} próximos`} icon={<CalendarDays className="size-4" />} />
        <Stat label="Mantenimientos" value={due.length} hint={`${due.filter((x) => x.d.state === 'vencido').length} vencidos`} icon={<AlertTriangle className="size-4" />} accent="amber" />
        <Stat label="En negociación" value={money(pipeline, settings.company.currency)} hint={`${quotes.filter((q) => q.status === 'enviado').length} presupuestos`} icon={<Wallet className="size-4" />} accent="arc" />
        <Stat label="Bitácoras del mes" value={monthLogs} hint={`${scheduled} campañas programadas`} icon={<ClipboardList className="size-4" />} accent="violet" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {MODULES.map((m) => (
          <button key={m.to} onClick={() => nav(m.to)} className={cn('group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br to-transparent p-5 text-left transition hover:-translate-y-0.5 hover:border-white/15', m.color)}>
            <m.icon className="size-7" />
            <p className="mt-4 font-display text-lg font-semibold text-ink-100">{m.title}</p>
            <p className="text-sm text-ink-400">{m.desc}</p>
            <ArrowUpRight className="absolute right-4 top-4 size-5 text-ink-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-100" />
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader icon={<CalendarDays className="size-5" />} title="Próximos servicios" action={<Button size="sm" variant="ghost" onClick={() => nav('/agenda')}>Agenda →</Button>} />
          <ul className="divide-y divide-white/5">
            {[...todayAppts, ...upcoming.filter((u) => !todayAppts.includes(u))].slice(0, 6).map((a) => {
              const A = AREA[a.area]
              const s = new Date(a.start)
              return (
                <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-14 text-center">
                    <p className="font-mono text-sm font-semibold">{s.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[10px] uppercase text-ink-500">{s.toDateString() === today.toDateString() ? 'Hoy' : s.toLocaleDateString('es', { weekday: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className={cn('grid size-9 place-items-center rounded-xl', a.area === 'cerco' ? 'bg-volt-400/10 text-volt-400' : a.area === 'cctv' ? 'bg-arc-400/10 text-arc-400' : 'bg-violet-400/10 text-violet-400')}>
                    <A.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{clientName(a.clientId)}</p>
                    <p className="truncate text-xs text-ink-400">
                      {APPT_KIND[a.kind]} · {a.technician}
                    </p>
                  </div>
                  <Badge tone={APPT_STATUS[a.status].tone}>{APPT_STATUS[a.status].label}</Badge>
                </li>
              )
            })}
            {todayAppts.length + upcoming.length === 0 && <li className="px-5 py-8 text-center text-sm text-ink-500">Sin servicios agendados</li>}
          </ul>
        </Card>

        <Card>
          <CardHeader icon={<AlertTriangle className="size-5" />} title="Alertas de mantenimiento" />
          <ul className="divide-y divide-white/5">
            {due.length === 0 && <li className="px-5 py-8 text-center text-sm text-ink-500">Todo al día ✨</li>}
            {due.slice(0, 5).map(({ c, d }) => (
              <li key={c.id}>
                <button onClick={() => nav(`/clientes?id=${c.id}`)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-white/[0.02]">
                  <span className={cn('size-2 shrink-0 rounded-full', d.state === 'vencido' ? 'animate-pulse bg-red-400' : 'bg-amber-400')} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-ink-500">{fmtDate(d.dueAt)}</p>
                  </div>
                  <Badge tone={DUE_TONE[d.state]}>{d.days! < 0 ? `${-d.days!}d tarde` : `${d.days}d`}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader icon={<ClipboardList className="size-5" />} title="Últimas bitácoras" action={<Button size="sm" variant="ghost" onClick={() => nav('/bitacora')}>Ver todas →</Button>} />
          <ul className="divide-y divide-white/5">
            {[...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                <Badge tone={AREA[l.area].tone}>{AREA[l.area].short}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{clientName(l.clientId)}</p>
                  <p className="truncate text-xs text-ink-400">
                    {WORK_TYPE[l.workType]} · {l.rootCause || l.reportedFaults || l.location}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-ink-500">{fmtDate(l.date, { day: '2-digit', month: 'short' })}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader icon={<FileText className="size-5" />} title="Presupuestos recientes" action={<Button size="sm" variant="ghost" onClick={() => nav('/presupuestos')}>Ver todos →</Button>} />
          <ul className="divide-y divide-white/5">
            {[...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4).map((q) => (
              <li key={q.id} className="flex items-center gap-3 px-5 py-3">
                <span className="font-mono text-xs text-ink-500">{q.number}</span>
                <p className="min-w-0 flex-1 truncate text-sm">{q.title}</p>
                <span className="font-mono text-sm font-semibold">{money(quoteTotals(q, settings.company.taxPct).total, settings.company.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/5 p-4">
            <Button className="w-full" icon={<Megaphone className="size-4" />} onClick={() => nav('/campanas')}>
              Lanzar campaña por WhatsApp
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
