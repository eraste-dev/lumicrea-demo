// Tarifs de démonstration, en centimes TTC.
// Ancrés sur les « à partir de » de lumicrea.fr (aXess : interrupteur 24,90 €, prise 34,90 €) ;
// les autres valeurs sont des estimations à remplacer par le catalogue réel.
const MECHANISM_PRICES_CENTS: Record<string, Record<string, number>> = {
  vendome: { 'interrupteur': 3990, 'va-et-vient': 4490, 'prise': 4990 },
  axess: { 'interrupteur': 2490, 'va-et-vient': 2990, 'poussoir': 2790, 'variateur': 4990, 'prise': 3490 }
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 50000
export const STANDARD_SHIPPING_CENTS = 990
export const VAT_RATE = 0.2

export type DeliveryMethod = 'standard' | 'showroom'

export interface DeliveryOption {
  id: DeliveryMethod
  label: string
  detail: string
}

export const deliveryOptions: DeliveryOption[] = [
  { id: 'standard', label: 'Livraison à domicile', detail: 'Expédition sous 3 à 5 jours ouvrés' },
  { id: 'showroom', label: 'Retrait au showroom de Suresnes', detail: "102 rue Rouget de L'Isle · gratuit" }
]

// prix d'une plaque : somme de ses appareils (façade comprise)
export function priceOfConfiguration(collectionSlug: string, mechanisms: string[]): number {
  const table = MECHANISM_PRICES_CENTS[collectionSlug] ?? {}
  return mechanisms.reduce((sum, id) => sum + (table[id] ?? 0), 0)
}

export function shippingCents(method: DeliveryMethod, subtotalCents: number): number {
  if (method === 'showroom') return 0
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS
}

// part de TVA contenue dans un montant TTC
export function vatIncluded(totalCents: number): number {
  return Math.round(totalCents - totalCents / (1 + VAT_RATE))
}
