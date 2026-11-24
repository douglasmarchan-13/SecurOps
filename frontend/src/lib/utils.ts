import { clsx, type ClassValue } from 'clsx'

export const cn = (...v: ClassValue[]) => clsx(v)

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

export const nowIso = () => new Date().toISOString()

export function money(value: number, currency = 'USD') {
  return new Intl.NumberFormat('es', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0,
  )
}

export const num = (v: number, d = 0) =>
  new Intl.NumberFormat('es', { maximumFractionDigits: d, minimumFractionDigits: d }).format(v)

export const fmtDate = (iso?: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  iso ? new Intl.DateTimeFormat('es', opts).format(new Date(iso)) : '—'

export const fmtDateTime = (iso?: string) =>
  fmtDate(iso, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export const addMonths = (iso: string, months: number) => {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + months)
  return d.toISOString()
}

export const daysBetween = (a: Date | string, b: Date | string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

/** Reduce una imagen a JPEG liviano para guardarla offline sin agotar el almacenamiento. */
export async function compressImage(file: File, maxSide = 1024, quality = 0.7): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

/** Convierte ISO (o fecha local) al formato de <input type="datetime-local"> respetando la zona horaria. */
export const toLocalInput = (iso: string) => {
  const x = new Date(iso)
  return new Date(x.getTime() - x.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}
