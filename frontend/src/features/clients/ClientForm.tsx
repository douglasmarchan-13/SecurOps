import { useState } from 'react'
import type { Client, ServiceArea } from '@/types'
import { Button, ChipGroup, Field, Input, Select, Textarea } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { AREA, ENVIRONMENTS } from '@/lib/labels'
import { useStore } from '@/store/useStore'
import { toast } from '@/store/useToast'

export function ClientForm({ initial, onClose }: { initial: Client; onClose: (saved?: Client) => void }) {
  const upsert = useStore((s) => s.upsert)
  const [c, setC] = useState(initial)
  const [tags, setTags] = useState(initial.tags.join(', '))
  const set = <K extends keyof Client>(k: K, v: Client[K]) => setC((p) => ({ ...p, [k]: v }))
  const phoneOk = /^\d{10,15}$/.test(c.phone.replace(/\D/g, ''))

  const save = () => {
    if (!c.name.trim() || !phoneOk) {
      toast('Revisa los datos', 'Nombre y WhatsApp (con código de país) son obligatorios', 'error')
      return
    }
    const saved = { ...c, phone: c.phone.replace(/\D/g, ''), tags: tags.split(',').map((t) => t.trim()).filter(Boolean) }
    upsert('clients', saved)
    toast(initial.name ? 'Cliente actualizado' : 'Cliente creado')
    onClose(saved)
  }

  return (
    <Modal
      open
      onClose={() => onClose()}
      size="lg"
      title={initial.name ? 'Editar cliente' : 'Nuevo cliente'}
      footer={
        <>
          <Button variant="ghost" onClick={() => onClose()}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre o razón social">{(id) => <Input id={id} value={c.name} onChange={(e) => set('name', e.target.value)} autoFocus />}</Field>
        <Field label="WhatsApp" hint={c.phone && !phoneOk ? 'Incluye código de país, ej. 58414…' : 'Con código de país, sin +'}>
          {(id) => <Input id={id} inputMode="tel" value={c.phone} placeholder="584141234567" onChange={(e) => set('phone', e.target.value)} />}
        </Field>
        <Field label="Dirección" className="md:col-span-2">{(id) => <Input id={id} value={c.address} onChange={(e) => set('address', e.target.value)} />}</Field>
        <Field label="Zona / sector">{(id) => <Input id={id} value={c.zone} onChange={(e) => set('zone', e.target.value)} />}</Field>
        <Field label="Email (opcional)">{(id) => <Input id={id} type="email" value={c.email ?? ''} onChange={(e) => set('email', e.target.value)} />}</Field>
        <Field label="Mantenimiento preventivo">
          {(id) => (
            <Select id={id} value={c.maintenanceEveryMonths ?? 0} onChange={(e) => set('maintenanceEveryMonths', Number(e.target.value) || undefined)}>
              <option value={0}>Sin plan</option>
              {[1, 2, 3, 4, 6, 12].map((m) => (
                <option key={m} value={m}>
                  Cada {m} {m === 1 ? 'mes' : 'meses'}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Etiquetas" hint="Separadas por coma: vip, comercio…">{(id) => <Input id={id} value={tags} onChange={(e) => setTags(e.target.value)} />}</Field>
        <div className="md:col-span-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">Servicios</p>
          <ChipGroup value={c.services} onChange={(v) => set('services', v)} options={(Object.keys(AREA) as ServiceArea[]).map((a) => ({ value: a, label: AREA[a].label }))} />
        </div>
        <div className="md:col-span-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">Entorno</p>
          <ChipGroup value={c.environment} onChange={(v) => set('environment', v)} options={ENVIRONMENTS} />
        </div>
        <Field label="Notas" className="md:col-span-2">{(id) => <Textarea id={id} value={c.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />}</Field>
      </div>
    </Modal>
  )
}
