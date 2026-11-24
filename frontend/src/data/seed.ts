import type { Appointment, Campaign, Client, LogEntry, Quote, Settings } from '@/types'

const d = (offsetDays: number, hour = 9) => {
  const x = new Date()
  x.setDate(x.getDate() + offsetDays)
  x.setHours(hour, 0, 0, 0)
  return x.toISOString()
}

export const defaultSettings: Settings = {
  company: { name: 'SecurOps', phone: '+58 414 000 0000', currency: 'USD', taxPct: 0 },
  technicians: ['Carlos M.', 'Andrés R.', 'Luis P.'],
  fence: {
    laborPerMeter: 4.5,
    prices: {
      A: { postIntermediate: 14, postCorner: 28, wirePerMeter: 0.55, insulatorPass: 0.9, insulatorCorner: 1.6, tensioner: 2.8, spring: 1.8, hvCablePerMeter: 1.4, groundRod: 18, sign: 3.5, energizer: 165, battery: 32, siren: 14, surgeProtector: 38, voltageProtector: 26, smartModule: 75 },
      B: { postIntermediate: 9.5, postCorner: 19, wirePerMeter: 0.32, insulatorPass: 0.55, insulatorCorner: 1.1, tensioner: 1.9, spring: 1.2, hvCablePerMeter: 1.0, groundRod: 13, sign: 2.8, energizer: 110, battery: 26, siren: 11, surgeProtector: 30, voltageProtector: 20, smartModule: 60 },
      C: { postIntermediate: 6, postCorner: 12, wirePerMeter: 0.18, insulatorPass: 0.3, insulatorCorner: 0.7, tensioner: 1.1, spring: 0.8, hvCablePerMeter: 0.7, groundRod: 9, sign: 2, energizer: 70, battery: 22, siren: 8, surgeProtector: 25, voltageProtector: 16, smartModule: 50 },
    },
  },
  cctv: {
    laborPerCamera: 25,
    camera: {
      bullet: { '2MP': 28, '4MP': 45, '8MP': 85 },
      domo: { '2MP': 26, '4MP': 42, '8MP': 80 },
      ptz: { '2MP': 140, '4MP': 220, '8MP': 380 },
    },
    recorder: { 4: 65, 8: 95, 16: 170, 32: 320 },
    diskPerTB: 42,
    cablePerMeter: 0.45,
    connectorKit: 3.5,
    powerSupply: 18,
    mount: 4,
  },
  gate: {
    labor: { corredizo: 120, batiente: 150, levadizo: 140 },
    motors: {
      corredizo: [{ maxKg: 600, price: 260 }, { maxKg: 1000, price: 340 }, { maxKg: 1500, price: 460 }, { maxKg: 2000, price: 590 }],
      batiente: [{ maxKg: 250, price: 210 }, { maxKg: 400, price: 290 }, { maxKg: 600, price: 380 }],
      levadizo: [{ maxKg: 300, price: 240 }, { maxKg: 500, price: 330 }],
    },
    rackPerMeter: 9,
    remote: 12,
    photocell: 28,
    lamp: 15,
    backupBattery: 35,
    anchorBase: 22,
  },
}

export const seedClients: Client[] = [
  { id: 'c1', name: 'Residencias Mar Azul', phone: '584141112233', address: 'Av. Costanera, Torre 3', zone: 'Costa Norte', environment: ['salitre'], tags: ['conjunto', 'vip'], services: ['cerco', 'cctv'], maintenanceEveryMonths: 3, lastServiceAt: d(-80), createdAt: d(-400) },
  { id: 'c2', name: 'Ferretería El Tornillo', phone: '584242223344', address: 'Calle 5 con Av. Bolívar', zone: 'Centro', environment: ['muros'], tags: ['comercio'], services: ['cerco', 'porton'], maintenanceEveryMonths: 6, lastServiceAt: d(-30), createdAt: d(-200) },
  { id: 'c3', name: 'María Fernanda López', phone: '584163334455', address: 'Urb. Los Pinos, casa 14', zone: 'Este', environment: ['arboles'], tags: ['residencial'], services: ['cerco'], maintenanceEveryMonths: 6, lastServiceAt: d(-175), createdAt: d(-500) },
  { id: 'c4', name: 'Colegio San Rafael', phone: '584124445566', address: 'Sector La Esperanza', zone: 'Oeste', environment: ['arboles', 'muros'], tags: ['institucional'], services: ['cctv', 'porton'], maintenanceEveryMonths: 4, lastServiceAt: d(-60), createdAt: d(-120) },
  { id: 'c5', name: 'Galpón Logística 24', phone: '584145556677', address: 'Zona Industrial II', zone: 'Industrial', environment: ['polvo'], tags: ['comercio'], services: ['cerco', 'cctv', 'porton'], maintenanceEveryMonths: 3, lastServiceAt: d(-95), createdAt: d(-90) },
]

export const seedLogs: LogEntry[] = [
  {
    id: 'l1', clientId: 'c1', location: 'Perímetro frontal', date: d(-80), area: 'cerco', workType: 'mantenimiento', technician: 'Carlos M.', helper: 'Luis P.',
    energizer: { brand: 'Genérico', model: 'EZ-12K', inputVoltage: '110V', battery: 'regular', protections: ['DPS', 'Protector de voltaje'] },
    measurements: { lineKv: 8.2, batteryV: 12.4, chargerV: 13.6, groundStatus: 'regular', leaks: 'Fuga leve en tramo 2 por vegetación' },
    reportedFaults: 'Alarma se dispara de noche', rootCause: 'Contacto con ramas y aislador fisurado', partsUsed: [{ name: 'Aislador esquina', qty: 4 }, { name: 'Resorte de tensión', qty: 2 }],
    environmentNotes: ['salitre', 'arboles'], observations: 'Recomendar migración a Tipo A en tramo frontal.', photosBefore: [], photosAfter: [], nextMaintenance: d(10), createdAt: d(-80),
  },
  {
    id: 'l2', clientId: 'c2', location: 'Portón principal', date: d(-30), area: 'porton', workType: 'reparacion', technician: 'Andrés R.',
    measurements: { groundStatus: 'sin-medir' }, reportedFaults: 'Portón no cierra completamente', rootCause: 'Fotocelda desalineada', partsUsed: [],
    environmentNotes: [], photosBefore: [], photosAfter: [], createdAt: d(-30),
  },
]

export const seedAppointments: Appointment[] = [
  { id: 'a1', clientId: 'c1', kind: 'mantenimiento', area: 'cerco', start: d(1, 9), durationMin: 120, technician: 'Carlos M.', status: 'confirmada' },
  { id: 'a2', clientId: 'c4', kind: 'visita', area: 'cctv', start: d(2, 14), durationMin: 60, technician: 'Andrés R.', status: 'programada', notes: 'Levantamiento para 12 cámaras' },
  { id: 'a3', clientId: 'c5', kind: 'instalacion', area: 'porton', start: d(3, 8), durationMin: 300, technician: 'Luis P.', status: 'programada' },
  { id: 'a4', clientId: 'c3', kind: 'diagnostico', area: 'cerco', start: d(0, 16), durationMin: 60, technician: 'Carlos M.', status: 'confirmada' },
]

export const seedQuotes: Quote[] = [
  {
    id: 'q1', number: 'SO-2026-0001', clientId: 'c3', area: 'cerco', title: 'Cerco eléctrico 48 m · 5 hilos · Tipo B', tier: 'B',
    lines: [{ label: 'Kit materiales cerco Tipo B', qty: 1, unit: 'kit', unitPrice: 690 }], labor: 216, discountPct: 5, notes: [], status: 'enviado', createdAt: d(-6),
  },
  {
    id: 'q2', number: 'SO-2026-0002', clientId: 'c4', area: 'cctv', title: 'CCTV 8 cámaras 4MP', lines: [{ label: 'Kit CCTV 8 cámaras', qty: 1, unit: 'kit', unitPrice: 820 }],
    labor: 200, discountPct: 0, notes: [], status: 'aprobado', createdAt: d(-15),
  },
]

export const seedCampaigns: Campaign[] = [
  {
    id: 'cp1', name: 'Revisión preventiva de temporada', kind: 'promocion',
    message: 'Hola {nombre} 👋 En {empresa} tenemos revisión preventiva de tu cerco eléctrico con 20% de descuento este mes. ¡Agenda respondiendo este mensaje!',
    products: ['Mantenimiento preventivo'], discountPct: 20, audience: { areas: ['cerco'], zones: [], tags: [] }, scheduledAt: d(4, 10), status: 'programada', recipients: 4, createdAt: d(-2),
  },
]
