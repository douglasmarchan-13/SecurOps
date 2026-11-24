import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Modal accesible basado en <dialog> nativo: foco atrapado, Esc para cerrar. En móvil se muestra como bottom-sheet. */
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' | 'xl' }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        'm-0 mt-auto max-h-[92dvh] w-full max-w-none rounded-t-3xl border border-white/10 bg-ink-850 p-0 text-ink-100 shadow-2xl backdrop:bg-ink-950/70 backdrop:backdrop-blur-sm open:animate-rise md:m-auto md:rounded-3xl',
        size === 'md' && 'md:max-w-lg',
        size === 'lg' && 'md:max-w-2xl',
        size === 'xl' && 'md:max-w-4xl',
      )}
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {subtitle && <p className="text-sm text-ink-400">{subtitle}</p>}
            </div>
            <button onClick={onClose} aria-label="Cerrar" className="grid size-9 place-items-center rounded-xl text-ink-400 hover:bg-white/5 hover:text-ink-100">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-white/5 px-6 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
