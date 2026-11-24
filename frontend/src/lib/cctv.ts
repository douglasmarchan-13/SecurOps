import type { QuoteLine, Settings } from '@/types'

export type CamForm = 'bullet' | 'domo' | 'ptz'
export type CamRes = '2MP' | '4MP' | '8MP'

export interface CamGroup {
  id: string
  form: CamForm
  res: CamRes
  qty: number
  label: string
}

export interface CctvInput {
  groups: CamGroup[]
  retentionDays: number
  avgCableMeters: number
  hoursPerDay: number
}

// Bitrate aproximado H.265 en Mbps por resolución
const BITRATE: Record<CamRes, number> = { '2MP': 2, '4MP': 4, '8MP': 8 }
const CHANNELS = [4, 8, 16, 32] as const

export function calcCctv(i: CctvInput) {
  const cameras = i.groups.reduce((s, g) => s + Math.max(0, g.qty), 0)
  const channels = CHANNELS.find((c) => c >= cameras) ?? 32
  const recorders = cameras > 32 ? Math.ceil(cameras / 32) : 1
  const totalMbps = i.groups.reduce((s, g) => s + BITRATE[g.res] * g.qty, 0)
  const storageTB = (totalMbps / 8) * 3600 * i.hoursPerDay * i.retentionDays / 1_000_000
  const diskTB = Math.max(1, Math.ceil(storageTB))
  return {
    cameras,
    channels,
    recorders,
    totalMbps,
    storageTB,
    diskTB,
    cableMeters: Math.ceil(cameras * i.avgCableMeters * 1.1),
    connectorKits: cameras,
    powerSupplies: Math.ceil(cameras / 4),
    mounts: i.groups.filter((g) => g.form !== 'domo').reduce((s, g) => s + g.qty, 0),
  }
}

export function cctvLines(i: CctvInput, r: ReturnType<typeof calcCctv>, s: Settings['cctv']): QuoteLine[] {
  return [
    ...i.groups
      .filter((g) => g.qty > 0)
      .map((g) => ({
        label: `Cámara ${g.form === 'ptz' ? 'PTZ' : g.form} ${g.res}${g.label ? ` · ${g.label}` : ''}`,
        qty: g.qty,
        unit: 'und',
        unitPrice: s.camera[g.form][g.res],
      })),
    { label: `Grabador ${r.channels} canales`, qty: r.recorders, unit: 'und', unitPrice: s.recorder[r.channels as 4 | 8 | 16 | 32] },
    { label: `Disco duro vigilancia (${r.diskTB} TB)`, qty: r.diskTB, unit: 'TB', unitPrice: s.diskPerTB },
    { label: 'Cable UTP/coaxial (+10%)', qty: r.cableMeters, unit: 'm', unitPrice: s.cablePerMeter },
    { label: 'Kit conectores / balun', qty: r.connectorKits, unit: 'kit', unitPrice: s.connectorKit },
    { label: 'Fuente de poder (4 cám.)', qty: r.powerSupplies, unit: 'und', unitPrice: s.powerSupply },
    { label: 'Bases / cajas de paso', qty: r.mounts, unit: 'und', unitPrice: s.mount },
  ]
}
