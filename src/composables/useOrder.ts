import type { CartItem } from '~/composables/useCart'
import type { DeliveryMethod } from '~/data/pricing'

// Commande de démonstration. Jamais de données de carte ici : uniquement ce qu'affiche la confirmation.
export interface Order {
  number: string
  placedAt: string
  items: CartItem[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  delivery: DeliveryMethod
  customer: {
    email: string
    fullName: string
    address: string
    postalCode: string
    city: string
  }
  cardLast4: string
}

const STORAGE_KEY = 'lumicrea-last-order'
const ORDER_SUFFIX_DIGITS = 5

export function generateOrderNumber(now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = String(Math.floor(Math.random() * 10 ** ORDER_SUFFIX_DIGITS)).padStart(ORDER_SUFFIX_DIGITS, '0')
  return `LC-${date}-${suffix}`
}

// sessionStorage : la confirmation survit à un rechargement, pas à la fermeture de l'onglet
export function saveLastOrder(order: Order): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch {
    // stockage indisponible : la confirmation s'affichera sans recharge possible
  }
}

export function loadLastOrder(): Order | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Order) : null
  } catch {
    return null
  }
}
