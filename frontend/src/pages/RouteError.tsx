import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'

export function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : 'Error desconocido'
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <TriangleAlert className="size-12 text-amber-400" />
      <h1 className="mt-4 text-2xl font-bold">Algo salió mal</h1>
      <p className="mt-2 max-w-md text-sm text-ink-400">Tus datos están a salvo en este dispositivo. Recarga la página para continuar.</p>
      <pre className="mt-4 max-w-xl overflow-x-auto rounded-xl bg-ink-850 px-4 py-2 font-mono text-xs text-ink-400">{message}</pre>
      <button onClick={() => location.reload()} className="mt-6 h-10 rounded-xl bg-volt-400 px-5 text-sm font-medium text-ink-950">
        Recargar
      </button>
    </div>
  )
}
