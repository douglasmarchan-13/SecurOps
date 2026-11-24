import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Copy, FileText, Percent, Send, Trash2, Wallet } from 'lucide-react'
import type { QuoteStatus, ServiceArea } from '@/types'
import { Badge, Button, Card, EmptyState, PageHeader, Segmented, Select, Stat } from '@/components/ui/primitives'
import { AREA, QUOTE_STATUS } from '@/lib/labels'
import { quoteTotals } from '@/lib/quote'
import { useStore } from '@/store/useStore'
import { fmtDate, money } from '@/lib/utils'
import { copyText, openWhatsApp, quoteToWhatsApp } from '@/lib/whatsapp'
import { toast } from '@/store/useToast'

export default function QuotesPage() {
  const { quotes, clients, settings, upsert, remove } = useStore()
  const nav = useNavigate()
  const [status, setStatus] = useState<QuoteStatus | 'all'>('all')
  const cur = settings.company.currency
  const total = (q: (typeof quotes)[number]) => quoteTotals(q, settings.company.taxPct).total

  const stats = (() => {
    const sent = quotes.filter((q) => q.status !== 'borrador')
    const won = quotes.filter((q) => q.status === 'aprobado')
    return {
      pipeline: quotes.filter((q) => q.status === 'enviado').reduce((s, q) => s + total(q), 0),
      won: won.reduce((s, q) => s + total(q), 0),
      rate: sent.length ? Math.round((won.length / sent.length) * 100) : 0,
    }
  })()

  const list = [...quotes].filter((q) => status === 'all' || q.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <>
      <PageHeader
        eyebrow="Comercial"
        title="Presupuestos"
        description="Cotizaciones generadas desde los módulos de cercos, CCTV y portones."
        actions={
          <>
            <Button variant="primary" onClick={() => nav('/cercos')}>
              + Cerco
            </Button>
            <Button onClick={() => nav('/camaras')}>+ CCTV</Button>
            <Button onClick={() => nav('/portones')}>+ Portón</Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="En negociación" value={money(stats.pipeline, cur)} icon={<Wallet className="size-4" />} accent="arc" />
        <Stat label="Aprobado" value={money(stats.won, cur)} icon={<CheckCircle2 className="size-4" />} />
        <Stat label="Tasa de cierre" value={`${stats.rate}%`} icon={<Percent className="size-4" />} accent="violet" />
      </div>

      <Segmented
        className="mb-4"
        value={status}
        onChange={setStatus}
        options={[{ value: 'all' as const, label: 'Todos' }, ...(Object.keys(QUOTE_STATUS) as QuoteStatus[]).map((s) => ({ value: s, label: QUOTE_STATUS[s].label }))]}
      />

      {list.length === 0 ? (
        <EmptyState icon={<FileText className="size-6" />} title="Sin presupuestos" description="Genera uno desde cualquier calculadora." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-ink-500">
                  <th className="px-5 py-3 font-medium">Número</th>
                  <th className="px-3 py-3 font-medium">Detalle</th>
                  <th className="px-3 py-3 font-medium">Cliente</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {list.map((q) => {
                  const A = AREA[q.area as ServiceArea]
                  const client = clients.find((c) => c.id === q.clientId)
                  return (
                    <tr key={q.id} className="border-b border-white/[0.04] transition last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs font-semibold">{q.number}</p>
                        <p className="text-[11px] text-ink-500">{fmtDate(q.createdAt)}</p>
                      </td>
                      <td className="max-w-xs px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Badge tone={A.tone}>
                            <A.icon className="size-3" />
                          </Badge>
                          <span className="truncate">{q.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink-300">{client?.name ?? <span className="text-ink-500">Sin asignar</span>}</td>
                      <td className="px-3 py-3 text-right font-mono font-semibold">{money(total(q), cur)}</td>
                      <td className="px-3 py-3">
                        <Select aria-label="Estado" value={q.status} onChange={(e) => upsert('quotes', { ...q, status: e.target.value as QuoteStatus })} className="h-8 w-32 text-xs">
                          {(Object.keys(QUOTE_STATUS) as QuoteStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {QUOTE_STATUS[s].label}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label="Copiar" onClick={async () => (await copyText(quoteToWhatsApp(q, settings, client?.name))) && toast('Presupuesto copiado')}>
                            <Copy className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Enviar por WhatsApp"
                            disabled={!client}
                            className="text-whatsapp"
                            onClick={() => {
                              if (!client) return
                              openWhatsApp(client.phone, quoteToWhatsApp(q, settings, client.name))
                              if (q.status === 'borrador') upsert('quotes', { ...q, status: 'enviado' })
                            }}
                          >
                            <Send className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Eliminar" onClick={() => remove('quotes', q.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
