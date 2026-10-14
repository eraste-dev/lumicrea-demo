import { BackSide, BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Scene } from 'three'

// Environnement de studio pour les reflets : pièce sombre + softboxes lumineuses.
// Un métal ne reflète que son environnement : des sources franches sur fond sombre
// donnent de meilleurs reflets qu'un fond uniforme.
function panel(width: number, height: number, intensity: number, tint: [number, number, number]): Mesh {
  const material = new MeshBasicMaterial({ side: DoubleSide })
  // > 1 possible : l'environnement est en flottant (PMREM)
  material.color.setRGB(tint[0] * intensity, tint[1] * intensity, tint[2] * intensity)
  return new Mesh(new PlaneGeometry(width, height), material)
}

export function createStudioEnvironment(): Scene {
  const scene = new Scene()

  const room = new Mesh(new BoxGeometry(24, 14, 24), new MeshBasicMaterial({ color: 0x0c0c0e, side: BackSide }))
  scene.add(room)

  // grande softbox au plafond
  const top = panel(10, 8, 9, [1, 0.97, 0.92])
  top.position.set(0, 6.8, 2)
  top.rotation.x = Math.PI / 2
  scene.add(top)

  // bandeau latéral gauche, chaud
  const left = panel(2.4, 9, 7, [1, 0.9, 0.78])
  left.position.set(-10, 1, 3)
  left.rotation.y = Math.PI / 2
  scene.add(left)

  // bandeau latéral droit, plus froid et plus faible : modèle les arêtes
  const right = panel(2, 8, 3.2, [0.82, 0.9, 1])
  right.position.set(10, 1, 4)
  right.rotation.y = -Math.PI / 2
  scene.add(right)

  // réflecteur de face, très doux : évite les noirs complets
  const front = panel(8, 5, 1.1, [1, 1, 1])
  front.position.set(0, 0, 11)
  scene.add(front)

  // softbox avant haute, inclinée vers la plaque : dégradé de reflet sur les faces planes
  const frontTop = panel(14, 3.2, 5, [1, 0.96, 0.9])
  frontTop.position.set(0, 5, 9)
  frontTop.rotation.x = -0.55
  scene.add(frontTop)

  // sol clair : renvoie un peu de lumière vers le bas des chanfreins
  const floor = panel(24, 24, 0.5, [0.9, 0.85, 0.78])
  floor.position.set(0, -6.8, 0)
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  return scene
}
