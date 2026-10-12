import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  type Material,
  TorusGeometry
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { MechanismShape } from '~/data/mechanisms'
import { PLATE_BASE_WIDTH, PLATE_SLOT_WIDTH, ROCKER_UP } from './viewerConfig'

export interface ProductMaterials {
  finish: Material
  dark: Material
  // noir franc : alvéoles de prise
  hole: Material
  steel: Material
}

export interface BuiltProduct {
  group: Group
  // touches : celles qui basculent quand on allume / éteint l'applique
  rockers: Mesh[]
  geometries: BufferGeometry[]
  width: number
}

const PLATE_HEIGHT = 1
const PLATE_DEPTH = 0.09
// face avant de la plaque (la plaque est posée sur le mur en z = 0)
const FRONT = PLATE_DEPTH

export function plateWidth(slotCount: number): number {
  return PLATE_BASE_WIDTH + PLATE_SLOT_WIDTH * slotCount
}

// Plaque + appareils, unité = largeur d'une plaque 1 poste. Le dos de la plaque est en z = 0.
export function buildProduct(shapes: MechanismShape[], materials: ProductMaterials): BuiltProduct {
  const group = new Group()
  const rockers: Mesh[] = []
  const geometries: BufferGeometry[] = []
  const width = plateWidth(shapes.length)

  function add<T extends BufferGeometry>(geometry: T, material: Material, x: number, y: number, z: number, castShadow = true): Mesh {
    geometries.push(geometry)
    const mesh = new Mesh(geometry, material)
    mesh.position.set(x, y, z)
    mesh.castShadow = castShadow
    mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }

  add(new RoundedBoxGeometry(width, PLATE_HEIGHT, PLATE_DEPTH, 10, 0.022), materials.finish, 0, 0, PLATE_DEPTH / 2)

  shapes.forEach((shape, index) => {
    const x = (index - (shapes.length - 1) / 2) * PLATE_SLOT_WIDTH

    if (shape === 'rocker') {
      const rocker = add(new RoundedBoxGeometry(0.44, 0.6, 0.06, 10, 0.016), materials.finish, x, 0, FRONT + 0.02)
      rocker.rotation.x = ROCKER_UP
      rockers.push(rocker)
    } else if (shape === 'socket') {
      add(new TorusGeometry(0.26, 0.045, 16, 48), materials.finish, x, 0, FRONT + 0.005)
      add(new CircleGeometry(0.26, 48), materials.dark, x, 0, FRONT + 0.004, false)
      add(new CircleGeometry(0.038, 24), materials.hole, x - 0.085, -0.03, FRONT + 0.006, false)
      add(new CircleGeometry(0.038, 24), materials.hole, x + 0.085, -0.03, FRONT + 0.006, false)
      const earth = add(new CylinderGeometry(0.02, 0.02, 0.07, 14), materials.steel, x, 0.16, FRONT + 0.03)
      earth.rotation.x = Math.PI / 2
    } else if (shape === 'button') {
      add(new TorusGeometry(0.2, 0.014, 12, 48), materials.dark, x, 0, FRONT + 0.004, false)
      const button = add(new CylinderGeometry(0.17, 0.17, 0.05, 48), materials.finish, x, 0, FRONT + 0.02)
      button.rotation.x = Math.PI / 2
    } else {
      add(new TorusGeometry(0.27, 0.014, 12, 48), materials.dark, x, 0, FRONT + 0.004, false)
      const dial = add(new CylinderGeometry(0.24, 0.24, 0.06, 64), materials.finish, x, 0, FRONT + 0.03)
      dial.rotation.x = Math.PI / 2
      add(new BoxGeometry(0.022, 0.11, 0.012), materials.dark, x, 0.14, FRONT + 0.062, false)
    }
  })

  return { group, rockers, geometries, width }
}
