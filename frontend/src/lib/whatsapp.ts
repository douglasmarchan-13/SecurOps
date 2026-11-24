import type { Quote, Settings } from '@/types'
import { money } from './utils'
import { quoteTotals } from './quote'

export const waLink = (phone: string, text: string) =>
  `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`

export const openWhatsApp = (phone: string, text: string) => window.open(waLink(phone, text), '_blank', 'noopener')

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Reemplaza variables de plantilla como {nombre} o {empresa}. */
export const fillTemplate = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`)

export function quoteToWhatsApp(q: Quote, s: Settings, clientName?: string) {
  const c = s.company.currency
  const t = quoteTotals(q, s.company.taxPct)
  const lines = q.lines
    .filter((l) => l.qty > 0)
    .map((l) => `• ${l.label}: ${l.qty} ${l.unit} — ${money(l.qty * l.unitPrice, c)}`)
  return [
    `*${s.company.name} · Presupuesto ${q.number}*`,
    clientName ? `Cliente: ${clientName}` : null,
    `*${q.title}*`,
    '',
    '*Materiales*',
    ...lines,
    '',
    `Mano de obra: ${money(q.labor, c)}`,
    `Subtotal: ${money(t.subtotal, c)}`,
    q.discountPct ? `Descuento (${q.discountPct}%): -${money(t.discount, c)}` : null,
    s.company.taxPct ? `Impuesto (${s.company.taxPct}%): ${money(t.tax, c)}` : null,
    `*TOTAL: ${money(t.total, c)}*`,
    ...(q.notes.length ? ['', ...q.notes.map((n) => `_${n}_`)] : []),
    '',
    `📞 ${s.company.phone}`,
  ]
    .filter((x) => x !== null)
    .join('\n')
}
