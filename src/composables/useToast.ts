export interface Toast {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

const TOAST_DURATION_MS = 4500
const MAX_VISIBLE_TOASTS = 3

// Notifications éphémères, affichées par <ToastHost /> (montée dans app.vue).
export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])
  const sequence = useState('toast-sequence', () => 0)

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function push(input: Omit<Toast, 'id'>): number {
    const id = sequence.value + 1
    sequence.value = id
    toasts.value = [...toasts.value, { ...input, id }].slice(-MAX_VISIBLE_TOASTS)
    if (import.meta.client) setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    return id
  }

  return { toasts, push, dismiss }
}
