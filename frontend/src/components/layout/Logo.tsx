export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="size-9 animate-pulse-volt" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d4ff3a" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="#0f1726" />
        <path d="M32 8 12 16v14c0 12.5 8.5 22 20 26 11.5-4 20-13.5 20-26V16L32 8Z" fill="none" stroke="url(#lg)" strokeWidth="4" strokeLinejoin="round" />
        <path d="M35 18 24 35h8l-3 12 11-17h-8l3-12Z" fill="url(#lg)" />
      </svg>
      {!compact && (
        <div className="leading-none">
          <div className="font-display text-lg font-bold tracking-tight">
            Secur<span className="text-gradient">Ops</span>
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-ink-500">Field Ops Suite</div>
        </div>
      )}
    </div>
  )
}
