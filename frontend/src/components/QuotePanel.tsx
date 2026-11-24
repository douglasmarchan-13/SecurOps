import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, FileCheck2, Receipt, Send } from 'lucide-react'
import type { FenceTier, Quote, QuoteLine, ServiceArea } from '@/types'
import { Button, Card, CardHeader, Field, Select, Stepper } from '@/components/ui/primitives'
import { useStore } from '@/store/useStore'
import { quoteTotals, nextQuoteNumber } from '@/lib/quote'
import { copyText, openWhatsApp, quoteToWhatsApp } from '@/lib/whatsapp'
import { cn, money, nowIso, num, uid } from '@/lib/utils'
import { toast } from '@/store/useToast'

interface Props {
  area: ServiceArea
  title: string
  tier?: FenceTier
  lines: QuoteLine[]
  labor: number
  notes?: string[]
  accent?: string
}

export function QuotePanel({ area, title, tier, lines, labor, notes = [], accent }: Props) {
  const { clients, settings, quotes, upsert } = useStore()
  const nav = useNavigate()
  const [clientId, setClientId] = useState('')
  const [discountPct, setDiscountPct] = useState(0)
  // Una vez guardado, los siguientes guardados actualizan el mismo presupuesto (no duplican).
  const [identity, setIdentity] = useState<{ id: string; number: string } | null>(null)
  const cur = settings.company.currency

  const draft: Quote = useMemo(
    () => ({
      id: identity?.id ?? uid(),
      number: identity?.number ?? nextQuoteNumber(quotes.length),
      clientId: clientId || undefined,
      area,
      title,
      tier,
      lines,
      labor,
      discountPct,
      notes,
      status: 'borrador',
      createdAt: nowIso(),
    }),
    [identity, quotes.length, clientId, area, title, tier, lines, labor, discountPct, notes],
  )
  const t = quoteTotals(draft, settings.company.taxPct)
  const client = clients.find((c) => c.id === clientId)
  const text = quoteToWhatsApp(draft, settings, client?.name)

  const save = (status: Quote['status'] = 'borrador') => {
    upsert('quotes', { ...draft, status })
    setIdentity({ id: draft.id, number: draft.number })
    toast(`Presupuesto ${draft.number} guardado`, status === 'enviado' ? 'Marcado como enviado' : 'Disponible en Presupuestos')
  }

  return (
    <Card className="overflow-hidden lg:sticky lg:top-24">
      <CardHeader icon={<Receipt className="size-5" />} title="Presupuesto en vivo" subtitle={draft.number} />
      <div className="max-h-[38vh] overflow-y-auto px-5 py-3">
        <table className="w-full text-sm">
          <tbody>
            {lines.filter((l) => l.qty > 0).map((l) => (
              <tr key={l.label} className="border-b border-white/[0.04] last:border-0">
                <td className="py-2 pr-2 text-ink-300">{l.label}</td>
                <td className="whitespace-nowrap py-2 pr-2 text-right font-mono text-xs text-ink-400">
                  {num(l.qty, l.qty % 1 ? 1 : 0)} {l.unit}
                </td>
                <td className="whitespace-nowrap py-2 text-right font-mono text-ink-200">{money(l.qty * l.unitPrice, cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-1.5 border-t border-white/5 bg-ink-950/30 px-5 py-4 text-sm">
        <Row k="Materiales" v={money(t.materials, cur)} />
        <Row k="Mano de obra" v={money(labor, cur)} />
        {discountPct > 0 && <Row k={`Descuento ${discountPct}%`} v={`- ${money(t.discount, cur)}`} className="text-emerald-300" />}
        {settings.company.taxPct > 0 && <Row k={`Impuesto ${settings.company.taxPct}%`} v={money(t.tax, cur)} />}
        <div className="flex items-end justify-between pt-2">
          <span className="text-xs uppercase tracking-wider text-ink-400">Total</span>
          <span className="font-display text-3xl font-bold" style={{ color: accent ?? 'var(--color-volt-400)' }}>
            {money(t.total, cur)}
          </span>
        </div>
      </div>
      {notes.length > 0 && (
        <div className="mx-5 mb-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-200">{notes.join(' ')}</div>
      )}
      <div className="grid gap-3 border-t border-white/5 px-5 py-4">
        <div className="grid grid-cols-[1fr_130px] gap-3">
          <Field label="Cliente">
            {(id) => (
              <Select id={id} value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">Sin asignar</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Desc. %">{(id) => <Stepper id={id} value={discountPct} onChange={setDiscountPct} max={50} step={5} />}</Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            icon={<Copy className="size-4" />}
            onClick={async () => toast((await copyText(text)) ? 'Resumen copiado' : 'No se pudo copiar', undefined, 'info')}
          >
            Copiar
          </Button>
          <Button icon={<FileCheck2 className="size-4" />} onClick={() => save()}>
            Guardar
          </Button>
          <Button
            variant="whatsapp"
            className={cn('col-span-2')}
            icon={<Send className="size-4" />}
            onClick={() => {
              if (!client) {
                toast('Selecciona un cliente', 'Necesitamos su número de WhatsApp', 'error')
                return
              }
              save('enviado')
              openWhatsApp(client.phone, text)
            }}
          >
            Enviar por WhatsApp
          </Button>
          <Button variant="ghost" size="sm" className="col-span-2" onClick={() => nav('/presupuestos')}>
            Ver todos los presupuestos →
          </Button>
        </div>
      </div>
    </Card>
  )
}

function Row({ k, v, className }: { k: string; v: string; className?: string }) {
  return (
    <div className={cn('flex justify-between text-ink-300', className)}>
      <span>{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  )
}
