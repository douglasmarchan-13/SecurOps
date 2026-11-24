export type ID = string

export type FenceTier = 'A' | 'B' | 'C'
export type ServiceArea = 'cerco' | 'cctv' | 'porton'
export type WorkType = 'instalacion' | 'mantenimiento' | 'reparacion' | 'diagnostico'

export interface Client {
  id: ID
  name: string
  phone: string // formato internacional sin "+", ej. 584141234567
  email?: string
  address: string
  zone: string
  environment: string[] // salitre, arboles, muros...
  tags: string[]
  services: ServiceArea[]
  maintenanceEveryMonths?: number
  lastServiceAt?: string
  notes?: string
  createdAt: string
}

export interface Measurements {
  lineKv?: number
  batteryV?: number
  chargerV?: number
  groundStatus: 'ok' | 'regular' | 'deficiente' | 'sin-medir'
  leaks?: string
}

export interface LogEntry {
  id: ID
  clientId: ID
  location: string
  date: string
  area: ServiceArea
  workType: WorkType
  technician: string
  helper?: string
  energizer?: { brand: string; model: string; inputVoltage: '110V' | '220V'; battery: 'buena' | 'regular' | 'reemplazar' | 'n/a'; protections: string[] }
  measurements: Measurements
  reportedFaults?: string
  rootCause?: string
  partsUsed: { name: string; qty: number }[]
  environmentNotes: string[]
  observations?: string
  photosBefore: string[]
  photosAfter: string[]
  nextMaintenance?: string
  createdAt: string
}

export type AppointmentKind = 'visita' | 'instalacion' | 'mantenimiento' | 'diagnostico'
export type AppointmentStatus = 'programada' | 'confirmada' | 'completada' | 'cancelada'

export interface Appointment {
  id: ID
  clientId: ID
  kind: AppointmentKind
  area: ServiceArea
  start: string // ISO
  durationMin: number
  technician: string
  notes?: string
  status: AppointmentStatus
  recurringGroup?: ID
}

export type QuoteStatus = 'borrador' | 'enviado' | 'aprobado' | 'rechazado'

export interface QuoteLine {
  label: string
  qty: number
  unit: string
  unitPrice: number
}

export interface Quote {
  id: ID
  number: string
  clientId?: ID
  area: ServiceArea
  title: string
  tier?: FenceTier
  lines: QuoteLine[]
  labor: number
  discountPct: number
  notes: string[]
  status: QuoteStatus
  createdAt: string
}

export type CampaignStatus = 'borrador' | 'programada' | 'enviando' | 'enviada'

export interface Campaign {
  id: ID
  name: string
  kind: 'descuento' | 'promocion' | 'oferta'
  message: string
  products: string[]
  discountPct?: number
  audience: { areas: ServiceArea[]; zones: string[]; tags: string[] }
  scheduledAt?: string
  sentAt?: string
  status: CampaignStatus
  recipients: number
  createdAt: string
}

export interface SyncOp {
  id: ID
  entity: 'client' | 'log' | 'appointment' | 'quote' | 'campaign' | 'settings'
  action: 'create' | 'update' | 'delete'
  refId: ID
  at: string
}

export interface FencePrices {
  postIntermediate: number
  postCorner: number
  wirePerMeter: number
  insulatorPass: number
  insulatorCorner: number
  tensioner: number
  spring: number
  hvCablePerMeter: number
  groundRod: number
  sign: number
  energizer: number
  battery: number
  siren: number
  surgeProtector: number
  voltageProtector: number
  smartModule: number
}

export interface Settings {
  company: { name: string; phone: string; currency: string; taxPct: number }
  technicians: string[]
  fence: { laborPerMeter: number; prices: Record<FenceTier, FencePrices> }
  cctv: {
    laborPerCamera: number
    camera: Record<'bullet' | 'domo' | 'ptz', Record<'2MP' | '4MP' | '8MP', number>>
    recorder: Record<4 | 8 | 16 | 32, number>
    diskPerTB: number
    cablePerMeter: number
    connectorKit: number
    powerSupply: number
    mount: number
  }
  gate: {
    labor: Record<'corredizo' | 'batiente' | 'levadizo', number>
    motors: Record<'corredizo' | 'batiente' | 'levadizo', { maxKg: number; price: number }[]>
    rackPerMeter: number
    remote: number
    photocell: number
    lamp: number
    backupBattery: number
    anchorBase: number
  }
}
