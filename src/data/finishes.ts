import type { Finish } from '~/domain/product/Finish'

// Liste et teintes à confirmer avec la marque (cf. docs/02-design/PAGE_MAP_AND_COPY.md).
// TODO: remplacer les teintes par des valeurs échantillonnées sur les photos validées.
export const finishes: Finish[] = [
  { id: 'bronze', name: 'Bronze', tone: '#7a5a3c', highlight: '#a98562', metalness: 0.8, roughness: 0.5 },
  { id: 'canon', name: 'Canon', tone: '#4a4d52', highlight: '#7a7e84', metalness: 0.8, roughness: 0.5 },
  { id: 'acier', name: 'Acier', tone: '#8a949c', highlight: '#c3cbd1', metalness: 0.8, roughness: 0.5 },
  { id: 'blanc-mat', name: 'Blanc Mat', tone: '#e4e2dd', highlight: '#f7f6f3', metalness: 0, roughness: 0.65 },
  { id: 'laiton-brosse', name: 'Laiton Brossé', tone: '#a88a4a', highlight: '#d2b878', metalness: 0.8, roughness: 0.5 },
  { id: 'noir-brosse', name: 'Noir Brossé', tone: '#202022', highlight: '#3d3d41', metalness: 0.75, roughness: 0.5 }
]

export const defaultFinish = finishes[0]!
