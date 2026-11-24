import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { NotFound } from '@/pages/NotFound'
import { RouteError } from '@/pages/RouteError'

// Code-splitting por módulo: cada pantalla se descarga solo cuando se visita (y queda cacheada offline por el SW).
const Dashboard = lazy(() => import('@/pages/DashboardPage'))
const Fence = lazy(() => import('@/pages/FencePage'))
const Cctv = lazy(() => import('@/pages/CctvPage'))
const Gate = lazy(() => import('@/pages/GatePage'))
const Logbook = lazy(() => import('@/pages/LogbookPage'))
const Clients = lazy(() => import('@/pages/ClientsPage'))
const Agenda = lazy(() => import('@/pages/AgendaPage'))
const Quotes = lazy(() => import('@/pages/QuotesPage'))
const Campaigns = lazy(() => import('@/pages/CampaignsPage'))
const Settings = lazy(() => import('@/pages/SettingsPage'))

const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'cercos', element: <Fence /> },
      { path: 'camaras', element: <Cctv /> },
      { path: 'portones', element: <Gate /> },
      { path: 'bitacora', element: <Logbook /> },
      { path: 'clientes', element: <Clients /> },
      { path: 'agenda', element: <Agenda /> },
      { path: 'presupuestos', element: <Quotes /> },
      { path: 'campanas', element: <Campaigns /> },
      { path: 'ajustes', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
