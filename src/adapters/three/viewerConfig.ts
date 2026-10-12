import { VIEWER_ZOOM, type ViewerAmbiance, type ViewerShot } from '~/domain/scene/ProductViewer'

export type WallStyle = 'plaster' | 'marble' | 'concrete'

export interface AmbianceSetting {
  wall: WallStyle
  wallColor: string
  floorColor: string
  environment: number
  exposure: number
  keyColor: string
  key: number
  fill: number
  // intensité de l'applique quand elle est allumée
  lamp: number
}

export const AMBIANCES: Record<ViewerAmbiance, AmbianceSetting> = {
  studio: { wall: 'concrete', wallColor: '#cfcdc8', floorColor: '#8c8a85', environment: 1.2, exposure: 1, keyColor: '#fff6ea', key: 3.4, fill: 1.2, lamp: 1.5 },
  salon: { wall: 'plaster', wallColor: '#d9ccb9', floorColor: '#8a6a4a', environment: 0.9, exposure: 1, keyColor: '#ffe6c4', key: 3, fill: 0.8, lamp: 3 },
  marble: { wall: 'marble', wallColor: '#ecebe7', floorColor: '#a9a49b', environment: 1.2, exposure: 1.05, keyColor: '#ffffff', key: 3.2, fill: 1, lamp: 1.5 },
  evening: { wall: 'plaster', wallColor: '#2b2f2b', floorColor: '#2a2420', environment: 0.14, exposure: 1, keyColor: '#ffcf9c', key: 0.45, fill: 0.08, lamp: 6 }
}

export interface ShotSetting {
  // position de la caméra, pour une plaque d'un poste (mise à l'échelle selon la largeur)
  position: [number, number, number]
  target: [number, number, number]
}

export const SHOTS: Record<ViewerShot, ShotSetting> = {
  room: { position: [1.2, 0.5, 11], target: [0.6, 0, 0] },
  face: { position: [0, 0, 5.2], target: [0, 0, 0] },
  'three-quarter': { position: [2.7, 1, 4.4], target: [0, 0, 0] },
  detail: { position: [0.9, 0.35, 2.3], target: [0, 0, 0.05] },
  grazing: { position: [4.6, 0.5, 1.5], target: [0, 0, 0] }
}

// ordre de la visite automatique
export const TOUR_SEQUENCE: ViewerShot[] = ['room', 'three-quarter', 'detail', 'grazing', 'face']

export const TOUR_INTERVAL_MS = 4200

// la plaque grandit avec le nombre de postes : la caméra recule d'autant
export const PLATE_BASE_WIDTH = 0.38
export const PLATE_SLOT_WIDTH = 0.62
export const SHOT_SCALE_PER_WIDTH = 0.4

export const CAMERA_DAMPING = 0.06
export const AMBIANCE_DAMPING = 0.06
export const WALL_FADE = 0.05
export const COLOR_DAMPING = 0.12
export const LAMP_DAMPING = 0.1
export const ROCKER_DAMPING = 0.22
export const ROCKER_UP = -0.2
export const ROCKER_DOWN = 0.2

// orbite au glissement : butées (radians) et vitesse (rad/px)
export const ORBIT_SPEED = 0.006
export const ORBIT_LIMIT_YAW = 0.9
export const ORBIT_LIMIT_PITCH = 0.45

// flottement léger de la caméra pendant la visite
export const SWAY_AMPLITUDE = 0.12
export const SWAY_SPEED = 0.0004

export const CLICK_THRESHOLD_PX = 4
export const MAX_PIXEL_RATIO = 2
export const SHADOW_MAP_SIZE = 1024

// zoom : 1 = plan d'origine, plus grand = plus près ; déplacement maximal (unités de scène)
export const ZOOM_MIN = VIEWER_ZOOM.min
export const ZOOM_MAX = VIEWER_ZOOM.max
export const ZOOM_WHEEL_STEP = 0.0015
export const PAN_LIMIT = 3
