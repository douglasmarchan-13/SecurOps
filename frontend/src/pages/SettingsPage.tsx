import { useState } from 'react'
import { Building2, Cctv, DoorOpen, Download, RotateCcw, Save, Users, Zap } from 'lucide-react'
import type { FencePrices, FenceTier, Settings } from '@/types'
import { Button, Card, CardHeader, Field, Input, PageHeader } from '@/components/ui/primitives'
import { useStore } from '@/store/useStore'
import { TIERS } from '@/lib/fence'
import { toast } from '@/store/useToast'

const FENCE_LABELS: Record<keyof FencePrices, string> = {
  postIntermediate: 'Poste intermedio',
  postCorner: 'Poste esquinero',
  wirePerMeter: 'Alambre (m)',
  insulatorPass: 'Aislador de paso',
  insulatorCorner: 'Aislador esquina',
  tensioner: 'Tensor',
  spring: 'Resorte',
  hvCablePerMeter: 'Cable AT (m)',
  groundRod: 'Jabalina tierra',
  sign: 'Aviso',
  energizer: 'Energizador',
  battery: 'Batería',
  siren: 'Sirena',
  surgeProtector: 'DPS',
  voltageProtector: 'Protector voltaje',
  smartModule: 'Módulo Wi‑Fi',
}

const Money = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
  <Input aria-label={label} type="number" min={0} step="0.01" inputMode="decimal" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-9 text-right font-mono" />
)

export default function SettingsPage() {
  const { settings, updateSettings, resetDemo } = useStore()
  const [s, setS] = useState<Settings>(settings)
  const dirty = JSON.stringify(s) !== JSON.stringify(settings)
  const patch = (fn: (d: Settings) => void) =>
    setS((prev) => {
      const next = structuredClone(prev)
      fn(next)
      return next
    })

  const exportData = () => {
    const { clients, logs, appointments, quotes, campaigns } = useStore.getState()
    const blob = new Blob([JSON.stringify({ settings, clients, logs, appointments, quotes, campaigns }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `securops-respaldo-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Ajustes y precios"
        description="Catálogo de precios usado por las calculadoras. Los cambios aplican a nuevos presupuestos."
        actions={
          <>
            <Button icon={<Download className="size-4" />} onClick={exportData}>
              Respaldo
            </Button>
            <Button variant="primary" disabled={!dirty} icon={<Save className="size-4" />} onClick={() => { updateSettings(s); toast('Ajustes guardados') }}>
              Guardar cambios
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader icon={<Building2 className="size-5" />} title="Empresa" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Nombre comercial">{(id) => <Input id={id} value={s.company.name} onChange={(e) => patch((d) => void (d.company.name = e.target.value))} />}</Field>
              <Field label="Teléfono de contacto">{(id) => <Input id={id} value={s.company.phone} onChange={(e) => patch((d) => void (d.company.phone = e.target.value))} />}</Field>
              <Field label="Moneda (ISO)">{(id) => <Input id={id} value={s.company.currency} maxLength={3} onChange={(e) => patch((d) => void (d.company.currency = e.target.value.toUpperCase()))} />}</Field>
              <Field label="Impuesto %">{(id) => <Input id={id} type="number" min={0} value={s.company.taxPct} onChange={(e) => patch((d) => void (d.company.taxPct = Number(e.target.value)))} />}</Field>
            </div>
          </Card>
          <Card>
            <CardHeader icon={<Users className="size-5" />} title="Equipo técnico" subtitle="Separados por coma" />
            <div className="grid gap-4 p-5">
              <Field label="Técnicos y ayudantes">{(id) => <Input id={id} value={s.technicians.join(', ')} onChange={(e) => patch((d) => void (d.technicians = e.target.value.split(',').map((t) => t.trim()).filter(Boolean)))} />}</Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mano de obra cerco / m">{(id) => <Input id={id} type="number" value={s.fence.laborPerMeter} onChange={(e) => patch((d) => void (d.fence.laborPerMeter = Number(e.target.value)))} />}</Field>
                <Field label="Mano de obra / cámara">{(id) => <Input id={id} type="number" value={s.cctv.laborPerCamera} onChange={(e) => patch((d) => void (d.cctv.laborPerCamera = Number(e.target.value)))} />}</Field>
              </div>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader icon={<Zap className="size-5" />} title="Precios de cercos eléctricos" subtitle="Precio unitario por calidad de material" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500">
                  <th className="px-5 py-3 font-medium">Material</th>
                  {(Object.keys(TIERS) as FenceTier[]).map((t) => (
                    <th key={t} className="px-3 py-3 text-right font-semibold" style={{ color: TIERS[t].color }}>
                      {TIERS[t].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(FENCE_LABELS) as (keyof FencePrices)[]).map((k) => (
                  <tr key={k} className="border-t border-white/[0.04]">
                    <td className="px-5 py-2 text-ink-300">{FENCE_LABELS[k]}</td>
                    {(Object.keys(TIERS) as FenceTier[]).map((t) => (
                      <td key={t} className="px-3 py-2">
                        <Money label={`${FENCE_LABELS[k]} ${t}`} value={s.fence.prices[t][k]} onChange={(v) => patch((d) => void (d.fence.prices[t][k] = v))} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader icon={<Cctv className="size-5" />} title="Precios CCTV" />
            <div className="grid grid-cols-[1fr_repeat(3,90px)] items-center gap-2 p-5 text-sm">
              <span />
              {(['2MP', '4MP', '8MP'] as const).map((r) => (
                <span key={r} className="text-right text-[11px] uppercase text-ink-500">
                  {r}
                </span>
              ))}
              {(['bullet', 'domo', 'ptz'] as const).map((f) => (
                <div key={f} className="contents">
                  <span className="capitalize text-ink-300">{f === 'bullet' ? 'Bala' : f.toUpperCase() === 'PTZ' ? 'PTZ' : 'Domo'}</span>
                  {(['2MP', '4MP', '8MP'] as const).map((r) => (
                    <Money key={r} label={`${f} ${r}`} value={s.cctv.camera[f][r]} onChange={(v) => patch((d) => void (d.cctv.camera[f][r] = v))} />
                  ))}
                </div>
              ))}
              {([4, 8, 16, 32] as const).map((ch) => (
                <div key={ch} className="contents">
                  <span className="col-span-3 text-ink-300">Grabador {ch} canales</span>
                  <Money label={`Grabador ${ch}`} value={s.cctv.recorder[ch]} onChange={(v) => patch((d) => void (d.cctv.recorder[ch] = v))} />
                </div>
              ))}
              <span className="col-span-3 text-ink-300">Disco por TB</span>
              <Money label="Disco" value={s.cctv.diskPerTB} onChange={(v) => patch((d) => void (d.cctv.diskPerTB = v))} />
            </div>
          </Card>
          <Card>
            <CardHeader icon={<DoorOpen className="size-5" />} title="Precios portones" />
            <div className="grid grid-cols-[1fr_90px] items-center gap-2 p-5 text-sm">
              {(['corredizo', 'batiente', 'levadizo'] as const).flatMap((k) =>
                s.gate.motors[k].map((m, i) => (
                  <div key={`${k}${i}`} className="contents">
                    <span className="capitalize text-ink-300">
                      Motor {k} ≤ {m.maxKg} kg
                    </span>
                    <Money label={`Motor ${k} ${m.maxKg}`} value={m.price} onChange={(v) => patch((d) => void (d.gate.motors[k][i].price = v))} />
                  </div>
                )),
              )}
              {(
                [
                  ['rackPerMeter', 'Cremallera (m)'],
                  ['remote', 'Control remoto'],
                  ['photocell', 'Fotoceldas (par)'],
                  ['lamp', 'Lámpara'],
                  ['backupBattery', 'Batería respaldo'],
                  ['anchorBase', 'Base / anclaje'],
                ] as const
              ).map(([k, label]) => (
                <div key={k} className="contents">
                  <span className="text-ink-300">{label}</span>
                  <Money label={label} value={s.gate[k]} onChange={(v) => patch((d) => void (d.gate[k] = v))} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="flex flex-wrap items-center justify-between gap-4 border-red-400/15 p-5">
          <div>
            <p className="font-semibold">Restaurar datos de demostración</p>
            <p className="text-sm text-ink-400">Reemplaza clientes, bitácoras y presupuestos locales por los datos de ejemplo.</p>
          </div>
          <Button
            variant="danger"
            icon={<RotateCcw className="size-4" />}
            onClick={() => {
              if (confirm('¿Restaurar los datos de demostración? Se perderán los datos locales.')) {
                resetDemo()
                setS(useStore.getState().settings)
                toast('Datos restaurados', undefined, 'info')
              }
            }}
          >
            Restaurar
          </Button>
        </Card>
      </div>
    </>
  )
}
