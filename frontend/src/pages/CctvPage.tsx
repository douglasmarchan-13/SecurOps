import { useMemo, useState, type ReactNode } from 'react'
import { Cctv, HardDrive, Plus, Server, Trash2, Video } from 'lucide-react'
import { Button, Card, CardHeader, Field, Input, PageHeader, Segmented, Stepper } from '@/components/ui/primitives'
import { QuotePanel } from '@/components/QuotePanel'
import { calcCctv, cctvLines, type CamForm, type CamGroup, type CamRes, type CctvInput } from '@/lib/cctv'
import { useStore } from '@/store/useStore'
import { cn, num, uid } from '@/lib/utils'

const FORMS: { value: CamForm; label: string }[] = [
  { value: 'bullet', label: 'Bala' },
  { value: 'domo', label: 'Domo' },
  { value: 'ptz', label: 'PTZ' },
]
const RES: { value: CamRes; label: string }[] = [
  { value: '2MP', label: '2MP' },
  { value: '4MP', label: '4MP' },
  { value: '8MP', label: '4K' },
]

export default function CctvPage() {
  const settings = useStore((s) => s.settings)
  const [input, setInput] = useState<CctvInput>({
    groups: [
      { id: uid(), form: 'bullet', res: '4MP', qty: 4, label: 'Perímetro exterior' },
      { id: uid(), form: 'domo', res: '2MP', qty: 2, label: 'Interior / recepción' },
    ],
    retentionDays: 15,
    avgCableMeters: 25,
    hoursPerDay: 24,
  })

  const r = useMemo(() => calcCctv(input), [input])
  const lines = useMemo(() => cctvLines(input, r, settings.cctv), [input, r, settings.cctv])
  const labor = r.cameras * settings.cctv.laborPerCamera

  const patch = (id: string, p: Partial<CamGroup>) => setInput((s) => ({ ...s, groups: s.groups.map((g) => (g.id === id ? { ...g, ...p } : g)) }))

  return (
    <>
      <PageHeader
        eyebrow="Soluciones · Videovigilancia"
        title={
          <>
            Configurador <span className="text-gradient">CCTV</span>
          </>
        }
        description="Arma el sistema por zonas: SecurOps dimensiona grabador, almacenamiento según días de retención, cableado y accesorios."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              icon={<Video className="size-5" />}
              title="Cámaras por zona"
              subtitle={`${r.cameras} cámaras en ${input.groups.length} zonas`}
              action={
                <Button size="sm" variant="primary" icon={<Plus className="size-4" />} onClick={() => setInput((s) => ({ ...s, groups: [...s.groups, { id: uid(), form: 'bullet', res: '2MP', qty: 1, label: '' }] }))}>
                  Zona
                </Button>
              }
            />
            <div className="divide-y divide-white/5">
              {input.groups.map((g) => (
                <div key={g.id} className="grid items-end gap-3 p-5 md:grid-cols-[1fr_auto_auto_150px_auto]">
                  <Field label="Zona / ubicación">{(id) => <Input id={id} value={g.label} placeholder="Ej. Estacionamiento" onChange={(e) => patch(g.id, { label: e.target.value })} />}</Field>
                  <Field label="Tipo">{() => <Segmented value={g.form} onChange={(v) => patch(g.id, { form: v })} options={FORMS} />}</Field>
                  <Field label="Resolución">{() => <Segmented value={g.res} onChange={(v) => patch(g.id, { res: v })} options={RES} />}</Field>
                  <Field label="Cantidad">{(id) => <Stepper id={id} value={g.qty} onChange={(v) => patch(g.id, { qty: v })} min={0} max={64} />}</Field>
                  <Button variant="ghost" size="icon" aria-label="Eliminar zona" onClick={() => setInput((s) => ({ ...s, groups: s.groups.filter((x) => x.id !== g.id) }))}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid gap-4 border-t border-white/5 p-5 sm:grid-cols-3">
              <Field label="Días de grabación">{(id) => <Stepper id={id} value={input.retentionDays} onChange={(v) => setInput((s) => ({ ...s, retentionDays: v }))} min={1} max={90} suffix="días" />}</Field>
              <Field label="Horas por día">{(id) => <Stepper id={id} value={input.hoursPerDay} onChange={(v) => setInput((s) => ({ ...s, hoursPerDay: v }))} min={1} max={24} suffix="h" />}</Field>
              <Field label="Cable promedio / cámara">{(id) => <Stepper id={id} value={input.avgCableMeters} onChange={(v) => setInput((s) => ({ ...s, avgCableMeters: v }))} step={5} suffix="m" />}</Field>
            </div>
          </Card>

          {/* Visual del grabador */}
          <Card className="overflow-hidden">
            <div className="grid-bg relative p-6">
              <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-b from-ink-700 to-ink-850 p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="size-5 text-arc-400" />
                    <span className="font-display font-semibold">Grabador {r.channels}CH</span>
                    {r.recorders > 1 && <span className="text-xs text-ink-400">× {r.recorders}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-300">
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> REC
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {Array.from({ length: Math.min(32, r.channels) }).map((_, i) => (
                    <div key={i} className={cn('grid aspect-video place-items-center rounded-md border text-[9px] font-mono', i < r.cameras ? 'border-arc-400/40 bg-arc-400/15 text-arc-300' : 'border-white/5 bg-ink-950/60 text-ink-600')}>
                      {i < r.cameras ? <Cctv className="size-3" /> : i + 1}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <Metric icon={<HardDrive className="size-4" />} label="Almacenamiento" value={`${r.diskTB} TB`} sub={`${num(r.storageTB, 1)} TB requeridos`} />
                  <Metric label="Ancho de banda" value={`${num(r.totalMbps)} Mbps`} sub="H.265 estimado" />
                  <Metric label="Canales libres" value={String(Math.max(0, r.channels * r.recorders - r.cameras))} sub="para crecer" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <QuotePanel area="cctv" title={`Sistema CCTV ${r.cameras} cámaras · ${input.retentionDays} días de grabación`} lines={lines} labor={labor} accent="var(--color-arc-400)" />
      </div>
    </>
  )
}

function Metric({ icon, label, value, sub }: { icon?: ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-ink-950/50 p-3">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-ink-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-bold text-arc-300">{value}</div>
      <div className="text-[10px] text-ink-500">{sub}</div>
    </div>
  )
}
