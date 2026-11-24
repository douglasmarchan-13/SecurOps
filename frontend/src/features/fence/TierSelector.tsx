import { Check } from 'lucide-react'
import type { FenceTier } from '@/types'
import { TIERS } from '@/lib/fence'
import { cn } from '@/lib/utils'

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-ink-500">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < value ? color : 'rgb(255 255 255 / 0.06)' }} />
        ))}
      </div>
    </div>
  )
}

export function TierSelector({ value, onChange }: { value: FenceTier; onChange: (t: FenceTier) => void }) {
  return (
    <div role="radiogroup" aria-label="Calidad del material" className="grid gap-3 sm:grid-cols-3">
      {(Object.keys(TIERS) as FenceTier[]).map((id) => {
        const t = TIERS[id]
        const on = value === id
        return (
          <button
            key={id}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(id)}
            className={cn('group relative overflow-hidden rounded-2xl border p-4 text-left transition-all', on ? 'bg-ink-800' : 'border-white/5 bg-ink-850/50 hover:border-white/15')}
            style={on ? { borderColor: t.color, boxShadow: `0 10px 40px -18px ${t.color}` } : undefined}
          >
            <div className="pointer-events-none absolute -right-6 -top-10 font-display text-[110px] font-bold leading-none opacity-[0.06]" style={{ color: t.color }}>
              {id}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold" style={{ color: t.color }}>
                {t.name}
              </span>
              <span className={cn('grid size-5 place-items-center rounded-full border transition', on ? 'border-transparent' : 'border-white/20')} style={on ? { background: t.color } : undefined}>
                {on && <Check className="size-3.5 text-ink-950" strokeWidth={3} />}
              </span>
            </div>
            <p className="text-xs font-medium text-ink-300">{t.tagline}</p>
            <p className="mt-2 line-clamp-2 text-xs text-ink-500">{t.use}</p>
            <div className="mt-3 space-y-2">
              <Meter label="Vida útil" value={t.lifeScore} color={t.color} />
              <Meter label="Anticorrosión" value={t.corrosionScore} color={t.color} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
