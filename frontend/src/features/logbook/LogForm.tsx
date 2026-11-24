import { useState, type ReactNode } from 'react'
import { BatteryCharging, ClipboardList, Gauge, ImageIcon, Plus, Trash2, Wrench } from 'lucide-react'
import type { LogEntry, ServiceArea, WorkType } from '@/types'
import { Button, ChipGroup, Field, Input, Segmented, Select, Textarea } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { PhotoPicker } from './PhotoPicker'
import { AREA, ENVIRONMENTS, WORK_TYPE } from '@/lib/labels'
import { useStore } from '@/store/useStore'
import { addMonths, toLocalInput } from '@/lib/utils'
import { toast } from '@/store/useToast'

const PROTECTIONS = ['DPS', 'Protector de voltaje', 'Breaker', 'Fusible', 'Pararrayos']

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-ink-900/40 p-4">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-200">
        <span className="text-volt-400">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

const numOrUndef = (v: string) => (v === '' ? undefined : Number(v))

export function LogForm({ open, onClose, initial }: { open: boolean; onClose: () => void; initial: LogEntry }) {
  const { clients, settings, upsert } = useStore()
  const [log, setLog] = useState<LogEntry>(initial)
  const [prevInitial, setPrevInitial] = useState(initial)
  if (prevInitial !== initial) {
    setPrevInitial(initial)
    setLog(initial)
  }
  const set = <K extends keyof LogEntry>(k: K, v: LogEntry[K]) => setLog((l) => ({ ...l, [k]: v }))
  const setM = (p: Partial<LogEntry['measurements']>) => setLog((l) => ({ ...l, measurements: { ...l.measurements, ...p } }))
  const setE = (p: Partial<NonNullable<LogEntry['energizer']>>) => setLog((l) => ({ ...l, energizer: { ...l.energizer!, ...p } }))
  const client = clients.find((c) => c.id === log.clientId)

  const submit = () => {
    if (!log.clientId || !log.technician) {
      toast('Faltan datos', 'Selecciona cliente y técnico', 'error')
      return
    }
    const date = new Date(log.date).toISOString()
    const next = log.nextMaintenance || (client?.maintenanceEveryMonths ? addMonths(date, client.maintenanceEveryMonths) : undefined)
    upsert('logs', { ...log, date, nextMaintenance: next, location: log.location || client?.address || '' })
    if (client) upsert('clients', { ...client, lastServiceAt: date, services: Array.from(new Set([...client.services, log.area])) })
    toast('Bitácora guardada', navigator.onLine ? 'Se sincronizará en segundos' : 'Guardada offline, se sincronizará al volver la señal')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Registro de bitácora"
      subtitle="Se guarda en el dispositivo aunque no haya internet"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit}>
            Guardar bitácora
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Section icon={<ClipboardList className="size-4" />} title="Servicio">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Cliente">
              {(id) => (
                <Select id={id} value={log.clientId} onChange={(e) => set('clientId', e.target.value)}>
                  <option value="">Seleccionar…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Ubicación / sector">{(id) => <Input id={id} value={log.location} placeholder={client?.address ?? 'Ej. Perímetro trasero'} onChange={(e) => set('location', e.target.value)} />}</Field>
            <Field label="Fecha y hora">{(id) => <Input id={id} type="datetime-local" value={toLocalInput(log.date)} onChange={(e) => set('date', e.target.value)} />}</Field>
            <Field label="Área">
              {() => <Segmented className="w-full" value={log.area} onChange={(v: ServiceArea) => set('area', v)} options={(Object.keys(AREA) as ServiceArea[]).map((a) => ({ value: a, label: AREA[a].short }))} />}
            </Field>
            <Field label="Tipo de trabajo">
              {(id) => (
                <Select id={id} value={log.workType} onChange={(e) => set('workType', e.target.value as WorkType)}>
                  {(Object.keys(WORK_TYPE) as WorkType[]).map((w) => (
                    <option key={w} value={w}>
                      {WORK_TYPE[w]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Técnico">
                {(id) => (
                  <Select id={id} value={log.technician} onChange={(e) => set('technician', e.target.value)}>
                    <option value="">—</option>
                    {settings.technicians.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Ayudante">
                {(id) => (
                  <Select id={id} value={log.helper ?? ''} onChange={(e) => set('helper', e.target.value || undefined)}>
                    <option value="">—</option>
                    {settings.technicians.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          </div>
        </Section>

        {log.area === 'cerco' && (
          <Section icon={<BatteryCharging className="size-4" />} title="Energizador">
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Marca">{(id) => <Input id={id} value={log.energizer?.brand ?? ''} onChange={(e) => setE({ brand: e.target.value })} />}</Field>
              <Field label="Modelo">{(id) => <Input id={id} value={log.energizer?.model ?? ''} onChange={(e) => setE({ model: e.target.value })} />}</Field>
              <Field label="Voltaje entrada">
                {() => <Segmented className="w-full" value={log.energizer?.inputVoltage ?? '110V'} onChange={(v) => setE({ inputVoltage: v })} options={[{ value: '110V', label: '110V' }, { value: '220V', label: '220V' }]} />}
              </Field>
              <Field label="Batería">
                {(id) => (
                  <Select id={id} value={log.energizer?.battery} onChange={(e) => setE({ battery: e.target.value as 'buena' })}>
                    <option value="buena">Buena</option>
                    <option value="regular">Regular</option>
                    <option value="reemplazar">Reemplazar</option>
                    <option value="n/a">N/A</option>
                  </Select>
                )}
              </Field>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">Protecciones instaladas</p>
              <ChipGroup value={log.energizer?.protections ?? []} onChange={(v) => setE({ protections: v })} options={PROTECTIONS.map((p) => ({ value: p, label: p }))} />
            </div>
          </Section>
        )}

        <Section icon={<Gauge className="size-4" />} title="Mediciones">
          <div className="grid gap-4 md:grid-cols-4">
            {log.area === 'cerco' && (
              <Field label="Voltaje en línea (kV)">{(id) => <Input id={id} type="number" step="0.1" inputMode="decimal" value={log.measurements.lineKv ?? ''} onChange={(e) => setM({ lineKv: numOrUndef(e.target.value) })} />}</Field>
            )}
            <Field label="Batería (V)">{(id) => <Input id={id} type="number" step="0.1" inputMode="decimal" value={log.measurements.batteryV ?? ''} onChange={(e) => setM({ batteryV: numOrUndef(e.target.value) })} />}</Field>
            <Field label="Cargador (V)">{(id) => <Input id={id} type="number" step="0.1" inputMode="decimal" value={log.measurements.chargerV ?? ''} onChange={(e) => setM({ chargerV: numOrUndef(e.target.value) })} />}</Field>
            <Field label="Tierra física">
              {(id) => (
                <Select id={id} value={log.measurements.groundStatus} onChange={(e) => setM({ groundStatus: e.target.value as 'ok' })}>
                  <option value="ok">Óptima</option>
                  <option value="regular">Regular</option>
                  <option value="deficiente">Deficiente</option>
                  <option value="sin-medir">Sin medir</option>
                </Select>
              )}
            </Field>
            <Field label="Fugas o fallas detectadas" className="md:col-span-4">
              {(id) => <Input id={id} value={log.measurements.leaks ?? ''} placeholder="Ej. Fuga en tramo 3 por contacto con vegetación" onChange={(e) => setM({ leaks: e.target.value })} />}
            </Field>
          </div>
        </Section>

        <Section icon={<Wrench className="size-4" />} title="Diagnóstico y repuestos">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Falla reportada">{(id) => <Textarea id={id} value={log.reportedFaults ?? ''} onChange={(e) => set('reportedFaults', e.target.value)} />}</Field>
            <Field label="Causa raíz">{(id) => <Textarea id={id} value={log.rootCause ?? ''} onChange={(e) => set('rootCause', e.target.value)} />}</Field>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">Repuestos usados</p>
            <div className="space-y-2">
              {log.partsUsed.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_auto] gap-2">
                  <Input aria-label="Repuesto" value={p.name} placeholder="Repuesto" onChange={(e) => set('partsUsed', log.partsUsed.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <Input aria-label="Cantidad" type="number" min={1} value={p.qty} onChange={(e) => set('partsUsed', log.partsUsed.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)))} />
                  <Button variant="ghost" size="icon" aria-label="Quitar repuesto" onClick={() => set('partsUsed', log.partsUsed.filter((_, j) => j !== i))}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" icon={<Plus className="size-4" />} onClick={() => set('partsUsed', [...log.partsUsed, { name: '', qty: 1 }])}>
                Agregar repuesto
              </Button>
            </div>
          </div>
        </Section>

        <Section icon={<ImageIcon className="size-4" />} title="Entorno y evidencia">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">Condiciones del entorno</p>
          <ChipGroup value={log.environmentNotes} onChange={(v) => set('environmentNotes', v)} options={ENVIRONMENTS} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <PhotoPicker label="Fotos antes" value={log.photosBefore} onChange={(v) => set('photosBefore', v)} />
            <PhotoPicker label="Fotos después" value={log.photosAfter} onChange={(v) => set('photosAfter', v)} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
            <Field label="Observaciones">{(id) => <Textarea id={id} value={log.observations ?? ''} onChange={(e) => set('observations', e.target.value)} />}</Field>
            <Field label="Próximo mantenimiento" hint={client?.maintenanceEveryMonths ? `Auto: cada ${client.maintenanceEveryMonths} meses` : undefined}>
              {(id) => <Input id={id} type="date" value={log.nextMaintenance?.slice(0, 10) ?? ''} onChange={(e) => set('nextMaintenance', e.target.value ? new Date(e.target.value).toISOString() : undefined)} />}
            </Field>
          </div>
        </Section>
      </div>
    </Modal>
  )
}
