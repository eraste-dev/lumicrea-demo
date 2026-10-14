import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { Finish } from '~/domain/product/Finish'
import type { SceneRenderer, SceneRendererOptions } from '~/domain/scene/SceneRenderer'
import { ProductInteraction } from './ProductInteraction'
import {
  CAMERA_DAMPING,
  CAMERA_FAR,
  CAMERA_NEAR,
  COLOR_DAMPING,
  HOVER_TILT,
  LIGHT_REACH,
  LIGHTS_DAY,
  LIGHTS_FADE,
  LIGHTS_NIGHT,
  MAX_PIXEL_RATIO,
  ROCKER_DAMPING,
  ROCKER_DOWN,
  ROCKER_UP,
  STORY_TILT,
  STORY_TURN,
  TILT_DAMPING,
  TILT_RANGE
} from './constants'

// Vue "trois quarts légèrement plongeante" de départ
const BASE_ROTATION = { x: 0.18, y: -0.4 }

// position de départ de la lumière principale (haut-gauche, rasante)
const KEY_LIGHT_BASE = { x: -2.5, y: 2.5, z: 2 }

export class ThreeSceneRenderer implements SceneRenderer {
  private renderer?: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(30, 1, 0.1, 20)
  private product = new Group()
  private material = new MeshPhysicalMaterial()
  private meshes: Mesh[] = []
  private rocker?: Mesh
  private keyLight?: DirectionalLight
  private fillLight?: DirectionalLight
  private warmLight?: PointLight
  private interaction?: ProductInteraction
  private raycaster = new Raycaster()
  // rotation lissée, avant ajout du glissement et du tour d'intro
  private rotation = { x: BASE_ROTATION.x, y: BASE_ROTATION.y }
  private pmrem?: PMREMGenerator
  private container?: HTMLElement
  private resizeObserver?: ResizeObserver
  private visibilityObserver?: IntersectionObserver

  private targetColor = new Color()
  private pointer = { x: 0, y: 0 }
  private progress = 0
  private isLightOn = true
  // 0 = plein jour, 1 = soirée : fondu entre les deux éclairages
  private nightMix = 0
  private isVisible = false

  constructor(private readonly options: SceneRendererOptions) {}

  mount(container: HTMLElement): void {
    this.container = container

    // peut lever si WebGL n'est pas dispo : c'est le composant qui gère le repli
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1
    container.appendChild(this.renderer.domElement)

    this.buildEnvironment()
    this.buildProduct()
    this.buildLights()

    this.camera.position.set(0, 0, CAMERA_FAR)

    this.watchSize()
    this.watchVisibility()
    // mouvement réduit : aucune interaction au pointeur
    if (!this.options.reducedMotion) {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true })
      this.interaction = new ProductInteraction(
        this.renderer.domElement,
        this.isOverRocker,
        () => this.options.onSwitch?.()
      )
      this.interaction.attach()
    }

    this.resize()
    this.renderer.render(this.scene, this.camera)
  }

  setFinish(finish: Finish): void {
    this.targetColor.set(finish.tone)
    this.material.metalness = finish.metalness
    this.material.roughness = finish.roughness

    // première application ou mouvement réduit : pas de transition
    if (this.options.reducedMotion || !this.isVisible) {
      this.material.color.copy(this.targetColor)
      this.renderOnce()
    }
  }

  setLightOn(isOn: boolean): void {
    this.isLightOn = isOn
    // hors écran ou mouvement réduit : tout saute directement à sa position finale
    if (this.options.reducedMotion || !this.isVisible) {
      if (this.rocker) this.rocker.rotation.x = isOn ? ROCKER_UP : ROCKER_DOWN
      this.nightMix = isOn ? 0 : 1
      this.applyLighting()
      this.renderOnce()
    }
  }

  setProgress(progress: number): void {
    // mouvement réduit : la caméra ne bouge pas avec le scroll
    if (this.options.reducedMotion) return
    this.progress = MathUtils.clamp(progress, 0, 1)
  }

  dispose(): void {
    this.renderer?.setAnimationLoop(null)
    window.removeEventListener('pointermove', this.onPointerMove)
    this.interaction?.detach()
    this.resizeObserver?.disconnect()
    this.visibilityObserver?.disconnect()

    for (const mesh of this.meshes) mesh.geometry.dispose()
    this.material.dispose()
    this.scene.environment?.dispose()
    this.pmrem?.dispose()

    if (this.renderer) {
      this.renderer.domElement.remove()
      this.renderer.dispose()
    }
  }

  private buildEnvironment() {
    if (!this.renderer) return
    this.pmrem = new PMREMGenerator(this.renderer)
    // environnement de studio généré en code : pas de HDR à charger pour l'instant
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 1.1
  }

  private buildProduct() {
    this.material.clearcoat = 0
    this.material.color.set('#7a5a3c')

    // plaque 1 poste, unité = largeur de la plaque
    const plate = new Mesh(new RoundedBoxGeometry(1, 1, 0.09, 6, 0.018), this.material)

    // touche : légèrement inclinée, comme un interrupteur à bascule
    const rocker = new Mesh(new RoundedBoxGeometry(0.44, 0.6, 0.06, 6, 0.014), this.material)
    rocker.position.z = 0.07
    rocker.rotation.x = ROCKER_UP

    this.rocker = rocker
    this.meshes = [plate, rocker]
    this.product.add(plate, rocker)
    this.product.rotation.set(BASE_ROTATION.x, BASE_ROTATION.y, 0)
    this.scene.add(this.product)
  }

  private buildLights() {
    // lumière rasante haut-gauche pour faire sortir le brossé
    const key = new DirectionalLight('#fff4e6', 3.2)
    key.position.set(KEY_LIGHT_BASE.x, KEY_LIGHT_BASE.y, KEY_LIGHT_BASE.z)
    this.keyLight = key
    this.scene.add(key)

    // appoint de face, pour que la plaque ne tombe pas dans le noir
    const fill = new DirectionalLight('#ffffff', LIGHTS_DAY.fill)
    fill.position.set(1.5, 0.5, 3)
    this.fillLight = fill
    this.scene.add(fill)

    // lueur chaude, éteinte en plein jour : c'est elle qui éclaire la plaque le soir
    const warm = new PointLight('#ffb067', 0, 8, 2)
    warm.position.set(0.3, 0.5, 1.9)
    this.warmLight = warm
    this.scene.add(warm)
  }

  private watchSize() {
    if (!this.container) return
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(this.container)
  }

  // on ne rend que lorsque la scène est à l'écran
  private watchVisibility() {
    if (!this.container) return
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry?.isIntersecting ?? false
      this.renderer?.setAnimationLoop(this.isVisible ? this.tick : null)
    })
    this.visibilityObserver.observe(this.container)
  }

  private resize() {
    if (!this.renderer || !this.container) return
    const { clientWidth: width, clientHeight: height } = this.container
    if (!width || !height) return

    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderOnce()
  }

  private onPointerMove = (event: PointerEvent) => {
    // -1 → 1 sur toute la fenêtre
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = (event.clientY / window.innerHeight) * 2 - 1
  }

  // vrai si le pointeur (coordonnées normalisées, y vers le haut) est sur la touche
  private isOverRocker = (x: number, y: number): boolean => {
    if (!this.rocker) return false
    this.raycaster.setFromCamera(new Vector2(x, y), this.camera)
    return this.raycaster.intersectObject(this.rocker).length > 0
  }

  private tick = () => {
    this.material.color.lerp(this.targetColor, COLOR_DAMPING)

    const frame = this.interaction?.update(performance.now())
    const hover = frame?.hoverMix ?? 0

    // pointeur sur la fenêtre = ambiance, sur la scène = contrôle direct
    const tiltY = MathUtils.lerp(this.pointer.x * TILT_RANGE, (frame?.localX ?? 0) * HOVER_TILT, hover)
    const tiltX = MathUtils.lerp(this.pointer.y * TILT_RANGE, (frame?.localY ?? 0) * HOVER_TILT, hover)

    const goalY = BASE_ROTATION.y + this.progress * STORY_TURN + tiltY
    const goalX = BASE_ROTATION.x - this.progress * STORY_TILT + tiltX
    this.rotation.y = MathUtils.lerp(this.rotation.y, goalY, TILT_DAMPING)
    this.rotation.x = MathUtils.lerp(this.rotation.x, goalX, TILT_DAMPING)
    this.product.rotation.y = this.rotation.y + (frame?.offsetY ?? 0)
    this.product.rotation.x = this.rotation.x + (frame?.offsetX ?? 0)

    const goalZ = MathUtils.lerp(CAMERA_FAR, CAMERA_NEAR, this.progress) - (frame?.cameraPush ?? 0)
    this.camera.position.z = MathUtils.lerp(this.camera.position.z, goalZ, CAMERA_DAMPING)

    this.updateRocker(!this.isLightOn)
    this.updateLight(hover, frame?.localX ?? 0, frame?.localY ?? 0)

    this.renderer?.render(this.scene, this.camera)
  }

  private updateRocker(isDown: boolean) {
    if (!this.rocker) return
    const goal = isDown ? ROCKER_DOWN : ROCKER_UP
    this.rocker.rotation.x = MathUtils.lerp(this.rocker.rotation.x, goal, ROCKER_DAMPING)
  }

  // au survol, la lumière suit le pointeur : le reflet glisse sur le métal
  private updateLight(hover: number, localX: number, localY: number) {
    if (this.keyLight) {
      this.keyLight.position.set(
        MathUtils.lerp(KEY_LIGHT_BASE.x, localX * LIGHT_REACH, hover),
        MathUtils.lerp(KEY_LIGHT_BASE.y, -localY * LIGHT_REACH, hover),
        KEY_LIGHT_BASE.z
      )
    }

    this.nightMix = MathUtils.lerp(this.nightMix, this.isLightOn ? 0 : 1, LIGHTS_FADE)
    this.applyLighting()
  }

  // intensités = mélange jour / soirée selon nightMix
  private applyLighting() {
    const mix = (day: number, night: number) => MathUtils.lerp(day, night, this.nightMix)
    this.scene.environmentIntensity = mix(LIGHTS_DAY.environment, LIGHTS_NIGHT.environment)
    if (this.keyLight) this.keyLight.intensity = mix(LIGHTS_DAY.key, LIGHTS_NIGHT.key)
    if (this.fillLight) this.fillLight.intensity = mix(LIGHTS_DAY.fill, LIGHTS_NIGHT.fill)
    if (this.warmLight) this.warmLight.intensity = mix(LIGHTS_DAY.warm, LIGHTS_NIGHT.warm)
  }

  private renderOnce() {
    this.renderer?.render(this.scene, this.camera)
  }
}
