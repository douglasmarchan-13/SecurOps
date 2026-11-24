import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Megaphone, Plus, Rocket, Send, Sparkles, Trash2, Users } from 'lucide-react'
import type { Campaign, ServiceArea } from '@/types'
import { Badge, Button, Card, ChipGroup, EmptyState, Field, Input, PageHeader, Segmented, Stepper, Textarea } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { PhonePreview } from '@/features/campaigns/PhonePreview'
import { AREA } from '@/lib/labels'
import { useStore } from '@/store/useStore'
import { cn, fmtDateTime, nowIso, toLocalInput, uid } from '@/lib/utils'
import { fillTemplate, waLink } from '@/lib/whatsapp'
import { matchesAudience } from '@/lib/domain'
import { toast } from '@/store/useToast'

const KIND = { descuento: { label: 'Descuento', tone: 'volt' }, promocion: { label: 'Promoción', tone: 'arc' }, oferta: { label: 'Oferta', tone: 'violet' } } as const
const STATUS = { borrador: 'neutral', programada: 'amber', enviando: 'arc', enviada: 'green' } as const

const TEMPLATES = [
  { name: 'Mantenimiento preventivo', kind: 'promocion' as const, msg: 'Hola {nombre} 👋\nEn *{empresa}* este mes tenemos *revisión preventiva* de tu sistema con *{descuento}% de descuento*. Responde este mensaje para agendar. ⚡' },
  { name: 'Upgrade a Tipo A', kind: 'oferta' as const, msg: 'Hola {nombre}, ¿vives cerca del mar? 🌊 El salitre acorta la vida del cerco. Migra a *Cerco Tipo A* en acero inoxidable con *{descuento}% OFF* en materiales. _Cupos limitados._' },
  { name: 'Combo cámaras', kind: 'descuento' as const, msg: '📹 {nombre}, protege tu propiedad 24/7: *Kit 4 cámaras 4MP + grabador* con *{descuento}% de descuento* e instalación incluida. Escríbenos para tu presupuesto sin compromiso.' },
]

const emptyCampaign = (): Campaign => ({ id: uid(), name: '', kind: 'promocion', message: TEMPLATES[0].msg, products: [], discountPct: 15, audience: { areas: [], zones: [], tags: [] }, status: 'borrador', recipients: 0, createdAt: nowIso() })

export default function CampaignsPage() {
  const { campaigns, upsert, remove } = useStore()
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [manual, setManual] = useState<Campaign | null>(null)

  // Simula el despacho de campañas programadas mientras la app está abierta (el backend lo hará en producción)
  useEffect(() => {
    const tick = () => {
      const now = nowIso()
      useStore
        .getState()
        .campaigns.filter((c) => c.status === 'programada' && c.scheduledAt && c.scheduledAt <= now)
        .forEach((c) => {
          upsert('campaigns', { ...c, status: 'enviada', sentAt: now })
          toast(`Campaña “${c.name}” enviada`, `${c.recipients} destinatarios`)
        })
    }
    tick()
    const i = setInterval(tick, 30_000)
    return () => clearInterval(i)
  }, [upsert])

  const sorted = [...campaigns].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <>
      <PageHeader
        eyebrow="Comercial · WhatsApp"
        title="Campañas"
        description="Descuentos, promociones y ofertas segmentadas que llegan directo al WhatsApp de tus clientes, ahora o en la fecha que elijas."
        actions={
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setEditing(emptyCampaign())}>
            Nueva campaña
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState icon={<Megaphone className="size-6" />} title="Sin campañas" description="Crea tu primera campaña con una plantilla." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c) => (
            <Card key={c.id} className="flex flex-col p-5">
              <div className="flex items-center gap-2">
                <Badge tone={KIND[c.kind].tone}>{KIND[c.kind].label}</Badge>
                <Badge tone={STATUS[c.status]}>{c.status}</Badge>
                {c.discountPct ? <span className="ml-auto font-display text-2xl font-bold text-volt-400">-{c.discountPct}%</span> : null}
              </div>
              <h3 className="mt-3 text-lg font-semibold">{c.name}</h3>
              <p className="mt-1 line-clamp-3 flex-1 text-sm text-ink-400">{c.message}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" /> {c.recipients}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="size-3.5" /> {c.sentAt ? `Enviada ${fmtDateTime(c.sentAt)}` : c.scheduledAt ? fmtDateTime(c.scheduledAt) : 'Sin programar'}
                </span>
              </div>
              <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">
                <Button size="sm" onClick={() => setEditing(c)}>
                  Editar
                </Button>
                <Button size="sm" variant="whatsapp" icon={<Send className="size-3.5" />} onClick={() => setManual(c)}>
                  Envío manual
                </Button>
                <Button size="sm" variant="ghost" className="ml-auto" aria-label="Eliminar" onClick={() => remove('campaigns', c.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && <CampaignBuilder initial={editing} onClose={() => setEditing(null)} />}
      {manual && <ManualSend campaign={manual} onClose={() => setManual(null)} />}
    </>
  )
}

function CampaignBuilder({ initial, onClose }: { initial: Campaign; onClose: () => void }) {
  const { clients, settings, upsert } = useStore()
  const [c, setC] = useState(initial)
  const [when, setWhen] = useState<'now' | 'later'>(initial.scheduledAt ? 'later' : 'now')
  const [sending, setSending] = useState<number | null>(null)
  const set = <K extends keyof Campaign>(k: K, v: Campaign[K]) => setC((p) => ({ ...p, [k]: v }))
  const setAud = (p: Partial<Campaign['audience']>) => setC((x) => ({ ...x, audience: { ...x.audience, ...p } }))

  const zones = useMemo(() => Array.from(new Set(clients.map((x) => x.zone).filter(Boolean))), [clients])
  const tags = useMemo(() => Array.from(new Set(clients.flatMap((x) => x.tags))), [clients])
  const audience = clients.filter((x) => matchesAudience(x, c.audience))
  const vars = (name: string) => ({ nombre: name, empresa: settings.company.name, descuento: String(c.discountPct ?? 0) })
  const preview = fillTemplate(c.message, vars(audience[0]?.name.split(' ')[0] ?? 'Cliente'))

  const valid = c.name.trim() && c.message.trim() && audience.length > 0

  const launch = async () => {
    if (!valid) {
      toast('Completa la campaña', 'Nombre, mensaje y al menos un destinatario', 'error')
      return
    }
    const base = { ...c, recipients: audience.length }
    if (when === 'later') {
      if (!c.scheduledAt || c.scheduledAt <= nowIso()) {
        toast('Elige una fecha futura', undefined, 'error')
        return
      }
      upsert('campaigns', { ...base, status: 'programada' })
      toast('Campaña programada', fmtDateTime(c.scheduledAt))
      onClose()
      return
    }
    // Envío inmediato: el backend (WhatsApp Business API) procesará la cola. Aquí mostramos el progreso.
    upsert('campaigns', { ...base, status: 'enviando', scheduledAt: undefined })
    for (let i = 1; i <= audience.length; i++) {
      setSending(i)
      await new Promise((r) => setTimeout(r, 350))
    }
    upsert('campaigns', { ...base, status: 'enviada', sentAt: nowIso(), scheduledAt: undefined })
    toast('¡Campaña enviada!', `${audience.length} mensajes en cola de WhatsApp`)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={initial.name ? 'Editar campaña' : 'Nueva campaña'}
      subtitle="Variables disponibles: {nombre}, {empresa}, {descuento}"
      footer={
        <>
          <Button variant="ghost" onClick={() => { upsert('campaigns', { ...c, recipients: audience.length, status: 'borrador' }); toast('Borrador guardado'); onClose() }}>
            Guardar borrador
          </Button>
          <Button variant="primary" disabled={sending !== null} icon={when === 'now' ? <Rocket className="size-4" /> : <CalendarClock className="size-4" />} onClick={launch}>
            {sending !== null ? `Enviando ${sending}/${audience.length}…` : when === 'now' ? `Enviar ahora a ${audience.length}` : 'Programar envío'}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
        <div className="space-y-5">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-ink-400">
              <Sparkles className="size-3.5 text-volt-400" /> Plantillas rápidas
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.name} type="button" onClick={() => setC((p) => ({ ...p, message: t.msg, kind: t.kind, name: p.name || t.name }))} className="rounded-xl border border-white/8 bg-ink-900/50 px-3 py-2 text-xs text-ink-300 transition hover:border-volt-400/40 hover:text-volt-300">
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Field label="Nombre de la campaña">{(id) => <Input id={id} value={c.name} onChange={(e) => set('name', e.target.value)} />}</Field>
            <Field label="Tipo">{() => <Segmented value={c.kind} onChange={(v) => set('kind', v)} options={(Object.keys(KIND) as Campaign['kind'][]).map((k) => ({ value: k, label: KIND[k].label }))} />}</Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
            <Field label="Artículos / servicios" hint="Separados por coma">
              {(id) => <Input id={id} value={c.products.join(', ')} onChange={(e) => set('products', e.target.value.split(',').map((x) => x.trimStart()))} placeholder="Energizador, batería, kit CCTV" />}
            </Field>
            <Field label="Descuento">{(id) => <Stepper id={id} value={c.discountPct ?? 0} onChange={(v) => set('discountPct', v)} max={90} step={5} suffix="%" />}</Field>
          </div>
          <Field label="Mensaje">{(id) => <Textarea id={id} rows={6} value={c.message} onChange={(e) => set('message', e.target.value)} />}</Field>

          <div className="space-y-3 rounded-2xl border border-white/5 bg-ink-900/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Audiencia</p>
              <Badge tone="volt">
                <Users className="size-3" /> {audience.length} de {clients.length} clientes
              </Badge>
            </div>
            <p className="text-xs text-ink-500">Sin filtros = todos los clientes.</p>
            <ChipGroup value={c.audience.areas} onChange={(v: ServiceArea[]) => setAud({ areas: v })} options={(Object.keys(AREA) as ServiceArea[]).map((a) => ({ value: a, label: AREA[a].label }))} />
            {zones.length > 0 && <ChipGroup value={c.audience.zones} onChange={(v) => setAud({ zones: v })} options={zones.map((z) => ({ value: z, label: `📍 ${z}` }))} />}
            {tags.length > 0 && <ChipGroup value={c.audience.tags} onChange={(v) => setAud({ tags: v })} options={tags.map((t) => ({ value: t, label: `#${t}` }))} />}
          </div>

          <div className="space-y-3 rounded-2xl border border-white/5 bg-ink-900/40 p-4">
            <p className="text-sm font-semibold">Envío</p>
            <Segmented value={when} onChange={setWhen} options={[{ value: 'now', label: 'Enviar ahora' }, { value: 'later', label: 'Programar' }]} />
            {when === 'later' && (
              <Input type="datetime-local" aria-label="Fecha de envío" value={c.scheduledAt ? toLocalInput(c.scheduledAt) : ''} min={toLocalInput(nowIso())} onChange={(e) => set('scheduledAt', e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
            )}
            {sending !== null && (
              <div className="h-2 overflow-hidden rounded-full bg-ink-700">
                <div className="h-full bg-gradient-to-r from-volt-400 to-arc-400 transition-all" style={{ width: `${(sending / audience.length) * 100}%` }} />
              </div>
            )}
          </div>
        </div>
        <div className="lg:sticky lg:top-0">
          <PhonePreview company={settings.company.name} text={preview} />
          <p className="mt-3 text-center text-xs text-ink-500">Vista previa para {audience[0]?.name ?? 'un cliente'}</p>
        </div>
      </div>
    </Modal>
  )
}

/** Envío uno-a-uno por wa.me: funciona hoy sin backend ni API de WhatsApp Business. */
function ManualSend({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const { clients, settings } = useStore()
  const [done, setDone] = useState<string[]>([])
  const list = clients.filter((c) => matchesAudience(c, campaign.audience))
  return (
    <Modal open onClose={onClose} title={`Envío manual · ${campaign.name}`} subtitle={`${done.length}/${list.length} enviados`}>
      <ul className="space-y-2">
        {list.map((cl) => {
          const sent = done.includes(cl.id)
          return (
            <li key={cl.id} className={cn('flex items-center gap-3 rounded-xl border border-white/5 p-3', sent && 'opacity-50')}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{cl.name}</p>
                <p className="text-xs text-ink-500">+{cl.phone}</p>
              </div>
              <a
                href={waLink(cl.phone, fillTemplate(campaign.message, { nombre: cl.name.split(' ')[0], empresa: settings.company.name, descuento: String(campaign.discountPct ?? 0) }))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDone((d) => [...d, cl.id])}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-whatsapp px-3 text-xs font-semibold text-ink-950"
              >
                <Send className="size-3.5" /> {sent ? 'Reenviar' : 'Enviar'}
              </a>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
