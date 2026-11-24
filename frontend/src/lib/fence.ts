import type { FenceTier, FencePrices, QuoteLine } from '@/types'

export interface TierInfo {
  id: FenceTier
  name: string
  tagline: string
  use: string
  posts: string
  wire: string
  insulators: string
  electronics: string
  warranty: string
  warrantyYears: number
  lifeScore: number // 1-10 visual
  corrosionScore: number
  color: string
}

export const TIERS: Record<FenceTier, TierInfo> = {
  A: {
    id: 'A',
    name: 'Tipo A',
    tagline: 'Alta resistencia · Premium',
    use: 'Zonas costeras con salitre, conjuntos residenciales, comercios y perímetros largos.',
    posts: 'Hierro galvanizado o estructural grueso (2–3 mm / cédula 40) con fondo anticorrosivo y esmalte.',
    wire: 'Acero inoxidable de buen calibre, resistente a corrosión y tensión.',
    insulators: 'Polímero con filtro UV reforzado y tensores resistentes a la intemperie.',
    electronics: 'Energizador de mayor potencia, batería de respaldo, protector de voltaje, DPS y módulo inteligente/Wi‑Fi.',
    warranty: 'Mayor duración y resistencia a la corrosión.',
    warrantyYears: 3,
    lifeScore: 10,
    corrosionScore: 10,
    color: 'var(--color-tier-a)',
  },
  B: {
    id: 'B',
    name: 'Tipo B',
    tagline: 'Estándar · Intermedio',
    use: 'Residencias urbanas sin exposición directa fuerte al mar, perímetros medianos.',
    posts: 'Tubería de calibre intermedio (1.5–1.8 mm) con pintura anticorrosiva.',
    wire: 'Acero galvanizado o aluminio de buena conductividad.',
    insulators: 'Polímero estándar con protección UV y tensores convencionales.',
    electronics: 'Potencia media, batería de respaldo y protector básico.',
    warranty: 'Duración media con mantenimiento preventivo periódico.',
    warrantyYears: 2,
    lifeScore: 7,
    corrosionScore: 6,
    color: 'var(--color-tier-b)',
  },
  C: {
    id: 'C',
    name: 'Tipo C',
    tagline: 'Económico · Básico',
    use: 'Presupuestos ajustados, zonas más protegidas o soluciones básicas.',
    posts: 'Perfil o tubería más liviana con pintura convencional.',
    wire: 'Alambre galvanizado estándar de menor resistencia a la oxidación.',
    insulators: 'Aisladores y tensores básicos.',
    electronics: 'Equipo básico de entrada sin accesorios avanzados.',
    warranty: 'Garantía de materiales limitada frente a desgaste o corrosión prematura.',
    warrantyYears: 1,
    lifeScore: 4,
    corrosionScore: 3,
    color: 'var(--color-tier-c)',
  },
}

export const TIER_C_NOTE =
  'Nota: La calidad de la mano de obra es la misma, pero la vida útil y resistencia a la corrosión de los materiales económicos es menor, por lo que la garantía de fábrica/materiales es limitada frente a desgaste o corrosión prematura.'

export interface FenceInput {
  meters: number
  wires: number
  corners: number
  tier: FenceTier
  spacing: number // metros entre postes (2.5 – 3)
  closedPerimeter: boolean
  hvCableMeters: number
  groundRods: number
  wasteMarginPct: number
}

export interface FenceResult {
  tramos: number
  postsCorner: number
  postsIntermediate: number
  wireMeters: number
  insulatorsPass: number
  insulatorsCorner: number
  tensioners: number
  springs: number
  hvCableMeters: number
  groundRods: number
  signs: number
  extras: { battery: boolean; surge: boolean; voltageProtector: boolean; smart: boolean }
}

export const defaultFenceInput: FenceInput = {
  meters: 60,
  wires: 5,
  corners: 3,
  tier: 'B',
  spacing: 2.5,
  closedPerimeter: false,
  hvCableMeters: 15,
  groundRods: 2,
  wasteMarginPct: 10,
}

export function calcFence(i: FenceInput): FenceResult {
  const meters = Math.max(0, i.meters)
  const wires = Math.max(1, Math.round(i.wires))
  const corners = Math.max(0, Math.round(i.corners))
  // Un perímetro abierto agrega 2 extremos de tensión; uno cerrado solo usa las esquinas.
  const postsCorner = i.closedPerimeter ? Math.max(corners, 1) : corners + 2
  const tramos = i.closedPerimeter ? Math.max(corners, 1) : corners + 1
  const totalPosts = meters > 0 ? Math.ceil(meters / Math.max(1, i.spacing)) + (i.closedPerimeter ? 0 : 1) : 0
  const postsIntermediate = Math.max(0, totalPosts - postsCorner)

  return {
    tramos,
    postsCorner,
    postsIntermediate,
    wireMeters: Math.ceil(meters * wires * (1 + i.wasteMarginPct / 100)),
    insulatorsPass: postsIntermediate * wires,
    insulatorsCorner: tramos * wires * 2,
    tensioners: tramos * wires,
    springs: tramos * wires,
    hvCableMeters: Math.max(0, i.hvCableMeters),
    groundRods: Math.max(1, i.groundRods),
    signs: Math.max(1, Math.ceil(meters / 10)),
    extras: {
      battery: i.tier !== 'C',
      voltageProtector: i.tier !== 'C',
      surge: i.tier === 'A',
      smart: i.tier === 'A',
    },
  }
}

export function fenceLines(r: FenceResult, p: FencePrices, tier: FenceTier): QuoteLine[] {
  const lines: QuoteLine[] = [
    { label: `Postes intermedios (Tipo ${tier})`, qty: r.postsIntermediate, unit: 'und', unitPrice: p.postIntermediate },
    { label: `Postes esquineros/refuerzo (Tipo ${tier})`, qty: r.postsCorner, unit: 'und', unitPrice: p.postCorner },
    { label: 'Alambre conductor (+margen)', qty: r.wireMeters, unit: 'm', unitPrice: p.wirePerMeter },
    { label: 'Aisladores de paso', qty: r.insulatorsPass, unit: 'und', unitPrice: p.insulatorPass },
    { label: 'Aisladores esquina/tensor', qty: r.insulatorsCorner, unit: 'und', unitPrice: p.insulatorCorner },
    { label: 'Tensores', qty: r.tensioners, unit: 'und', unitPrice: p.tensioner },
    { label: 'Resortes de tensión', qty: r.springs, unit: 'und', unitPrice: p.spring },
    { label: 'Cable de alta tensión aislado', qty: r.hvCableMeters, unit: 'm', unitPrice: p.hvCablePerMeter },
    { label: 'Barras / jabalinas de tierra', qty: r.groundRods, unit: 'und', unitPrice: p.groundRod },
    { label: 'Avisos de advertencia', qty: r.signs, unit: 'und', unitPrice: p.sign },
    { label: 'Energizador', qty: 1, unit: 'und', unitPrice: p.energizer },
    { label: 'Sirena', qty: 1, unit: 'und', unitPrice: p.siren },
  ]
  if (r.extras.battery) lines.push({ label: 'Batería de respaldo', qty: 1, unit: 'und', unitPrice: p.battery })
  if (r.extras.voltageProtector) lines.push({ label: 'Protector de voltaje', qty: 1, unit: 'und', unitPrice: p.voltageProtector })
  if (r.extras.surge) lines.push({ label: 'Supresor de picos (DPS)', qty: 1, unit: 'und', unitPrice: p.surgeProtector })
  if (r.extras.smart) lines.push({ label: 'Módulo inteligente Wi‑Fi', qty: 1, unit: 'und', unitPrice: p.smartModule })
  return lines
}
