import type { Client } from '@/types'
import { addMonths, daysBetween } from './utils'

export type DueState = 'vencido' | 'proximo' | 'al-dia' | 'sin-plan'

export function maintenanceDue(c: Client, today = new Date()) {
  if (!c.maintenanceEveryMonths || !c.lastServiceAt) return { state: 'sin-plan' as DueState, dueAt: undefined, days: undefined }
  const dueAt = addMonths(c.lastServiceAt, c.maintenanceEveryMonths)
  const days = daysBetween(today, dueAt)
  const state: DueState = days < 0 ? 'vencido' : days <= 15 ? 'proximo' : 'al-dia'
  return { state, dueAt, days }
}

export const DUE_TONE = { vencido: 'red', proximo: 'amber', 'al-dia': 'green', 'sin-plan': 'neutral' } as const
export const DUE_LABEL = { vencido: 'Vencido', proximo: 'Próximo', 'al-dia': 'Al día', 'sin-plan': 'Sin plan' } as const
