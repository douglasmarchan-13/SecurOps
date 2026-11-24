import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarPlus, ClipboardList, FileText, MapPin, MessageCircle, Pencil, Phone, Plus, Search, Trash2, Users } from 'lucide-react'
import type { Client, ServiceArea } from '@/types'
import { Badge, Button, Card, EmptyState, Input, PageHeader, Segmented } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { ClientForm } from '@/features/clients/ClientForm'
import { AppointmentForm } from '@/features/agenda/AppointmentForm'
import { emptyAppointment, emptyClient } from '@/lib/domain'
import { AREA, APPT_KIND, QUOTE_STATUS, WORK_TYPE } from '@/lib/labels'
import { DUE_LABEL, DUE_TONE, maintenanceDue } from '@/lib/maintenance'
import { quoteTotals } from '@/lib/quote'
import { useStore } from '@/store/useStore'
import { cn, fmtDate, fmtDateTime, initials, money } from '@/lib/utils'
import { openWhatsApp } from '@/lib/whatsapp'
import { toast } from '@/store/useToast'
import type { Appointment } from '@/types'

export default function ClientsPage() {
  const { clients, remove } = useStore()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [area, setArea] = useState<ServiceArea | 'all'>('all')
  const [editing, setEditing] = useState<Client | null>(null)
  const [scheduling, setScheduling] = useState<Appointment | null>(null)
  const selected = clients.find((c) => c.id === params.get('id'))

  const list = useMemo(() => {
    const t = q.toLowerCase()
    return clients
      .filter((c) => area === 'all' || c.services.includes(area))
      .filter((c) => !t || `${c.name} ${c.zone} ${c.address} ${c.phone} ${c.tags.join(' ')}`.toLowerCase().includes(t))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [clients, q, area])

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Clientes"
        description={`${clients.length} clientes · historial de servicios, presupuestos y mantenimientos.`}
        actions={
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setEditing(emptyClient())}>
            Nuevo cliente
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, zona, etiqueta…" className="pl-10" aria-label="Buscar clientes" />
        </div>
        <Segmented value={area} onChange={setArea} options={[{ value: 'all' as const, label: 'Todos' }, ...(Object.keys(AREA) as ServiceArea[]).map((a) => ({ value: a, label: AREA[a].short }))]} />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Users className="size-6" />} title="Sin clientes" description="Crea tu primer cliente para empezar." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c, i) => {
            const due = maintenanceDue(c)
            return (
              <button key={c.id} onClick={() => setParams({ id: c.id })} className="text-left animate-rise" style={{ animationDelay: `${Math.min(i, 9) * 30}ms` }}>
                <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-white/15">
                  <div className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-ink-600 to-ink-700 font-display font-bold text-volt-300">{initials(c.name)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{c.name}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-ink-400">
                        <MapPin className="size-3" /> {c.zone || '—'}
                      </p>
                    </div>
                    <Badge tone={DUE_TONE[due.state]}>{DUE_LABEL[due.state]}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.services.map((s) => {
                      const A = AREA[s]
                      return (
                        <Badge key={s} tone={A.tone}>
                          <A.icon className="size-3" /> {A.short}
                        </Badge>
                      )
                    })}
                    {c.tags.map((t) => (
                      <Badge key={t}>#{t}</Badge>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-ink-500">
                    Último servicio: {fmtDate(c.lastServiceAt)}
                    {due.dueAt && ` · Próximo: ${fmtDate(due.dueAt)}`}
                  </p>
                </Card>
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <ClientDetail
          client={selected}
          onClose={() => setParams({})}
          onEdit={() => setEditing(selected)}
          onSchedule={() => setScheduling(emptyAppointment({ clientId: selected.id, kind: 'mantenimiento', area: selected.services[0] ?? 'cerco' }))}
          onDelete={() => {
            remove('clients', selected.id)
            setParams({})
            toast('Cliente eliminado', undefined, 'info')
          }}
        />
      )}
      {editing && <ClientForm initial={editing} onClose={() => setEditing(null)} />}
      {scheduling && <AppointmentForm initial={scheduling} onClose={() => setScheduling(null)} />}
    </>
  )
}

function ClientDetail({ client: c, onClose, onEdit, onSchedule, onDelete }: { client: Client; onClose: () => void; onEdit: () => void; onSchedule: () => void; onDelete: () => void }) {
  const { logs, quotes, appointments, settings } = useStore()
  const due = maintenanceDue(c)
  const history = useMemo(
    () =>
      [
        ...logs.filter((l) => l.clientId === c.id).map((l) => ({ at: l.date, icon: ClipboardList, title: `${WORK_TYPE[l.workType]} · ${AREA[l.area].short}`, sub: l.rootCause || l.reportedFaults || l.location, tone: 'volt' as const })),
        ...quotes.filter((q) => q.clientId === c.id).map((q) => ({ at: q.createdAt, icon: FileText, title: `Presupuesto ${q.number}`, sub: `${q.title} · ${money(quoteTotals(q, settings.company.taxPct).total, settings.company.currency)} · ${QUOTE_STATUS[q.status].label}`, tone: 'arc' as const })),
        ...appointments.filter((a) => a.clientId === c.id).map((a) => ({ at: a.start, icon: CalendarPlus, title: APPT_KIND[a.kind], sub: `${fmtDateTime(a.start)} · ${a.technician}`, tone: 'violet' as const })),
      ].sort((a, b) => b.at.localeCompare(a.at)),
    [logs, quotes, appointments, c.id, settings],
  )

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={c.name}
      subtitle={c.address}
      footer={
        <>
          <Button variant="danger" size="icon" aria-label="Eliminar cliente" onClick={onDelete} className="mr-auto">
            <Trash2 className="size-4" />
          </Button>
          <Button icon={<Pencil className="size-4" />} onClick={onEdit}>
            Editar
          </Button>
          <Button icon={<CalendarPlus className="size-4" />} onClick={onSchedule}>
            Agendar
          </Button>
          <Button variant="whatsapp" icon={<MessageCircle className="size-4" />} onClick={() => openWhatsApp(c.phone, `Hola ${c.name} 👋, te saluda ${settings.company.name}.`)}>
            WhatsApp
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-ink-900/50 p-4 text-sm">
            <p className="flex items-center gap-2 text-ink-300">
              <Phone className="size-4 text-ink-500" /> +{c.phone}
            </p>
            <p className="mt-2 flex items-center gap-2 text-ink-300">
              <MapPin className="size-4 text-ink-500" /> {c.zone}
            </p>
            {c.environment.length > 0 && <p className="mt-2 text-xs text-ink-400">Entorno: {c.environment.join(', ')}</p>}
            {c.notes && <p className="mt-3 text-xs text-ink-400">{c.notes}</p>}
          </div>
          <div className={cn('rounded-2xl border p-4', due.state === 'vencido' ? 'border-red-400/25 bg-red-400/5' : due.state === 'proximo' ? 'border-amber-400/25 bg-amber-400/5' : 'border-white/5 bg-ink-900/50')}>
            <p className="text-xs uppercase tracking-wider text-ink-400">Mantenimiento preventivo</p>
            <p className="mt-1 font-display text-xl font-bold">{due.dueAt ? fmtDate(due.dueAt) : 'Sin plan'}</p>
            <p className="text-xs text-ink-400">
              {c.maintenanceEveryMonths ? `Cada ${c.maintenanceEveryMonths} meses` : 'Configura la frecuencia en Editar'}
              {due.days != null && ` · ${due.days < 0 ? `vencido hace ${-due.days} días` : `en ${due.days} días`}`}
            </p>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-wider text-ink-400">Historial ({history.length})</p>
          {history.length === 0 ? (
            <p className="text-sm text-ink-500">Aún no hay servicios registrados.</p>
          ) : (
            <ol className="space-y-2">
              {history.map((h, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-3">
                  <h.icon className={cn('mt-0.5 size-4 shrink-0', h.tone === 'volt' ? 'text-volt-400' : h.tone === 'arc' ? 'text-arc-400' : 'text-violet-400')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{h.title}</p>
                    <p className="truncate text-xs text-ink-400">{h.sub}</p>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] text-ink-500">{fmtDate(h.at)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Modal>
  )
}
