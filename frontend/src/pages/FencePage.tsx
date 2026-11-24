import { useMemo, useState } from 'react'
import { Anchor, Cable, CircleDot, Info, Ruler, ShieldCheck, Signpost, Spline, Zap } from 'lucide-react'
import { Card, CardHeader, Field, PageHeader, Stepper, Switch } from '@/components/ui/primitives'
import { QuotePanel } from '@/components/QuotePanel'
import { FenceVisualizer } from '@/features/fence/FenceVisualizer'
import { TierSelector } from '@/features/fence/TierSelector'
import { calcFence, defaultFenceInput, fenceLines, TIER_C_NOTE, TIERS, type FenceInput } from '@/lib/fence'
import { useStore } from '@/store/useStore'
import { num } from '@/lib/utils'

export default function FencePage() {
  const settings = useStore((s) => s.settings)
  const [input, setInput] = useState<FenceInput>(defaultFenceInput)
  const set = <K extends keyof FenceInput>(k: K) => (v: FenceInput[K]) => setInput((p) => ({ ...p, [k]: v }))

  const result = useMemo(() => calcFence(input), [input])
  const lines = useMemo(() => fenceLines(result, settings.fence.prices[input.tier], input.tier), [result, settings, input.tier])
  const labor = input.meters * settings.fence.laborPerMeter
  const notes = useMemo(() => (input.tier === 'C' ? [TIER_C_NOTE] : []), [input.tier])
  const tier = TIERS[input.tier]

  const kpis = [
    { icon: Spline, label: 'Postes intermedios', value: result.postsIntermediate, sub: `1 c/ ${input.spacing} m` },
    { icon: Anchor, label: 'Esquineros / refuerzo', value: result.postsCorner, sub: `${result.tramos} tramos` },
    { icon: Zap, label: 'Alambre', value: `${num(result.wireMeters)} m`, sub: `+${input.wasteMarginPct}% amarres` },
    { icon: CircleDot, label: 'Aisladores de paso', value: result.insulatorsPass, sub: 'intermedios × hilos' },
    { icon: CircleDot, label: 'Aisladores esquina', value: result.insulatorsCorner, sub: 'tramos × hilos × 2' },
    { icon: Cable, label: 'Tensores / resortes', value: `${result.tensioners} / ${result.springs}`, sub: 'por línea de tensión' },
    { icon: Cable, label: 'Cable alta tensión', value: `${result.hvCableMeters} m`, sub: `${result.groundRods} jabalinas de tierra` },
    { icon: Signpost, label: 'Avisos', value: result.signs, sub: '1 cada 10 m' },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Soluciones · Cercos eléctricos"
        title={
          <>
            Calculadora de <span className="text-gradient">cerco lineal</span>
          </>
        }
        description="Ingresa los metros, hilos y esquinas: SecurOps calcula materiales, costos y genera el presupuesto listo para WhatsApp."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-6">
          <TierSelector value={input.tier} onChange={set('tier')} />

          <Card>
            <CardHeader icon={<Ruler className="size-5" />} title="Parámetros del perímetro" subtitle="Usa los botones +/– en campo" />
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Metros lineales">{(id) => <Stepper id={id} value={input.meters} onChange={set('meters')} step={5} suffix="m" />}</Field>
              <Field label="Cantidad de hilos">{(id) => <Stepper id={id} value={input.wires} onChange={set('wires')} min={1} max={12} />}</Field>
              <Field label="Esquinas">{(id) => <Stepper id={id} value={input.corners} onChange={set('corners')} max={60} />}</Field>
              <Field label="Separación postes" hint="2.5 – 3 m recomendado">
                {(id) => <Stepper id={id} value={input.spacing} onChange={set('spacing')} min={1.5} max={4} step={0.25} suffix="m" />}
              </Field>
              <Field label="Cable alta tensión">{(id) => <Stepper id={id} value={input.hvCableMeters} onChange={set('hvCableMeters')} step={5} suffix="m" />}</Field>
              <Field label="Jabalinas de tierra">{(id) => <Stepper id={id} value={input.groundRods} onChange={set('groundRods')} min={1} max={20} />}</Field>
              <Field label="Margen alambre">{(id) => <Stepper id={id} value={input.wasteMarginPct} onChange={set('wasteMarginPct')} max={30} suffix="%" />}</Field>
              <div className="flex items-end">
                <Switch checked={input.closedPerimeter} onChange={set('closedPerimeter')} label="Perímetro cerrado" />
              </div>
            </div>
          </Card>

          <FenceVisualizer input={input} result={result} />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-2xl border border-white/5 bg-ink-850/50 p-4">
                <k.icon className="size-4" style={{ color: tier.color }} />
                <div className="mt-2 font-display text-2xl font-bold">{k.value}</div>
                <div className="text-xs font-medium text-ink-300">{k.label}</div>
                <div className="text-[11px] text-ink-500">{k.sub}</div>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader icon={<ShieldCheck className="size-5" />} title={`Especificación ${tier.name}`} subtitle={tier.tagline} />
            <dl className="grid gap-x-8 gap-y-4 p-5 text-sm md:grid-cols-2">
              {[
                ['Uso recomendado', tier.use],
                ['Postes / tubería', tier.posts],
                ['Hilo / alambre', tier.wire],
                ['Aisladores y tensores', tier.insulators],
                ['Energizador y electrónica', tier.electronics],
                ['Garantía y vida útil', `${tier.warranty} (${tier.warrantyYears} año${tier.warrantyYears > 1 ? 's' : ''} referencial)`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wider text-ink-500">{k}</dt>
                  <dd className="mt-1 text-ink-200">{v}</dd>
                </div>
              ))}
            </dl>
            {input.tier === 'C' && (
              <div className="mx-5 mb-5 flex gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200">
                <Info className="mt-0.5 size-5 shrink-0" />
                <p>{TIER_C_NOTE}</p>
              </div>
            )}
          </Card>
        </div>

        <QuotePanel
          area="cerco"
          tier={input.tier}
          title={`Cerco eléctrico ${input.meters} m · ${input.wires} hilos · ${tier.name}`}
          lines={lines}
          labor={labor}
          notes={notes}
          accent={tier.color}
        />
      </div>
    </>
  )
}
