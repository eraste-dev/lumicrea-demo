export type MechanismShape = 'rocker' | 'socket' | 'button' | 'dial'

export interface Mechanism {
  id: string
  label: string
  shape: MechanismShape
}

// Types d'appareils présentés sur lumicrea.fr (catégories interrupteurs et prises).
export const mechanisms: Record<string, Mechanism> = {
  'interrupteur': { id: 'interrupteur', label: 'Interrupteur', shape: 'rocker' },
  'va-et-vient': { id: 'va-et-vient', label: 'Va-et-vient', shape: 'rocker' },
  'poussoir': { id: 'poussoir', label: 'Bouton poussoir', shape: 'button' },
  'variateur': { id: 'variateur', label: 'Variateur', shape: 'dial' },
  'prise': { id: 'prise', label: 'Prise', shape: 'socket' }
}

// Appareils disponibles par collection (slug de data/collections.ts).
export const mechanismsByCollection: Record<string, string[]> = {
  vendome: ['interrupteur', 'va-et-vient', 'prise'],
  axess: ['interrupteur', 'va-et-vient', 'poussoir', 'variateur', 'prise']
}

export function getMechanism(id: string): Mechanism {
  return mechanisms[id] ?? mechanisms['interrupteur']!
}
