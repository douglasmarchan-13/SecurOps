import { useMemo, useState } from 'react'
import { BatteryMedium, CalendarClock, ClipboardList, Copy, Gauge, Pencil, Plus, Search, Send, Trash2, Wrench } from 'lucide-react'
import type { LogEntry, ServiceArea } from '@/types'
import { Badge, Button, Card, EmptyState, Input, PageHeader, Segmented } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { LogForm } from '@/features/logbook/LogForm'
import { emptyLog, logSummary } from '@/lib/domain'
import { AREA, WORK_TYPE } from '@/lib/labels'
import { useStore } from '@/store/useStore'
import { cn, fmtDate, fmtDateTime } from '@/lib/utils'
import { copyText, openWhatsApp } from '@/lib/whatsapp'
import { toast } from '@/store/useToast'

const groundTone = { ok: 'green', regular: 'amber', deficiente: 'red', 'sin-medir': 'neutral' } as const

export default function LogbookPage() {
  const { logs, clients, settings, remove } = useStore()
  const [q, setQ] = useState('')
  const [area, setArea] = useState<ServiceArea | 'all'>('all')
  const [editing, setEditing] = useState<LogEntry | null>(null)
  const [viewing, setViewing] = useState<LogEntry | null>(null)
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? 'Cliente eliminado'

  const filtered = useMemo(() => {
    const names = new Map(clients.map((c) => [c.id, c.name]))
    const t = q.toLowerCase()
    return [...logs]
      .filter((l) => area === 'all' || l.area === area)
      .filter((l) => !t || `${names.get(l.clientId) ?? ''} ${l.location} ${l.technician} ${l.reportedFaults ?? ''}`.toLowerCase().includes(t))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [logs, q, area, clients])

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Bitácora técnica"
        description="Registro de cada intervención en campo: mediciones, fallas, repuestos y evidencia fotográfica."
        actions={
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setEditing(emptyLog('', settings.technicians[0]))}>
            Nueva bitácora
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por cliente, técnico, falla…" className="pl-10" aria-label="Buscar bitácoras" />
        </div>
        <Segmented
          value={area}
          onChange={setArea}
          options={[{ value: 'all' as const, label: 'Todas' }, ...(Object.keys(AREA) as ServiceArea[]).map((a) => ({ value: a, label: AREA[a].short }))]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="size-6" />} title="Sin registros" description="Crea la primera bitácora desde el campo, incluso sin conexión." />
      ) : (
        <ol className="relative space-y-4 border-l border-white/10 pl-6 md:ml-3">
          {filtered.map((l, i) => {
            const A = AREA[l.area]
            return (
              <li key={l.id} className="relative animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <span className={cn('absolute -left-[33px] top-5 grid size-4 place-items-center rounded-full border-2 border-ink-900', l.area === 'cerco' ? 'bg-volt-400' : l.area === 'cctv' ? 'bg-arc-400' : 'bg-violet-400')} />
                <Card className="cursor-pointer p-5 transition hover:border-white/15" >
                  <button className="block w-full text-left" onClick={() => setViewing(l)}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={A.tone}>
                        <A.icon className="size-3" /> {A.short}
                      </Badge>
                      <Badge>{WORK_TYPE[l.workType]}</Badge>
                      <span className="ml-auto font-mono text-xs text-ink-500">{fmtDateTime(l.date)}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{clientName(l.clientId)}</h3>
                    <p className="text-sm text-ink-400">
                      {l.location} · {l.technician}
                      {l.helper && ` + ${l.helper}`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {l.measurements.lineKv != null && (
                        <span className="flex items-center gap-1 rounded-lg bg-volt-400/10 px-2 py-1 font-mono text-volt-300">
                          <Gauge className="size-3" /> {l.measurements.lineKv} kV
                        </span>
                      )}
                      {l.measurements.batteryV != null && (
                        <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 font-mono text-ink-300">
                          <BatteryMedium className="size-3" /> {l.measurements.batteryV} V
                        </span>
                      )}
                      <Badge tone={groundTone[l.measurements.groundStatus]}>Tierra: {l.measurements.groundStatus}</Badge>
                      {l.partsUsed.length > 0 && (
                        <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-ink-300">
                          <Wrench className="size-3" /> {l.partsUsed.length} repuestos
                        </span>
                      )}
                      {l.nextMaintenance && (
                        <span className="flex items-center gap-1 rounded-lg bg-arc-400/10 px-2 py-1 text-arc-300">
                          <CalendarClock className="size-3" /> Próx. {fmtDate(l.nextMaintenance)}
                        </span>
                      )}
                    </div>
                    {l.reportedFaults && <p className="mt-3 line-clamp-2 text-sm text-ink-300">“{l.reportedFaults}”</p>}
                  </button>
                </Card>
              </li>
            )
          })}
        </ol>
      )}

      {editing && <LogForm open onClose={() => setEditing(null)} initial={editing} />}

      {viewing && (
        <Modal
          open
          onClose={() => setViewing(null)}
          size="lg"
          title={clientName(viewing.clientId)}
          subtitle={`${WORK_TYPE[viewing.workType]} · ${fmtDateTime(viewing.date)}`}
          footer={
            <>
              <Button
                variant="danger"
                size="icon"
                aria-label="Eliminar"
                onClick={() => {
                  remove('logs', viewing.id)
                  setViewing(null)
                  toast('Bitácora eliminada', undefined, 'info')
                }}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                icon={<Pencil className="size-4" />}
                onClick={() => {
                  setEditing(viewing)
                  setViewing(null)
                }}
              >
                Editar
              </Button>
              <Button icon={<Copy className="size-4" />} onClick={async () => (await copyText(logSummary(viewing, clientName(viewing.clientId), settings.company.name))) && toast('Reporte copiado')}>
                Copiar
              </Button>
              <Button
                variant="whatsapp"
                icon={<Send className="size-4" />}
                onClick={() => {
                  const c = clients.find((x) => x.id === viewing.clientId)
                  if (c) openWhatsApp(c.phone, logSummary(viewing, c.name, settings.company.name))
                }}
              >
                Enviar reporte
              </Button>
            </>
          }
        >
          <LogDetail l={viewing} />
        </Modal>
      )}
    </>
  )
}

function LogDetail({ l }: { l: LogEntry }) {
  const rows: [string, string | undefined][] = [
    ['Ubicación', l.location],
    ['Técnico', [l.technician, l.helper].filter(Boolean).join(' / ')],
    ['Energizador', l.energizer?.brand ? `${l.energizer.brand} ${l.energizer.model} · ${l.energizer.inputVoltage}` : undefined],
    ['Batería del equipo', l.energizer?.battery],
    ['Protecciones', l.energizer?.protections.join(', ') || undefined],
    ['Voltaje en línea', l.measurements.lineKv != null ? `${l.measurements.lineKv} kV` : undefined],
    ['Batería / cargador', [l.measurements.batteryV, l.measurements.chargerV].some((v) => v != null) ? `${l.measurements.batteryV ?? '—'} V / ${l.measurements.chargerV ?? '—'} V` : undefined],
    ['Tierra física', l.measurements.groundStatus],
    ['Fugas o fallas', l.measurements.leaks],
    ['Falla reportada', l.reportedFaults],
    ['Causa raíz', l.rootCause],
    ['Repuestos', l.partsUsed.map((p) => `${p.qty}× ${p.name}`).join(', ') || undefined],
    ['Entorno', l.environmentNotes.join(', ') || undefined],
    ['Observaciones', l.observations],
    ['Próximo mantenimiento', l.nextMaintenance && fmtDate(l.nextMaintenance)],
  ]
  return (
    <div className="space-y-5">
      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wider text-ink-500">{k}</dt>
              <dd className="text-ink-200">{v}</dd>
            </div>
          ))}
      </dl>
      {(l.photosBefore.length > 0 || l.photosAfter.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Antes', l.photosBefore],
            ['Después', l.photosAfter],
          ].map(([label, photos]) => (
            <div key={label as string}>
              <p className="mb-2 text-xs uppercase tracking-wider text-ink-500">{label as string}</p>
              <div className="grid grid-cols-3 gap-2">
                {(photos as string[]).map((src, i) => (
                  <img key={i} src={src} alt={`${label} ${i + 1}`} className="aspect-square rounded-xl object-cover" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
