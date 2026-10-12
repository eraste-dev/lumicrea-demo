import { finishes } from '~/data/finishes'
import vendomePhoto from '~/assets/images/home/collection-vendome.webp'
import axessPhoto from '~/assets/images/home/collection-axess.webp'

export type ProductType = 'interrupteur' | 'prise'

export interface DemoProduct {
  id: string
  name: string
  type: ProductType
  // postes de la plaque, pour l'aperçu
  slots: number
  // id d'appareil (data/mechanisms.ts) répété sur chaque poste
  mechanism: string
  description: string
}

export interface CollectionFinish {
  id: string
  name: string
  tone: string
  highlight: string
  // réponse de la matière pour le rendu 3D
  metalness: number
  roughness: number
}

export interface Collection {
  slug: string
  name: string
  origin: string
  subtitle: string
  photo: string
  alt: string
  finishes: CollectionFinish[]
  products: DemoProduct[]
}

// Types d'appareils génériques : les références exactes viennent du catalogue à jour.
// TODO: remplacer par les produits réels (source unique) ; tarifs dans data/pricing.ts.
const baseProducts: DemoProduct[] = [
  { id: 'interrupteur-simple', name: 'Interrupteur simple', type: 'interrupteur', slots: 1, mechanism: 'interrupteur', description: 'Interrupteur à bascule, une touche sur plaque 1 poste. Commande un point lumineux.' },
  { id: 'interrupteur-double', name: 'Interrupteur double', type: 'interrupteur', slots: 2, mechanism: 'interrupteur', description: 'Deux interrupteurs côte à côte sur une plaque 2 postes, pour commander deux circuits.' },
  { id: 'va-et-vient', name: 'Va-et-vient', type: 'interrupteur', slots: 1, mechanism: 'va-et-vient', description: 'Va-et-vient : commande un même point lumineux depuis deux endroits (couloir, escalier, chambre).' },
  { id: 'prise-simple', name: 'Prise 2P+T', type: 'prise', slots: 1, mechanism: 'prise', description: 'Prise de courant 2P+T avec terre, sur plaque 1 poste.' },
  { id: 'prise-double', name: 'Double prise 2P+T', type: 'prise', slots: 2, mechanism: 'prise', description: 'Deux prises 2P+T avec terre sur une plaque 2 postes.' },
  { id: 'prise-triple', name: 'Triple prise 2P+T', type: 'prise', slots: 3, mechanism: 'prise', description: 'Trois prises 2P+T avec terre sur une plaque 3 postes.' }
]

// Teintes aXess approximatives, à confirmer (mêmes noms que HomeCollections).
const axessFinishes: CollectionFinish[] = [
  { id: 'blanc-satine', name: 'Blanc Satiné', tone: '#e9e7e2', highlight: '#f8f7f4', metalness: 0, roughness: 0.6 },
  { id: 'chrome-miroir', name: 'Chrome Miroir', tone: '#9aa1a8', highlight: '#e3e7ea', metalness: 1, roughness: 0.12 },
  { id: 'acier-brosse', name: 'Acier Brossé', tone: '#8a949c', highlight: '#c3cbd1', metalness: 0.85, roughness: 0.45 },
  { id: 'etain', name: 'Étain', tone: '#6f7378', highlight: '#a3a7ab', metalness: 0.8, roughness: 0.4 },
  { id: 'noir-mat', name: 'Noir Mat', tone: '#232325', highlight: '#434348', metalness: 0.2, roughness: 0.75 },
  { id: 'champagne', name: 'Champagne', tone: '#b9a27a', highlight: '#e0d1b0', metalness: 0.8, roughness: 0.4 },
  { id: 'laiton-poli', name: 'Laiton Poli', tone: '#b08d3c', highlight: '#e2c477', metalness: 1, roughness: 0.15 },
  { id: 'laiton-brosse', name: 'Laiton Brossé', tone: '#a88a4a', highlight: '#d2b878', metalness: 0.8, roughness: 0.5 }
]

export const collections: Collection[] = [
  {
    slug: 'vendome',
    name: 'Vendôme',
    origin: 'Conçu en France',
    subtitle: "Une collection d'interrupteurs et de prises design à découvrir selon les formes, les usages et les finitions.",
    photo: vendomePhoto,
    alt: 'Deux prises à façade laiton brossé sur un mur de marbre, entre deux miroirs ronds',
    finishes: finishes.map(({ id, name, tone, highlight, metalness, roughness }) => ({ id, name, tone, highlight, metalness, roughness })),
    products: baseProducts
  },
  {
    slug: 'axess',
    name: 'aXess',
    origin: 'Conçu en Angleterre',
    subtitle: "Le style de l'appareillage design, à portée de main. Une gamme d'entrée qui laisse de la place au choix.",
    photo: axessPhoto,
    alt: 'Chevet de chambre avec un interrupteur et une prise à façade laiton sur un panneau bois',
    finishes: axessFinishes,
    products: baseProducts
  }
]

export function findCollection(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug)
}

export function findProduct(collectionSlug: string, productId: string): DemoProduct | undefined {
  return findCollection(collectionSlug)?.products.find(p => p.id === productId)
}

// Points forts repris de lumicrea.fr.
export const collectionHighlights: Record<string, string[]> = {
  vendome: [
    'Façade en aluminium renforcé de 6 mm d\'épaisseur',
    'Installation simple, rapide et robuste',
    'Conçu en France'
  ],
  axess: [
    'Le style de l\'appareillage design, à portée de main',
    'Une gamme d\'entrée qui laisse de la place au choix',
    'Conçu en Angleterre'
  ]
}
