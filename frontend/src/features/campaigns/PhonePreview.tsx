import { useState } from 'react'
import { CheckCheck } from 'lucide-react'

/** Renderiza *negritas* y _cursivas_ como en WhatsApp. */
function waFormat(text: string) {
  const parts = text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g)
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*') ? <strong key={i}>{p.slice(1, -1)}</strong> : p.startsWith('_') && p.endsWith('_') ? <em key={i}>{p.slice(1, -1)}</em> : p,
  )
}

export function PhonePreview({ company, text }: { company: string; text: string }) {
  const [time] = useState(() => new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }))
  return (
    <div className="mx-auto w-[270px] rounded-[2.4rem] border-[6px] border-ink-700 bg-ink-950 p-1.5 shadow-2xl">
      <div className="overflow-hidden rounded-[1.9rem] bg-[#0b141a]">
        <div className="flex items-center gap-2 bg-[#202c33] px-3 py-2.5">
          <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-volt-400 to-arc-400 text-xs font-bold text-ink-950">SO</div>
          <div>
            <p className="text-sm font-semibold text-white">{company}</p>
            <p className="text-[10px] text-emerald-300">cuenta de empresa</p>
          </div>
        </div>
        <div className="h-[380px] overflow-y-auto bg-[radial-gradient(rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:14px_14px] p-3">
          <div className="relative ml-auto max-w-[92%] whitespace-pre-wrap rounded-lg rounded-tr-none bg-[#005c4b] px-2.5 py-1.5 text-[13px] leading-snug text-[#e9edef] shadow">
            {text ? waFormat(text) : <span className="opacity-50">Escribe tu mensaje…</span>}
            <span className="float-right ml-2 mt-1 flex items-center gap-0.5 text-[10px] text-[#8fb5ad]">
              {time} <CheckCheck className="size-3 text-sky-400" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
