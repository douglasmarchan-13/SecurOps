import type { Appointment, Campaign, Client, LogEntry } from '@/types'
import { AREA, WORK_TYPE } from './labels'
import { fmtDate, fmtDateTime, nowIso, uid } from './utils'

/* Factorías de entidades nuevas (útiles también para tests y para el contrato con el backend). */

export const emptyClient = (): Client => ({ id: uid(), name: '', phone: '', address: '', zone: '', environment: [], tags: [], services: [], maintenanceEveryMonths: 6, createdAt: nowIso() })

export const emptyAppointment = (p: Partial<Appointment> = {}): Appointment => {
  const start = new Date()
  start.setDate(start.getDate() + 1)
  start.setHours(9, 0, 0, 0)
  return { id: uid(), clientId: '', kind: 'visita', area: 'cerco', start: start.toISOString(), durationMin: 60, technician: '', status: 'programada', ...p }
}

export const emptyLog = (clientId = '', technician = ''): LogEntry => ({
  id: uid(),
  clientId,
  location: '',
  date: nowIso(),
  area: 'cerco',
  workType: 'mantenimiento',
  technician,
  energizer: { brand: '', model: '', inputVoltage: '110V', battery: 'buena', protections: [] },
  measurements: { groundStatus: 'sin-medir' },
  partsUsed: [],
  environmentNotes: [],
  photosBefore: [],
  photosAfter: [],
  createdAt: nowIso(),
})

export const matchesAudience = (c: Client, a: Campaign['audience']) =>
  (a.areas.length === 0 || a.areas.some((x) => c.services.includes(x))) &&
  (a.zones.length === 0 || a.zones.includes(c.zone)) &&
  (a.tags.length === 0 || a.tags.some((t) => c.tags.includes(t)))

export function logSummary(l: LogEntry, clientName: string, company: string) {
  return [
    `*${company} · Reporte de servicio*`,
    `Cliente: ${clientName}`,
    `Fecha: ${fmtDateTime(l.date)} · ${WORK_TYPE[l.workType]} (${AREA[l.area].label})`,
    `Técnico: ${l.technician}${l.helper ? ` / ${l.helper}` : ''}`,
    l.measurements.lineKv != null ? `Voltaje en línea: ${l.measurements.lineKv} kV` : null,
    l.measurements.batteryV != null ? `Batería: ${l.measurements.batteryV} V` : null,
    l.reportedFaults ? `Falla: ${l.reportedFaults}` : null,
    l.rootCause ? `Causa raíz: ${l.rootCause}` : null,
    l.partsUsed.length ? `Repuestos: ${l.partsUsed.map((p) => `${p.qty}× ${p.name}`).join(', ')}` : null,
    l.observations ? `Obs.: ${l.observations}` : null,
    l.nextMaintenance ? `Próximo mantenimiento: ${fmtDate(l.nextMaintenance)}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}
