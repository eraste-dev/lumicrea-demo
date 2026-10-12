import type { SceneRenderer, SceneRendererOptions } from '~/domain/scene/SceneRenderer'
import type { ProductViewer, ProductViewerOptions } from '~/domain/scene/ProductViewer'

// Seul endroit qui connaît l'implémentation concrète du rendu.
// L'import est dynamique pour que three.js ne parte pas dans le bundle initial.
export async function createSceneRenderer(options: SceneRendererOptions): Promise<SceneRenderer> {
  const { ThreeSceneRenderer } = await import('~/adapters/three/ThreeSceneRenderer')
  return new ThreeSceneRenderer(options)
}

// Même principe pour le visualiseur de produit en situation.
export async function createProductViewer(options: ProductViewerOptions): Promise<ProductViewer> {
  const { ThreeProductViewer } = await import('~/adapters/three/ThreeProductViewer')
  return new ThreeProductViewer(options)
}
