import { useMemo, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Appointment } from '@/types'
import { Badge, Button, Card, CardHeader, PageHeader } from '@/components/ui/primitives'
import { AppointmentForm } from '@/features/agenda/AppointmentForm'
import { emptyAppointment } from '@/lib/domain'
import { APPT_KIND, APPT_STATUS, AREA } from '@/lib/labels'
import { DUE_TONE, maintenanceDue } from '@/lib/maintenance'
import { useStore } from '@/store/useStore'
import { cn, fmtDate } from '@/lib/utils'

const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i) // 7:00 – 18:00
const ROW = 56 // px por hora

const startOfWeek = (d: Date) => {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // lunes = 0
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
const areaColor = { cerco: 'border-volt-400/60 bg-volt-400/15 text-volt-200', cctv: 'border-arc-400/60 bg-arc-400/15 text-arc-200', porton: 'border-violet-400/60 bg-violet-400/15 text-violet-200' }

export default function AgendaPage() {
  const { appointments, clients } = useStore()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [today] = useState(() => new Date())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? '—'

  const weekAppts = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 7)
    return appointments.filter((a) => {
      const s = new Date(a.start)
      return s >= weekStart && s < end && a.status !== 'cancelada'
    })
  }, [appointments, weekStart])

  const dueClients = useMemo(
    () =>
      clients
        .map((c) => ({ c, due: maintenanceDue(c) }))
        .filter(({ c, due }) => (due.state === 'vencido' || due.state === 'proximo') && !appointments.some((a) => a.clientId === c.id && a.kind === 'mantenimiento' && new Date(a.start) > today && a.status !== 'cancelada'))
        .sort((a, b) => (a.due.days ?? 0) - (b.due.days ?? 0)),
    [clients, appointments, today],
  )

  const shift = (n: number) =>
    setWeekStart((w) => {
      const x = new Date(w)
      x.setDate(x.getDate() + n * 7)
      return x
    })

  const newAt = (day: Date, hour: number) => {
    const s = new Date(day)
    s.setHours(hour, 0, 0, 0)
    setEditing(emptyAppointment({ start: s.toISOString() }))
  }

  const range = `${fmtDate(days[0].toISOString(), { day: 'numeric', month: 'short' })} – ${fmtDate(days[6].toISOString(), { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Agenda"
        description="Visitas, instalaciones y mantenimientos preventivos del equipo técnico."
        actions={
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setEditing(emptyAppointment())}>
            Agendar cita
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <Button size="icon" variant="ghost" aria-label="Semana anterior" onClick={() => shift(-1)}>
              <ChevronLeft className="size-5" />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Semana siguiente" onClick={() => shift(1)}>
              <ChevronRight className="size-5" />
            </Button>
            <h2 className="font-display font-semibold capitalize">{range}</h2>
            <Button size="sm" className="ml-auto" onClick={() => setWeekStart(startOfWeek(new Date()))}>
              Hoy
            </Button>
          </div>

          {/* Vista semanal (escritorio) */}
          <div className="hidden overflow-x-auto md:block">
            <div className="grid min-w-[760px] grid-cols-[56px_repeat(7,1fr)]">
              <div />
              {days.map((d) => (
                <div key={d.toISOString()} className={cn('border-l border-white/5 px-2 py-2 text-center', sameDay(d, today) && 'bg-volt-400/5')}>
                  <p className="text-[10px] uppercase tracking-wider text-ink-500">{d.toLocaleDateString('es', { weekday: 'short' })}</p>
                  <p className={cn('mx-auto mt-0.5 grid size-8 place-items-center rounded-full font-display font-bold', sameDay(d, today) && 'bg-volt-400 text-ink-950')}>{d.getDate()}</p>
                </div>
              ))}
              <div className="relative">
                {HOURS.map((h) => (
                  <div key={h} style={{ height: ROW }} className="pr-2 text-right font-mono text-[10px] text-ink-500">
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              {days.map((d) => (
                <div key={d.toISOString()} className={cn('relative border-l border-white/5', sameDay(d, today) && 'bg-volt-400/[0.03]')}>
                  {HOURS.map((h) => (
                    <button key={h} aria-label={`Agendar ${d.toLocaleDateString('es')} ${h}:00`} onClick={() => newAt(d, h)} style={{ height: ROW }} className="block w-full border-t border-white/[0.04] transition hover:bg-white/[0.03]" />
                  ))}
                  {weekAppts
                    .filter((a) => sameDay(new Date(a.start), d))
                    .map((a) => {
                      const s = new Date(a.start)
                      const top = (s.getHours() + s.getMinutes() / 60 - HOURS[0]) * ROW
                      const height = Math.max(26, (a.durationMin / 60) * ROW - 4)
                      if (top < 0 || top > HOURS.length * ROW) return null
                      return (
                        <button
                          key={a.id}
                          onClick={() => setEditing(a)}
                          style={{ top: top + 2, height }}
                          className={cn('absolute inset-x-1 overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left text-[11px] shadow-lg transition hover:brightness-125', areaColor[a.area], a.status === 'completada' && 'opacity-50')}
                        >
                          <p className="truncate font-semibold">{clientName(a.clientId)}</p>
                          <p className="truncate opacity-80">
                            {s.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} · {APPT_KIND[a.kind]}
                          </p>
                        </button>
                      )
                    })}
                  {sameDay(d, today) && today.getHours() >= HOURS[0] && today.getHours() <= HOURS.at(-1)! && (
                    <div className="pointer-events-none absolute inset-x-0 z-10 h-px bg-red-400" style={{ top: (today.getHours() + today.getMinutes() / 60 - HOURS[0]) * ROW }}>
                      <span className="absolute -left-1 -top-1 size-2 rounded-full bg-red-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lista (móvil) */}
          <div className="divide-y divide-white/5 md:hidden">
            {days.map((d) => {
              const list = weekAppts.filter((a) => sameDay(new Date(a.start), d)).sort((a, b) => a.start.localeCompare(b.start))
              return (
                <div key={d.toISOString()} className="p-4">
                  <p className={cn('mb-2 text-xs font-semibold capitalize', sameDay(d, today) ? 'text-volt-400' : 'text-ink-400')}>{d.toLocaleDateString('es', { weekday: 'long', day: 'numeric' })}</p>
                  {list.length === 0 ? (
                    <p className="text-xs text-ink-600">Libre</p>
                  ) : (
                    list.map((a) => (
                      <button key={a.id} onClick={() => setEditing(a)} className={cn('mb-2 block w-full rounded-xl border-l-[3px] px-3 py-2 text-left text-sm', areaColor[a.area])}>
                        <p className="font-semibold">{clientName(a.clientId)}</p>
                        <p className="text-xs opacity-80">
                          {new Date(a.start).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} · {APPT_KIND[a.kind]} · {a.technician}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader icon={<AlertTriangle className="size-5" />} title="Mantenimientos por agendar" subtitle="Vencidos o en los próximos 15 días" />
            <ul className="divide-y divide-white/5">
              {dueClients.length === 0 && <li className="px-5 py-6 text-center text-sm text-ink-500">Todo al día ✨</li>}
              {dueClients.map(({ c, due }) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-ink-500">{fmtDate(due.dueAt)}</p>
                  </div>
                  <Badge tone={DUE_TONE[due.state]}>{due.days! < 0 ? `${-due.days!}d tarde` : `en ${due.days}d`}</Badge>
                  <Button size="sm" onClick={() => setEditing(emptyAppointment({ clientId: c.id, kind: 'mantenimiento', area: c.services[0] ?? 'cerco' }))}>
                    Agendar
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="mb-3 text-xs uppercase tracking-wider text-ink-400">Esta semana</p>
            <div className="space-y-2">
              {(Object.keys(AREA) as (keyof typeof AREA)[]).map((k) => {
                const A = AREA[k]
                const n = weekAppts.filter((a) => a.area === k).length
                return (
                  <div key={k} className="flex items-center gap-3 text-sm">
                    <A.icon className="size-4 text-ink-400" />
                    <span className="flex-1 text-ink-300">{A.label}</span>
                    <span className="font-mono font-semibold">{n}</span>
                  </div>
                )
              })}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(Object.keys(APPT_STATUS) as (keyof typeof APPT_STATUS)[]).map((s) => (
                  <Badge key={s} tone={APPT_STATUS[s].tone}>
                    {APPT_STATUS[s].label}: {weekAppts.filter((a) => a.status === s).length}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {editing && <AppointmentForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  )
}
