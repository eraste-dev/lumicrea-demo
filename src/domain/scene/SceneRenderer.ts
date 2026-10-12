import type { Finish } from '~/domain/product/Finish'

export interface SceneRendererOptions {
  reducedMotion: boolean
  // appelé quand l'utilisateur appuie sur l'interrupteur de la scène
  onSwitch?: () => void
}

// Port : tout moteur de rendu (Three.js, image statique...) doit pouvoir le remplacer.
export interface SceneRenderer {
  // lève une erreur si le rendu est impossible (WebGL absent par exemple)
  mount(container: HTMLElement): void
  setFinish(finish: Finish): void
  // 0 → 1 : avancement d'une séquence pilotée par le scroll (rotation, zoom)
  setProgress(progress: number): void
  // position de la touche : relevée = allumé, abaissée = éteint
  setLightOn(isOn: boolean): void
  dispose(): void
}
