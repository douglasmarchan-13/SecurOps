import { useNavigate } from 'react-router-dom'
import { ZapOff } from 'lucide-react'
import { Button } from '@/components/ui/primitives'

export function NotFound() {
  const nav = useNavigate()
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <ZapOff className="size-12 text-ink-500" />
      <h1 className="mt-4 text-3xl font-bold">Circuito abierto</h1>
      <p className="mt-2 text-ink-400">La página que buscas no existe.</p>
      <Button variant="primary" className="mt-6" onClick={() => nav('/')}>
        Volver al centro de control
      </Button>
    </div>
  )
}
