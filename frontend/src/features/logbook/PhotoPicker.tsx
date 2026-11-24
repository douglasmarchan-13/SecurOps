import { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { compressImage } from '@/lib/utils'

export function PhotoPicker({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {value.map((src, i) => (
          <div key={i} className="group relative size-20 overflow-hidden rounded-xl border border-white/10">
            <img src={src} alt={`${label} ${i + 1}`} className="size-full object-cover" />
            <button type="button" aria-label="Quitar foto" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink-950/80 text-ink-200 opacity-0 transition group-hover:opacity-100 focus:opacity-100">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => ref.current?.click()} className="grid size-20 place-items-center rounded-xl border border-dashed border-white/15 text-ink-400 transition hover:border-volt-400/50 hover:text-volt-400">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        </button>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? [])
          if (!files.length) return
          setBusy(true)
          const imgs = await Promise.all(files.map((f) => compressImage(f)))
          onChange([...value, ...imgs])
          setBusy(false)
          e.target.value = ''
        }}
      />
    </div>
  )
}
