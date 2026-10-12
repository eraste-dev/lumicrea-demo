import type { MechanismShape } from '~/data/mechanisms'

export type ViewerShot = 'room' | 'face' | 'three-quarter' | 'detail' | 'grazing'
export type ViewerAmbiance = 'studio' | 'salon' | 'marble' | 'evening'

export interface ViewerFinish {
  tone: string
  metalness: number
  roughness: number
  // métal brossé : stries fines visibles dans les reflets
  brushed?: boolean
}

export interface ProductViewerOptions {
  reducedMotion: boolean
  // vrai : la molette zoome toujours (fenêtre plein écran) ; faux : Ctrl + molette seulement
  captureWheel: boolean
  // appui sur une touche de la plaque : allume / éteint l'applique de la pièce
  onSwitch?: () => void
  // l'utilisateur prend la main (glisser, zoomer) : la visite automatique doit s'arrêter
  onUserInteract?: () => void
  // la visite automatique change de plan
  onShotChange?: (shot: ViewerShot) => void
  // le zoom a changé (molette, pincement) : l'interface se synchronise
  onZoomChange?: (zoom: number) => void
}

// Port : visualiseur d'une plaque posée sur un mur, dans une pièce.
export interface ProductViewer {
  // lève une erreur si le rendu est impossible (WebGL absent par exemple)
  mount(container: HTMLElement): void
  setProduct(shapes: MechanismShape[]): void
  setFinish(finish: ViewerFinish): void
  setShot(shot: ViewerShot): void
  setAmbiance(ambiance: ViewerAmbiance): void
  setTourPlaying(isPlaying: boolean): void
  // 1 = plan d'origine ; plus grand = plus près
  setZoom(zoom: number): void
  // remet zoom, déplacement et orbite à zéro
  resetView(): void
  dispose(): void
}

// Bornes du zoom, partagées par le moteur et l'interface (1 = plan d'origine).
export const VIEWER_ZOOM = { min: 0.5, max: 3.2, buttonStep: 1.3 }
