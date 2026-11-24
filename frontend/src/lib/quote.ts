import type { Quote } from '@/types'

export function quoteTotals(q: Pick<Quote, 'lines' | 'labor' | 'discountPct'>, taxPct = 0) {
  const materials = q.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
  const subtotal = materials + q.labor
  const discount = (subtotal * (q.discountPct || 0)) / 100
  const taxable = subtotal - discount
  const tax = (taxable * taxPct) / 100
  return { materials, subtotal, discount, tax, total: taxable + tax }
}

export const nextQuoteNumber = (count: number) => `SO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
