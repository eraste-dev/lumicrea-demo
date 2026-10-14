import { MathUtils } from 'three'
import {
  CLICK_THRESHOLD_PX,
  ORBIT_LIMIT_PITCH,
  ORBIT_LIMIT_YAW,
  ORBIT_SPEED,
  PAN_LIMIT,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_WHEEL_STEP
} from './viewerConfig'

// retour lent de l'orbite à la pose du plan quand on relâche
const ORBIT_RETURN = 0.015

export interface ViewerControlsHooks {
  // le pointeur est-il sur un élément cliquable de la scène ?
  isOverTarget: (event: PointerEvent) => boolean
  onClick: () => void
  // l'utilisateur prend la main : la visite automatique doit s'arrêter
  onInteract: () => void
  onZoomChange: (zoom: number) => void
  // taille d'un pixel d'écran dans la scène (pour que le déplacement suive le doigt)
  unitsPerPixel: () => number
  reducedMotion: boolean
  // vrai : la molette zoome toujours ; faux : seulement avec Ctrl / pincement du pavé tactile
  captureWheel: boolean
}

// Glisser = tourner · Maj ou clic droit + glisser = déplacer · molette / pincement / boutons = zoom
// · double-clic = recentrer. Ne touche pas à Three.js : il expose juste l'état (orbite, déplacement, zoom).
export class ViewerControls {
  orbit = { yaw: 0, pitch: 0 }
  pan = { x: 0, y: 0 }
  zoom = 1

  private pointers = new Map<number, { x: number, y: number }>()
  private pinchDistance = 0
  private dragMoved = 0
  private mode: 'orbit' | 'pan' | null = null

  constructor(private readonly element: HTMLElement, private readonly hooks: ViewerControlsHooks) {}

  get isDragging(): boolean {
    return this.mode !== null
  }

  attach() {
    const el = this.element
    el.addEventListener('pointerdown', this.onPointerDown)
    el.addEventListener('pointermove', this.onPointerMove)
    el.addEventListener('pointerup', this.onPointerUp)
    el.addEventListener('pointercancel', this.onPointerCancel)
    el.addEventListener('wheel', this.onWheel, { passive: false })
    el.addEventListener('dblclick', this.reset)
    el.addEventListener('contextmenu', this.onContextMenu)
  }

  detach() {
    const el = this.element
    el.removeEventListener('pointerdown', this.onPointerDown)
    el.removeEventListener('pointermove', this.onPointerMove)
    el.removeEventListener('pointerup', this.onPointerUp)
    el.removeEventListener('pointercancel', this.onPointerCancel)
    el.removeEventListener('wheel', this.onWheel)
    el.removeEventListener('dblclick', this.reset)
    el.removeEventListener('contextmenu', this.onContextMenu)
  }

  // à appeler à chaque image
  update() {
    if (this.isDragging) return
    this.orbit.yaw = MathUtils.lerp(this.orbit.yaw, 0, ORBIT_RETURN)
    this.orbit.pitch = MathUtils.lerp(this.orbit.pitch, 0, ORBIT_RETURN)
  }

  setZoom(zoom: number, notify = true) {
    const next = MathUtils.clamp(zoom, ZOOM_MIN, ZOOM_MAX)
    if (next === this.zoom) return
    this.zoom = next
    if (notify) this.hooks.onZoomChange(next)
  }

  resetOrbit() {
    this.orbit = { yaw: 0, pitch: 0 }
  }

  reset = () => {
    this.resetOrbit()
    this.pan = { x: 0, y: 0 }
    this.setZoom(1)
  }

  private onContextMenu = (event: Event) => event.preventDefault()

  private onWheel = (event: WheelEvent) => {
    // sans capture, la molette défile la page ; Ctrl ou pincement zoome
    if (!this.hooks.captureWheel && !event.ctrlKey) return
    event.preventDefault()
    this.hooks.onInteract()
    this.setZoom(this.zoom * Math.exp(-event.deltaY * ZOOM_WHEEL_STEP * (event.ctrlKey ? 3 : 1)))
  }

  private onPointerDown = (event: PointerEvent) => {
    this.element.setPointerCapture(event.pointerId)
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (this.pointers.size === 2) {
      // deuxième doigt : on passe en pincement
      this.mode = null
      this.pinchDistance = this.currentPinchDistance()
      return
    }
    this.dragMoved = 0
    this.mode = event.button === 2 || event.shiftKey || event.button === 1 ? 'pan' : 'orbit'
  }

  private onPointerMove = (event: PointerEvent) => {
    const previous = this.pointers.get(event.pointerId)
    if (!previous) {
      this.element.style.cursor = this.hooks.isOverTarget(event) ? 'pointer' : 'grab'
      return
    }
    const dx = event.clientX - previous.x
    const dy = event.clientY - previous.y
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (this.pointers.size === 2) return this.handlePinch()
    if (!this.mode) return

    this.dragMoved += Math.abs(dx) + Math.abs(dy)
    if (this.dragMoved <= CLICK_THRESHOLD_PX || this.hooks.reducedMotion) return
    this.hooks.onInteract()

    if (this.mode === 'pan') {
      const unit = this.hooks.unitsPerPixel()
      this.pan.x = MathUtils.clamp(this.pan.x - dx * unit, -PAN_LIMIT, PAN_LIMIT)
      this.pan.y = MathUtils.clamp(this.pan.y + dy * unit, -PAN_LIMIT, PAN_LIMIT)
      return
    }
    this.orbit.yaw = MathUtils.clamp(this.orbit.yaw - dx * ORBIT_SPEED, -ORBIT_LIMIT_YAW, ORBIT_LIMIT_YAW)
    this.orbit.pitch = MathUtils.clamp(this.orbit.pitch - dy * ORBIT_SPEED, -ORBIT_LIMIT_PITCH, ORBIT_LIMIT_PITCH)
  }

  private onPointerUp = (event: PointerEvent) => {
    const wasClick = this.mode === 'orbit' && this.dragMoved <= CLICK_THRESHOLD_PX
    this.pointers.delete(event.pointerId)
    this.mode = null
    if (wasClick && this.hooks.isOverTarget(event)) this.hooks.onClick()
  }

  private onPointerCancel = (event: PointerEvent) => {
    this.pointers.delete(event.pointerId)
    this.mode = null
  }

  private currentPinchDistance(): number {
    const [a, b] = [...this.pointers.values()]
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
  }

  private handlePinch() {
    const distance = this.currentPinchDistance()
    if (!this.pinchDistance || !distance) return
    this.hooks.onInteract()
    this.setZoom(this.zoom * (distance / this.pinchDistance))
    this.pinchDistance = distance
  }
}
