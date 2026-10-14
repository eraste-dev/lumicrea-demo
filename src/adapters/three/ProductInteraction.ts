import { MathUtils } from 'three'
import {
  CLICK_THRESHOLD,
  DRAG_LIMIT_X,
  DRAG_LIMIT_Y,
  DRAG_RETURN,
  DRAG_SPEED,
  HOVER_DAMPING,
  SPIN_COOLDOWN,
  SPIN_DURATION,
  SPIN_PUSH
} from './constants'

// État calculé à chaque image, lu par le moteur de rendu.
export interface InteractionFrame {
  // 0 → 1 selon que le pointeur est sur la scène
  hoverMix: number
  // position du pointeur dans le canvas, de -1 à 1 (y vers le bas)
  localX: number
  localY: number
  // rotation ajoutée par le glissement et par le tour d'intro
  offsetY: number
  offsetX: number
  // recul de caméra pendant le tour d'intro
  cameraPush: number
}

// Gère la souris sur le canvas : survol (tour d'intro), glissement pour tourner,
// clic sur la touche. Pas de Three.js ici, le test "est-ce la touche ?" est injecté.
export class ProductInteraction {
  private localX = 0
  private localY = 0
  private hoverMix = 0
  private isHovering = false

  private isDragging = false
  private dragX = 0
  private dragY = 0
  private lastClient = { x: 0, y: 0 }
  private travelled = 0

  private spinStart: number | null = null
  private lastSpin = -Infinity

  constructor(
    private readonly el: HTMLElement,
    // coordonnées normalisées (-1 → 1, y vers le haut)
    private readonly isOverRocker: (x: number, y: number) => boolean,
    // appelé quand on clique (sans glisser) sur la touche
    private readonly onRockerClick: () => void
  ) {}

  attach() {
    this.el.style.cursor = 'grab'
    this.el.addEventListener('pointerenter', this.onEnter)
    this.el.addEventListener('pointerleave', this.onLeave)
    this.el.addEventListener('pointermove', this.onMove)
    this.el.addEventListener('pointerdown', this.onDown)
    this.el.addEventListener('pointerup', this.onUp)
    this.el.addEventListener('pointercancel', this.onUp)
  }

  detach() {
    this.el.removeEventListener('pointerenter', this.onEnter)
    this.el.removeEventListener('pointerleave', this.onLeave)
    this.el.removeEventListener('pointermove', this.onMove)
    this.el.removeEventListener('pointerdown', this.onDown)
    this.el.removeEventListener('pointerup', this.onUp)
    this.el.removeEventListener('pointercancel', this.onUp)
  }

  update(now: number): InteractionFrame {
    this.hoverMix = MathUtils.lerp(this.hoverMix, this.isHovering ? 1 : 0, HOVER_DAMPING)

    // une fois relâchée, la plaque revient doucement à sa pose
    if (!this.isDragging) {
      this.dragX *= DRAG_RETURN
      this.dragY *= DRAG_RETURN
    }

    let spinY = 0
    let cameraPush = 0
    if (this.spinStart !== null) {
      const t = (now - this.spinStart) / SPIN_DURATION
      if (t >= 1) {
        this.spinStart = null
      } else {
        spinY = easeInOutCubic(t) * Math.PI * 2
        cameraPush = Math.sin(Math.PI * t) * SPIN_PUSH
      }
    }

    return {
      hoverMix: this.hoverMix,
      localX: this.localX,
      localY: this.localY,
      offsetY: this.dragY + spinY,
      offsetX: this.dragX,
      cameraPush
    }
  }

  private toLocal(event: PointerEvent) {
    const rect = this.el.getBoundingClientRect()
    this.localX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.localY = ((event.clientY - rect.top) / rect.height) * 2 - 1
  }

  private onEnter = (event: PointerEvent) => {
    this.isHovering = true
    this.toLocal(event)

    // petit film d'intro, pas plus d'une fois toutes les quelques secondes
    const now = performance.now()
    if (!this.isDragging && now - this.lastSpin > SPIN_COOLDOWN) {
      this.spinStart = now
      this.lastSpin = now
    }
  }

  private onLeave = () => {
    this.isHovering = false
  }

  private onMove = (event: PointerEvent) => {
    this.toLocal(event)

    if (this.isDragging) {
      const dx = event.clientX - this.lastClient.x
      const dy = event.clientY - this.lastClient.y
      this.travelled += Math.abs(dx) + Math.abs(dy)
      this.lastClient = { x: event.clientX, y: event.clientY }

      this.dragY = MathUtils.clamp(this.dragY + dx * DRAG_SPEED, -DRAG_LIMIT_Y, DRAG_LIMIT_Y)
      this.dragX = MathUtils.clamp(this.dragX + dy * DRAG_SPEED, -DRAG_LIMIT_X, DRAG_LIMIT_X)
      return
    }

    this.el.style.cursor = this.isOverRocker(this.localX, -this.localY) ? 'pointer' : 'grab'
  }

  private onDown = (event: PointerEvent) => {
    this.isDragging = true
    this.travelled = 0
    this.lastClient = { x: event.clientX, y: event.clientY }
    this.spinStart = null
    this.el.setPointerCapture(event.pointerId)
    this.el.style.cursor = 'grabbing'
  }

  private onUp = (event: PointerEvent) => {
    if (!this.isDragging) return
    this.isDragging = false
    if (this.el.hasPointerCapture(event.pointerId)) this.el.releasePointerCapture(event.pointerId)

    // peu de mouvement = un clic : si c'est sur la touche, on prévient l'appelant
    const isClick = this.travelled < CLICK_THRESHOLD
    if (isClick && this.isOverRocker(this.localX, -this.localY)) {
      this.onRockerClick()
    }
    this.el.style.cursor = this.isOverRocker(this.localX, -this.localY) ? 'pointer' : 'grab'
  }
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
