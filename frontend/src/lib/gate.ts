import type { QuoteLine, Settings } from '@/types'

export type GateKind = 'corredizo' | 'batiente' | 'levadizo'

export interface GateInput {
  kind: GateKind
  leaves: 1 | 2
  weightKg: number
  widthM: number
  cyclesPerDay: number
  remotes: number
  photocells: boolean
  lamp: boolean
  backup: boolean
}

export const GATE_INFO: Record<GateKind, { name: string; desc: string }> = {
  corredizo: { name: 'Corredizo', desc: 'Desliza lateralmente sobre riel con cremallera.' },
  batiente: { name: 'Batiente', desc: 'Abre como puerta, de 1 o 2 hojas con brazo.' },
  levadizo: { name: 'Levadizo / basculante', desc: 'Sube en bloque, ideal para garajes.' },
}

export function calcGate(i: GateInput, s: Settings['gate']) {
  // Margen de seguridad: 30% sobre el peso, +20% si es de uso intensivo
  const factor = 1.3 * (i.cyclesPerDay > 40 ? 1.2 : 1)
  const perLeafKg = i.kind === 'batiente' ? i.weightKg / i.leaves : i.weightKg
  const requiredKg = Math.ceil(perLeafKg * factor)
  const options = s.motors[i.kind]
  const motor = options.find((m) => m.maxKg >= requiredKg) ?? options[options.length - 1]
  const motorsQty = i.kind === 'batiente' ? i.leaves : 1
  return {
    requiredKg,
    motor,
    motorsQty,
    overCapacity: motor.maxKg < requiredKg,
    rackMeters: i.kind === 'corredizo' ? Math.ceil((i.widthM + 0.5) * 2) / 2 : 0,
    intensive: i.cyclesPerDay > 40,
  }
}

export function gateLines(i: GateInput, r: ReturnType<typeof calcGate>, s: Settings['gate']): QuoteLine[] {
  const lines: QuoteLine[] = [
    { label: `Motor ${GATE_INFO[i.kind].name.toLowerCase()} hasta ${r.motor.maxKg} kg`, qty: r.motorsQty, unit: 'und', unitPrice: r.motor.price },
    { label: 'Controles remotos', qty: i.remotes, unit: 'und', unitPrice: s.remote },
    { label: 'Base / anclaje y herrajes', qty: r.motorsQty, unit: 'kit', unitPrice: s.anchorBase },
  ]
  if (r.rackMeters) lines.splice(1, 0, { label: 'Cremallera', qty: r.rackMeters, unit: 'm', unitPrice: s.rackPerMeter })
  if (i.photocells) lines.push({ label: 'Par de fotoceldas de seguridad', qty: 1, unit: 'par', unitPrice: s.photocell })
  if (i.lamp) lines.push({ label: 'Lámpara destellante', qty: 1, unit: 'und', unitPrice: s.lamp })
  if (i.backup) lines.push({ label: 'Batería de respaldo', qty: r.motorsQty, unit: 'und', unitPrice: s.backupBattery })
  return lines
}
