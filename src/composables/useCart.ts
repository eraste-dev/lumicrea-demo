import { priceOfConfiguration } from '~/data/pricing'

export interface CartItem {
  id: string
  collectionSlug: string
  collectionName: string
  finishName: string
  tone: string
  highlight: string
  mechanisms: string[]
  unitPriceCents: number
  quantity: number
}

export type CartDraft = Omit<CartItem, 'id' | 'unitPriceCents' | 'quantity'>

const STORAGE_KEY = 'lumicrea-cart'
const MAX_QUANTITY = 20

function itemId(draft: CartDraft): string {
  return [draft.collectionSlug, draft.finishName, draft.mechanisms.join(',')].join('|')
}

function isCartItem(value: unknown): value is CartItem {
  const item = value as CartItem
  return typeof item?.id === 'string'
    && Array.isArray(item.mechanisms)
    && Number.isInteger(item.unitPriceCents)
    && Number.isInteger(item.quantity)
    && item.quantity > 0
}

// Panier de démonstration : état partagé, persisté dans le navigateur (aucune donnée de paiement).
export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  const isReady = useState('cart-ready', () => false)
  const toast = useToast()
  const drawer = useCartDrawer()

  function persist(next: CartItem[]) {
    items.value = next
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // stockage indisponible : le panier reste valable pour la session en cours
    }
  }

  onMounted(() => {
    if (isReady.value) return
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      items.value = Array.isArray(parsed) ? parsed.filter(isCartItem) : []
    } catch {
      items.value = []
    }
    isReady.value = true
  })

  function add(draft: CartDraft) {
    const id = itemId(draft)
    const existing = items.value.find(i => i.id === id)
    if (existing) {
      setQuantity(id, existing.quantity + 1)
    } else {
      const unitPriceCents = priceOfConfiguration(draft.collectionSlug, draft.mechanisms)
      persist([...items.value, { ...draft, id, unitPriceCents, quantity: 1 }])
    }

    const slotCount = draft.mechanisms.length
    toast.push({
      message: `${draft.collectionName} · plaque ${slotCount} poste${slotCount > 1 ? 's' : ''}, ${draft.finishName} ajoutée au panier`,
      actionLabel: 'Voir le panier',
      onAction: drawer.open
    })
  }

  function setQuantity(id: string, quantity: number) {
    if (quantity <= 0) return remove(id)
    const bounded = Math.min(quantity, MAX_QUANTITY)
    persist(items.value.map(i => (i.id === id ? { ...i, quantity: bounded } : i)))
  }

  function remove(id: string) {
    persist(items.value.filter(i => i.id !== id))
  }

  function clear() {
    persist([])
  }

  const count = computed(() => items.value.reduce((n, i) => n + i.quantity, 0))
  const subtotalCents = computed(() =>
    items.value.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0)
  )

  return { items, isReady, count, subtotalCents, add, setQuantity, remove, clear, maxQuantity: MAX_QUANTITY }
}

export function describeMechanisms(mechanisms: string[], labelOf: (id: string) => string): string {
  const counts = new Map<string, number>()
  for (const id of mechanisms) counts.set(id, (counts.get(id) ?? 0) + 1)
  return [...counts].map(([id, n]) => `${n} × ${labelOf(id)}`).join(', ')
}
