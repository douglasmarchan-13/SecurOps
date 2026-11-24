import { Cctv, DoorOpen, Zap, type LucideIcon } from 'lucide-react'
import type { AppointmentKind, AppointmentStatus, QuoteStatus, ServiceArea, WorkType } from '@/types'
import type { Tone } from '@/components/ui/primitives'

export const AREA: Record<ServiceArea, { label: string; short: string; icon: LucideIcon; tone: Tone }> = {
  cerco: { label: 'Cerco eléctrico', short: 'Cerco', icon: Zap, tone: 'volt' },
  cctv: { label: 'Cámaras CCTV', short: 'CCTV', icon: Cctv, tone: 'arc' },
  porton: { label: 'Portón eléctrico', short: 'Portón', icon: DoorOpen, tone: 'violet' },
}

export const WORK_TYPE: Record<WorkType, string> = {
  instalacion: 'Instalación',
  mantenimiento: 'Mantenimiento',
  reparacion: 'Reparación',
  diagnostico: 'Diagnóstico',
}

export const APPT_KIND: Record<AppointmentKind, string> = {
  visita: 'Visita / levantamiento',
  instalacion: 'Instalación',
  mantenimiento: 'Mantenimiento preventivo',
  diagnostico: 'Diagnóstico',
}

export const APPT_STATUS: Record<AppointmentStatus, { label: string; tone: Tone }> = {
  programada: { label: 'Programada', tone: 'neutral' },
  confirmada: { label: 'Confirmada', tone: 'arc' },
  completada: { label: 'Completada', tone: 'green' },
  cancelada: { label: 'Cancelada', tone: 'red' },
}

export const QUOTE_STATUS: Record<QuoteStatus, { label: string; tone: Tone }> = {
  borrador: { label: 'Borrador', tone: 'neutral' },
  enviado: { label: 'Enviado', tone: 'arc' },
  aprobado: { label: 'Aprobado', tone: 'green' },
  rechazado: { label: 'Rechazado', tone: 'red' },
}

export const ENVIRONMENTS = [
  { value: 'salitre', label: 'Salitre / costa' },
  { value: 'arboles', label: 'Árboles / vegetación' },
  { value: 'muros', label: 'Muros irregulares' },
  { value: 'polvo', label: 'Polvo / industrial' },
  { value: 'lluvia', label: 'Lluvia intensa' },
  { value: 'animales', label: 'Animales' },
]
