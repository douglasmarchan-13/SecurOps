import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------- Button ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp'
const variants: Record<Variant, string> = {
  primary: 'bg-volt-400 text-ink-950 hover:bg-volt-300 shadow-[0_8px_24px_-10px_rgb(212_255_58/0.7)]',
  secondary: 'bg-ink-700/70 text-ink-100 hover:bg-ink-600 border border-white/5',
  ghost: 'text-ink-300 hover:text-ink-100 hover:bg-white/5',
  danger: 'bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/20',
  whatsapp: 'bg-whatsapp text-ink-950 hover:brightness-110 shadow-[0_8px_24px_-10px_rgb(37_211_102/0.7)]',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg' | 'icon'
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-base',
        size === 'icon' && 'size-10',
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
})

/* ---------- Card ---------- */
export function Card({ className, children, glow }: { className?: string; children: ReactNode; glow?: boolean }) {
  return <div className={cn('glass rounded-2xl', glow && 'glow-volt', className)}>{children}</div>
}

export function CardHeader({ title, subtitle, icon, action }: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/5 text-volt-400">{icon}</div>}
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold">{title}</h3>
          {subtitle && <p className="truncate text-xs text-ink-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

/* ---------- Form fields ---------- */
const fieldBase =
  'w-full rounded-xl border border-white/8 bg-ink-850/80 px-3.5 text-sm text-ink-100 placeholder:text-ink-500 transition focus:border-volt-400/60 focus:outline-none focus:ring-4 focus:ring-volt-400/10'

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: (id: string) => ReactNode; className?: string }) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-ink-400">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(fieldBase, 'h-10', className)} {...p} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(fieldBase, 'min-h-24 py-2.5', className)} {...p} />
})

export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, 'h-10 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%239aa6bd%27 stroke-width=%272%27%3E%3Cpath d=%27m4 6 4 4 4-4%27/%3E%3C/svg%3E")] bg-[right_0.75rem_center] bg-no-repeat pr-9', className)} {...p}>
      {children}
    </select>
  )
}

/* ---------- Stepper (ideal para uso en campo con guantes / pantallas táctiles) ---------- */
export function Stepper({ value, onChange, min = 0, max = 9999, step = 1, suffix, id }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string; id?: string }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min))
  return (
    <div className="flex h-12 items-center overflow-hidden rounded-xl border border-white/8 bg-ink-850/80 focus-within:border-volt-400/60">
      <button type="button" aria-label="Disminuir" onClick={() => onChange(clamp(+(value - step).toFixed(2)))} className="grid h-full w-12 place-items-center text-ink-300 hover:bg-white/5 hover:text-volt-400">
        <Minus className="size-4" />
      </button>
      <div className="flex flex-1 items-baseline justify-center gap-1">
        <input id={id} type="number" inputMode="decimal" value={value} min={min} max={max} step={step} onChange={(e) => onChange(clamp(parseFloat(e.target.value)))} className="w-full min-w-0 bg-transparent text-center font-mono text-lg font-semibold text-ink-100 focus:outline-none" />
        {suffix && <span className="pr-1 text-xs text-ink-400">{suffix}</span>}
      </div>
      <button type="button" aria-label="Aumentar" onClick={() => onChange(clamp(+(value + step).toFixed(2)))} className="grid h-full w-12 place-items-center text-ink-300 hover:bg-white/5 hover:text-volt-400">
        <Plus className="size-4" />
      </button>
    </div>
  )
}

/* ---------- Segmented control ---------- */
export function Segmented<T extends string | number>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string }) {
  return (
    <div role="radiogroup" className={cn('inline-flex rounded-xl border border-white/8 bg-ink-850/80 p-1', className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={value === o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn('flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition', value === o.value ? 'bg-ink-600 text-ink-100 shadow' : 'text-ink-400 hover:text-ink-200')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- Chips multi-select ---------- */
export function ChipGroup<T extends string>({ value, onChange, options }: { value: T[]; onChange: (v: T[]) => void; options: { value: T; label: string }[] }) {
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o.value)}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition', on ? 'border-volt-400/50 bg-volt-400/10 text-volt-300' : 'border-white/8 text-ink-300 hover:border-white/20')}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Switch ---------- */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/5 bg-ink-850/50 px-3.5 py-2.5 text-sm">
      <span className="text-ink-200">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-volt-400' : 'bg-ink-600')}>
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'left-5.5' : 'left-0.5')} />
      </button>
    </label>
  )
}

/* ---------- Badge ---------- */
const tones = {
  neutral: 'bg-white/5 text-ink-300 border-white/10',
  volt: 'bg-volt-400/10 text-volt-300 border-volt-400/25',
  arc: 'bg-arc-400/10 text-arc-300 border-arc-400/25',
  amber: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  red: 'bg-red-400/10 text-red-300 border-red-400/25',
  green: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25',
  violet: 'bg-violet-400/10 text-violet-300 border-violet-400/25',
}
export type Tone = keyof typeof tones
export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium', tones[tone], className)}>{children}</span>
}

/* ---------- Page header ---------- */
export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex animate-rise flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-volt-400">{eyebrow}</p>}
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

/* ---------- Stat ---------- */
export function Stat({ label, value, hint, icon, accent = 'volt' }: { label: string; value: ReactNode; hint?: ReactNode; icon: ReactNode; accent?: 'volt' | 'arc' | 'amber' | 'violet' }) {
  const color = { volt: 'text-volt-400 bg-volt-400/10', arc: 'text-arc-400 bg-arc-400/10', amber: 'text-amber-400 bg-amber-400/10', violet: 'text-violet-400 bg-violet-400/10' }[accent]
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</span>
        <span className={cn('grid size-8 place-items-center rounded-lg', color)}>{icon}</span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </Card>
  )
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-white/5 text-ink-400">{icon}</div>
      <div>
        <p className="font-display font-semibold">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}
