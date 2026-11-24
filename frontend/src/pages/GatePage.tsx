import { useMemo, useState, type CSSProperties } from 'react'
import { AlertTriangle, DoorOpen, Gauge, Weight } from 'lucide-react'
import { Badge, Card, CardHeader, Field, PageHeader, Segmented, Stepper, Switch } from '@/components/ui/primitives'
import { QuotePanel } from '@/components/QuotePanel'
import { calcGate, GATE_INFO, gateLines, type GateInput, type GateKind } from '@/lib/gate'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

function Leaf({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={cn('absolute inset-y-0 flex justify-around rounded-md border-2 border-violet-300/70 bg-violet-400/5 transition-all duration-1000 ease-in-out', className)} style={style}>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="w-[3px] bg-violet-300/50" />
      ))}
    </div>
  )
}

function GatePreview({ kind, leaves, open }: { kind: GateKind; leaves: 1 | 2; open: boolean }) {
  return (
    <div className="grid-bg relative h-56 overflow-hidden rounded-2xl border border-white/5 bg-ink-950/60 [perspective:800px]">
      <div className="absolute inset-x-8 bottom-6 top-8">
        {/* pilares */}
        <div className="absolute -left-3 bottom-0 top-0 w-3 rounded bg-ink-600" />
        <div className="absolute -right-3 bottom-0 top-0 w-3 rounded bg-ink-600" />
        <div className="absolute inset-x-0 -bottom-2 h-1 rounded bg-ink-600" />
        {kind === 'corredizo' && <Leaf className="w-full" style={{ left: 0, transform: open ? 'translateX(85%)' : 'none' }} />}
        {kind === 'levadizo' && <Leaf className="w-full origin-top" style={{ left: 0, transform: open ? 'rotateX(80deg) translateY(-30%)' : 'none' }} />}
        {kind === 'batiente' && leaves === 1 && <Leaf className="w-full origin-left" style={{ left: 0, transform: open ? 'rotateY(-75deg)' : 'none' }} />}
        {kind === 'batiente' && leaves === 2 && (
          <>
            <Leaf className="w-1/2 origin-left" style={{ left: 0, transform: open ? 'rotateY(-75deg)' : 'none' }} />
            <Leaf className="w-1/2 origin-right" style={{ right: 0, transform: open ? 'rotateY(75deg)' : 'none' }} />
          </>
        )}
      </div>
      <div className="absolute left-4 top-3 font-mono text-[10px] uppercase tracking-widest text-ink-400">Simulación · {GATE_INFO[kind].name}</div>
    </div>
  )
}

export default function GatePage() {
  const settings = useStore((s) => s.settings)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState<GateInput>({ kind: 'corredizo', leaves: 1, weightKg: 450, widthM: 5, cyclesPerDay: 20, remotes: 3, photocells: true, lamp: true, backup: false })
  const set = <K extends keyof GateInput>(k: K) => (v: GateInput[K]) => setInput((p) => ({ ...p, [k]: v }))

  const r = useMemo(() => calcGate(input, settings.gate), [input, settings.gate])
  const lines = useMemo(() => gateLines(input, r, settings.gate), [input, r, settings.gate])
  const notes = useMemo(() => (!input.photocells ? ['Recomendación: instalar fotoceldas de seguridad para evitar accidentes con personas o vehículos.'] : []), [input.photocells])

  return (
    <>
      <PageHeader
        eyebrow="Soluciones · Automatización"
        title={
          <>
            Motores y <span className="text-gradient">portones eléctricos</span>
          </>
        }
        description="Dimensiona el motor según peso, tipo de portón y uso diario; agrega accesorios de seguridad y genera la cotización."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(GATE_INFO) as GateKind[]).map((k) => (
              <button
                key={k}
                onClick={() => set('kind')(k)}
                aria-pressed={input.kind === k}
                className={cn('rounded-2xl border p-4 text-left transition', input.kind === k ? 'border-violet-400/60 bg-violet-400/10 shadow-[0_10px_40px_-18px_var(--color-violet-400)]' : 'border-white/5 bg-ink-850/50 hover:border-white/15')}
              >
                <DoorOpen className={cn('size-5', input.kind === k ? 'text-violet-300' : 'text-ink-500')} />
                <p className="mt-2 font-display font-semibold">{GATE_INFO[k].name}</p>
                <p className="text-xs text-ink-400">{GATE_INFO[k].desc}</p>
              </button>
            ))}
          </div>

          <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onClick={() => setOpen((o) => !o)} className="cursor-pointer">
            <GatePreview kind={input.kind} leaves={input.leaves} open={open} />
          </div>

          <Card>
            <CardHeader icon={<Gauge className="size-5" />} title="Datos del portón" />
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Peso total">{(id) => <Stepper id={id} value={input.weightKg} onChange={set('weightKg')} step={25} max={3000} suffix="kg" />}</Field>
              <Field label="Ancho de paso">{(id) => <Stepper id={id} value={input.widthM} onChange={set('widthM')} step={0.5} max={15} suffix="m" />}</Field>
              <Field label="Ciclos por día" hint=">40 = uso intensivo">{(id) => <Stepper id={id} value={input.cyclesPerDay} onChange={set('cyclesPerDay')} step={5} max={500} />}</Field>
              <Field label="Controles">{(id) => <Stepper id={id} value={input.remotes} onChange={set('remotes')} max={50} />}</Field>
              {input.kind === 'batiente' && (
                <Field label="Hojas">{() => <Segmented value={input.leaves} onChange={set('leaves')} options={[{ value: 1, label: '1 hoja' }, { value: 2, label: '2 hojas' }]} className="w-full" />}</Field>
              )}
            </div>
            <div className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
              <Switch checked={input.photocells} onChange={set('photocells')} label="Fotoceldas" />
              <Switch checked={input.lamp} onChange={set('lamp')} label="Lámpara destellante" />
              <Switch checked={input.backup} onChange={set('backup')} label="Batería respaldo" />
            </div>
          </Card>

          <Card glow className="p-5">
            <div className="flex flex-wrap items-center gap-6">
              <div className="grid size-16 place-items-center rounded-2xl bg-violet-400/15 text-violet-300">
                <Weight className="size-7" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-ink-400">Motor recomendado</p>
                <p className="font-display text-2xl font-bold">
                  {r.motorsQty > 1 && `${r.motorsQty} × `}Motor {GATE_INFO[input.kind].name.toLowerCase()} hasta {r.motor.maxKg} kg
                </p>
                <p className="text-sm text-ink-400">
                  Capacidad requerida: {r.requiredKg} kg {input.kind === 'batiente' && input.leaves === 2 && '(por hoja)'} · margen 30%{r.intensive && ' + 20% uso intensivo'}
                  {r.rackMeters > 0 && ` · ${r.rackMeters} m de cremallera`}
                </p>
              </div>
              {r.overCapacity ? (
                <Badge tone="red">
                  <AlertTriangle className="size-3" /> Excede catálogo
                </Badge>
              ) : (
                <Badge tone="green">Dentro de capacidad</Badge>
              )}
            </div>
          </Card>
        </div>

        <QuotePanel area="porton" title={`Automatización portón ${GATE_INFO[input.kind].name.toLowerCase()} ${input.widthM} m · ${input.weightKg} kg`} lines={lines} labor={settings.gate.labor[input.kind]} notes={notes} accent="var(--color-violet-400)" />
      </div>
    </>
  )
}
