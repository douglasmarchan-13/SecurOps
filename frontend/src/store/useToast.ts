import { create } from 'zustand'
import { uid } from '@/lib/utils'

export interface Toast {
  id: string
  title: string
  description?: string
  tone: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id' | 'tone'> & { tone?: Toast['tone'] }) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: ({ tone = 'success', ...t }) => {
    const id = uid()
    set({ toasts: [...get().toasts, { id, tone, ...t }] })
    setTimeout(() => get().dismiss(id), 3800)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))

export const toast = (title: string, description?: string, tone: Toast['tone'] = 'success') =>
  useToast.getState().push({ title, description, tone })
