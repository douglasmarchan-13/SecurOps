import { CalendarDays, Cctv, ClipboardList, DoorOpen, FileText, LayoutDashboard, Megaphone, Settings, Users, Zap, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  group: 'Operación' | 'Soluciones' | 'Comercial' | 'Sistema'
  keywords?: string
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Centro de control', icon: LayoutDashboard, group: 'Operación', keywords: 'dashboard inicio' },
  { to: '/bitacora', label: 'Bitácora técnica', icon: ClipboardList, group: 'Operación', keywords: 'servicio mantenimiento reporte' },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays, group: 'Operación', keywords: 'citas calendario visitas' },
  { to: '/clientes', label: 'Clientes', icon: Users, group: 'Operación', keywords: 'crm contactos' },
  { to: '/cercos', label: 'Cercos eléctricos', icon: Zap, group: 'Soluciones', keywords: 'calculadora materiales hilos' },
  { to: '/camaras', label: 'Cámaras CCTV', icon: Cctv, group: 'Soluciones', keywords: 'video vigilancia dvr nvr' },
  { to: '/portones', label: 'Motores y portones', icon: DoorOpen, group: 'Soluciones', keywords: 'automatización corredizo' },
  { to: '/presupuestos', label: 'Presupuestos', icon: FileText, group: 'Comercial', keywords: 'cotización whatsapp' },
  { to: '/campanas', label: 'Campañas', icon: Megaphone, group: 'Comercial', keywords: 'promociones ofertas descuentos marketing' },
  { to: '/ajustes', label: 'Ajustes y precios', icon: Settings, group: 'Sistema', keywords: 'configuración catálogo' },
]

export const MOBILE_NAV = ['/', '/bitacora', '/cercos', '/agenda']
