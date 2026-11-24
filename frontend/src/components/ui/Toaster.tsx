import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useToast } from '@/store/useToast'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, dismiss } = useToast()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:right-6 md:left-auto">
      {toasts.map((t) => {
        const Icon = t.tone === 'error' ? XCircle : t.tone === 'info' ? Info : CheckCircle2
        return (
          <button
            key={t.id}
            onClick={() => dismiss(t.id)}
            className="glass pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-2xl px-4 py-3 text-left shadow-2xl"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', t.tone === 'error' ? 'text-red-400' : t.tone === 'info' ? 'text-arc-400' : 'text-volt-400')} />
            <div>
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="text-xs text-ink-400">{t.description}</p>}
            </div>
          </button>
        )
      })}
    </div>
  )
}
