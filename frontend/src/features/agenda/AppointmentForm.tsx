import { useState } from 'react'
import { Repeat } from 'lucide-react'
import type { Appointment, AppointmentKind, AppointmentStatus, ServiceArea } from '@/types'
import { Button, Field, Input, Segmented, Select, Stepper, Switch, Textarea } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { APPT_KIND, APPT_STATUS, AREA } from '@/lib/labels'
import { useStore } from '@/store/useStore'
import { addMonths, toLocalInput, uid } from '@/lib/utils'
import { toast } from '@/store/useToast'
import { openWhatsApp } from '@/lib/whatsapp'

export function AppointmentForm({ initial, onClose }: { initial: Appointment; onClose: () => void }) {
  const { clients, settings, appointments, upsert, remove } = useStore()
  const [a, setA] = useState(initial)
  const [repeat, setRepeat] = useState(false)
  const [everyMonths, setEveryMonths] = useState(6)
  const [times, setTimes] = useState(4)
  const [notify, setNotify] = useState(true)
  const isNew = !appointments.some((x) => x.id === initial.id)
  const set = <K extends keyof Appointment>(k: K, v: Appointment[K]) => setA((p) => ({ ...p, [k]: v }))

  const save = () => {
    if (!a.clientId) {
      toast('Selecciona un cliente', undefined, 'error')
      return
    }
    const base = { ...a, technician: a.technician || settings.technicians[0] }
    if (repeat && isNew) {
      const group = uid()
      for (let i = 0; i < times; i++) upsert('appointments', { ...base, id: i === 0 ? base.id : uid(), start: addMonths(base.start, everyMonths * i), recurringGroup: group })
      toast(`${times} mantenimientos agendados`, `Cada ${everyMonths} meses`)
    } else {
      upsert('appointments', base)
      toast(isNew ? 'Cita agendada' : 'Cita actualizada')
    }
    const client = clients.find((c) => c.id === a.clientId)
    if (notify && client && isNew) {
      const when = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(base.start))
      openWhatsApp(client.phone, `Hola ${client.name} 👋, te confirmamos tu cita de *${APPT_KIND[a.kind].toLowerCase()}* (${AREA[a.area].label}) para el *${when}*. Técnico: ${base.technician}. — ${settings.company.name}`)
    }
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isNew ? 'Agendar cita' : 'Editar cita'}
      footer={
        <>
          {!isNew && (
            <Button
              variant="danger"
              className="mr-auto"
              onClick={() => {
                remove('appointments', a.id)
                toast('Cita eliminada', undefined, 'info')
                onClose()
              }}
            >
              Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save}>
            {isNew ? 'Agendar' : 'Guardar'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Cliente">
          {(id) => (
            <Select id={id} value={a.clientId} onChange={(e) => set('clientId', e.target.value)}>
              <option value="">Seleccionar…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Tipo de cita">
          {(id) => (
            <Select id={id} value={a.kind} onChange={(e) => set('kind', e.target.value as AppointmentKind)}>
              {(Object.keys(APPT_KIND) as AppointmentKind[]).map((k) => (
                <option key={k} value={k}>
                  {APPT_KIND[k]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Área">
          {() => <Segmented className="w-full" value={a.area} onChange={(v: ServiceArea) => set('area', v)} options={(Object.keys(AREA) as ServiceArea[]).map((x) => ({ value: x, label: AREA[x].short }))} />}
        </Field>
        <Field label="Técnico">
          {(id) => (
            <Select id={id} value={a.technician} onChange={(e) => set('technician', e.target.value)}>
              <option value="">Asignar automáticamente</option>
              {settings.technicians.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Fecha y hora">{(id) => <Input id={id} type="datetime-local" value={toLocalInput(a.start)} onChange={(e) => e.target.value && set('start', new Date(e.target.value).toISOString())} />}</Field>
        <Field label="Duración">
          {(id) => (
            <Select id={id} value={a.durationMin} onChange={(e) => set('durationMin', Number(e.target.value))}>
              {[30, 60, 90, 120, 180, 240, 300, 480].map((m) => (
                <option key={m} value={m}>
                  {m < 60 ? `${m} min` : `${m / 60} h`}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {!isNew && (
          <Field label="Estado">
            {(id) => (
              <Select id={id} value={a.status} onChange={(e) => set('status', e.target.value as AppointmentStatus)}>
                {(Object.keys(APPT_STATUS) as AppointmentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {APPT_STATUS[s].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        )}
        <Field label="Notas" className="md:col-span-2">{(id) => <Textarea id={id} value={a.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />}</Field>

        {isNew && (
          <div className="space-y-3 md:col-span-2">
            <Switch
              checked={repeat}
              onChange={setRepeat}
              label={
                <span className="flex items-center gap-2">
                  <Repeat className="size-4 text-volt-400" /> Repetir como mantenimiento preventivo
                </span>
              }
            />
            {repeat && (
              <div className="grid animate-rise gap-4 rounded-xl border border-volt-400/20 bg-volt-400/5 p-4 sm:grid-cols-2">
                <Field label="Cada">{(id) => <Stepper id={id} value={everyMonths} onChange={setEveryMonths} min={1} max={12} suffix="meses" />}</Field>
                <Field label="Repeticiones">{(id) => <Stepper id={id} value={times} onChange={setTimes} min={2} max={12} />}</Field>
              </div>
            )}
            <Switch checked={notify} onChange={setNotify} label="Enviar confirmación por WhatsApp al cliente" />
          </div>
        )}
      </div>
    </Modal>
  )
}
