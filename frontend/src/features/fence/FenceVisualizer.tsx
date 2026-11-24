import { memo } from 'react'
import type { FenceInput, FenceResult } from '@/lib/fence'
import { TIERS } from '@/lib/fence'

/** Representación esquemática del cerco: postes, hilos energizados con corriente animada y avisos. */
export const FenceVisualizer = memo(function FenceVisualizer({ input, result }: { input: FenceInput; result: FenceResult }) {
  const W = 900
  const H = 220
  const pad = 40
  const groundY = 185
  const topY = 40
  const color = TIERS[input.tier].color

  const totalPosts = result.postsCorner + result.postsIntermediate
  const MAX_DRAWN = 36
  const drawn = Math.min(totalPosts, MAX_DRAWN)
  const step = drawn > 1 ? (W - pad * 2) / (drawn - 1) : 0
  // Distribuye las esquinas/extremos de forma uniforme entre los postes dibujados
  const cornersDrawn = Math.min(result.postsCorner, drawn)
  const cornerIdx = new Set(
    cornersDrawn <= 1 ? [0] : Array.from({ length: cornersDrawn }, (_, k) => Math.round((k * (drawn - 1)) / (cornersDrawn - 1))),
  )
  const isCorner = (i: number) => cornerIdx.has(i)
  const wires = Math.min(input.wires, 10)
  const wireGap = (groundY - 50 - topY) / Math.max(1, wires - 1 || 1)
  const signs = Math.min(result.signs, 12)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-ink-950/60">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <svg viewBox={`0 0 ${W} ${H}`} className="relative w-full" role="img" aria-label={`Esquema de cerco de ${input.meters} metros con ${input.wires} hilos`}>
        <defs>
          <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#22304a" />
            <stop offset="1" stopColor="#0f1726" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* muro */}
        <rect x={pad - 20} y={groundY - 8} width={W - pad * 2 + 40} height={H - groundY + 8} fill="url(#wall)" rx="4" />

        {/* hilos */}
        {drawn > 1 &&
          Array.from({ length: wires }).map((_, w) => {
            const y = topY + w * (wires > 1 ? wireGap : 0)
            return (
              <g key={w}>
                <line x1={pad} x2={W - pad} y1={y} y2={y} stroke={color} strokeOpacity="0.25" strokeWidth="1.5" />
                <line x1={pad} x2={W - pad} y1={y} y2={y} stroke={color} strokeWidth="1.6" strokeDasharray="6 34" filter="url(#glow)" className="animate-current" style={{ animationDelay: `${w * -0.2}s` }} />
              </g>
            )
          })}

        {/* postes */}
        {Array.from({ length: drawn }).map((_, i) => {
          const x = pad + i * step
          const corner = isCorner(i)
          return (
            <g key={i}>
              <rect x={x - (corner ? 3.5 : 2)} y={topY - 12} width={corner ? 7 : 4} height={groundY - topY + 4} rx="1.5" fill={corner ? '#c7cfdd' : '#6b7a96'} />
              {Array.from({ length: wires }).map((__, w) => (
                <circle key={w} cx={x} cy={topY + w * (wires > 1 ? wireGap : 0)} r={corner ? 3.4 : 2.4} fill="#070b14" stroke={corner ? color : '#9aa6bd'} strokeWidth="1.2" />
              ))}
            </g>
          )
        })}

        {/* avisos */}
        {Array.from({ length: signs }).map((_, i) => {
          const x = pad + ((i + 0.5) * (W - pad * 2)) / signs
          return (
            <g key={i} transform={`translate(${x - 9} ${groundY - 34})`}>
              <rect width="18" height="14" rx="2" fill="#f59e0b" />
              <path d="M10 2 6 8h3l-1 4 4-6H9l1-4Z" fill="#070b14" />
            </g>
          )
        })}
      </svg>
      <div className="absolute left-4 top-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-400">
        <span className="size-1.5 animate-pulse rounded-full" style={{ background: color }} />
        Vista esquemática · {input.meters} m · {input.wires} hilos
        {totalPosts > MAX_DRAWN && <span className="text-ink-500">(muestra {MAX_DRAWN} de {totalPosts} postes)</span>}
      </div>
    </div>
  )
})
