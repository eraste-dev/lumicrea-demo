import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three'
import type { MechanismShape } from '~/data/mechanisms'
import type {
  ProductViewer,
  ProductViewerOptions,
  ViewerAmbiance,
  ViewerFinish,
  ViewerShot
} from '~/domain/scene/ProductViewer'
import { buildProduct, type BuiltProduct, type ProductMaterials } from './productMeshes'
import {
  createBrushedTexture,
  createContactShadowTexture,
  createFloorTexture,
  createLightPoolTexture,
  createMirrorTexture,
  createWallTextures,
  type WallTextures
} from './roomTextures'
import { createStudioEnvironment } from './studioEnvironment'
import { ViewerControls } from './ViewerControls'
import {
  AMBIANCES,
  AMBIANCE_DAMPING,
  CAMERA_DAMPING,
  COLOR_DAMPING,
  LAMP_DAMPING,
  MAX_PIXEL_RATIO,
  ROCKER_DAMPING,
  ROCKER_DOWN,
  ROCKER_UP,
  SHADOW_MAP_SIZE,
  SHOT_SCALE_PER_WIDTH,
  SHOTS,
  SWAY_AMPLITUDE,
  SWAY_SPEED,
  TOUR_INTERVAL_MS,
  TOUR_SEQUENCE,
  WALL_FADE,
  type AmbianceSetting,
  type WallStyle
} from './viewerConfig'

const WALL_SIZE = { width: 16, height: 9 }
const FLOOR_Y = -2.7
// puissance de l'applique (candelas) pour 1 unité d'intensité d'ambiance
const LAMP_POWER = 3.5
const LAMP_POSITION = new Vector3(3.4, 0.7, 0.9)
const LAMP_POOL_SIZE = 7
const LAMP_POOL_GAIN = 0.07
// la texture d'ombre occupe 45 % de son carré : on agrandit le plan en conséquence
const SHADOW_TEXTURE_RATIO = 0.297
const SHADOW_MARGIN = 0.1
const SHADOW_OFFSET = { x: 0.03, y: -0.05 }
const BRUSHED_BUMP = 0.22

const WALL_SURFACE: Record<WallStyle, { roughness: number, bumpScale: number }> = {
  plaster: { roughness: 0.92, bumpScale: 3 },
  concrete: { roughness: 0.88, bumpScale: 4 },
  marble: { roughness: 0.22, bumpScale: 0.3 }
}

export class ThreeProductViewer implements ProductViewer {
  private renderer?: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(30, 1, 0.1, 60)
  private container?: HTMLElement
  private resizeObserver?: ResizeObserver
  private visibilityObserver?: IntersectionObserver
  private pmrem?: PMREMGenerator
  private controls?: ViewerControls

  private materials: ProductMaterials & { finish: MeshPhysicalMaterial }
  private roomMaterials: Array<MeshStandardMaterial | MeshBasicMaterial> = []
  private roomGeometries: BufferGeometry[] = []
  private textures = new Map<WallStyle, WallTextures>()
  private floorTexture?: ReturnType<typeof createFloorTexture>
  private brushedTexture?: ReturnType<typeof createBrushedTexture>
  private extraTextures: Array<{ dispose: () => void }> = []

  private product?: BuiltProduct
  private keyLight = new DirectionalLight('#ffffff', 3)
  private fillLight = new DirectionalLight('#ffffff', 1)
  private lampLight = new PointLight('#ffb067', 0, 16, 2)
  private lampShade?: MeshStandardMaterial
  private lampPool?: Mesh<PlaneGeometry, MeshBasicMaterial>
  private contactShadow?: Mesh<PlaneGeometry, MeshBasicMaterial>
  private wallBack?: Mesh<PlaneGeometry, MeshStandardMaterial>
  private wallFront?: Mesh<PlaneGeometry, MeshStandardMaterial>
  private floor?: Mesh<PlaneGeometry, MeshStandardMaterial>
  private wallFading = false
  private wallStyle?: WallStyle

  // état courant des lumières (lissé vers `target`)
  private current: AmbianceSetting = { ...AMBIANCES.studio }
  private target: AmbianceSetting = { ...AMBIANCES.studio }
  private colors = { wall: new Color(), floor: new Color(), key: new Color() }
  private finishTarget = new Color('#a88a4a')

  private shot: ViewerShot = 'three-quarter'
  private cameraTarget = new Vector3()
  private lookTarget = new Vector3()
  private look = new Vector3()
  private isTourPlaying = false
  private lastShotAt = 0
  private lampOn = true
  private lampMix = 1
  private isVisible = false
  private hasFinish = false
  private raycaster = new Raycaster()

  constructor(private readonly options: ProductViewerOptions) {
    this.materials = {
      finish: new MeshPhysicalMaterial({ color: '#a88a4a', metalness: 0.8, roughness: 0.5 }),
      dark: new MeshStandardMaterial({ color: '#0b0b0c', roughness: 0.85 }),
      steel: new MeshStandardMaterial({ color: '#c9ccd0', metalness: 1, roughness: 0.28 }),
      hole: new MeshBasicMaterial({ color: '#000000' })
    }
  }

  mount(container: HTMLElement): void {
    this.container = container

    // peut lever si WebGL n'est pas dispo : le composant gère le repli
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFShadowMap
    container.appendChild(this.renderer.domElement)

    this.buildEnvironment()
    this.buildRoom()
    this.buildLights()
    this.setAmbiance('studio')
    this.setShot(this.shot)

    this.controls = new ViewerControls(this.renderer.domElement, {
      isOverTarget: event => this.isOverRocker(event),
      onClick: () => {
        this.lampOn = !this.lampOn
        this.options.onSwitch?.()
      },
      onInteract: () => this.options.onUserInteract?.(),
      onZoomChange: zoom => this.options.onZoomChange?.(zoom),
      unitsPerPixel: () => this.unitsPerPixel(),
      reducedMotion: this.options.reducedMotion,
      captureWheel: this.options.captureWheel
    })
    this.controls.attach()
    this.renderer.domElement.style.touchAction = 'pan-y'
    this.snapCamera()

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry?.isIntersecting ?? false
      this.renderer?.setAnimationLoop(this.isVisible ? this.tick : null)
    })
    this.visibilityObserver.observe(container)

    this.resize()
  }

  setProduct(shapes: MechanismShape[]): void {
    if (this.product) {
      this.scene.remove(this.product.group)
      for (const geometry of this.product.geometries) geometry.dispose()
    }
    this.product = buildProduct(shapes, this.materials)
    this.scene.add(this.product.group)
    for (const rocker of this.product.rockers) rocker.rotation.x = this.lampOn ? ROCKER_UP : ROCKER_DOWN
    this.fitContactShadow(this.product.width)
    this.renderOnce()
  }

  setFinish(finish: ViewerFinish): void {
    const material = this.materials.finish
    this.finishTarget.set(finish.tone)
    material.metalness = finish.metalness
    material.roughness = finish.roughness
    this.applyBrushing(Boolean(finish.brushed))

    // premier appel ou hors écran : pas de transition
    if (!this.hasFinish || this.options.reducedMotion || !this.isVisible) {
      material.color.copy(this.finishTarget)
      this.hasFinish = true
      this.renderOnce()
    }
  }

  setShot(shot: ViewerShot): void {
    this.shot = shot
    this.lastShotAt = performance.now()
    this.controls?.resetOrbit()
    if (this.options.reducedMotion) this.snapCamera()
  }

  setZoom(zoom: number): void {
    // l'interface est déjà à jour : on ne renvoie pas l'événement
    this.controls?.setZoom(zoom, false)
  }

  resetView(): void {
    this.controls?.reset()
  }

  setAmbiance(ambiance: ViewerAmbiance): void {
    const next = AMBIANCES[ambiance]
    this.target = { ...next }
    this.colors.wall.set(next.wallColor)
    this.colors.floor.set(next.floorColor)
    this.colors.key.set(next.keyColor)

    if (!this.wallBack || !this.wallFront) return
    if (this.wallStyle === undefined) {
      // première ambiance : appliquée directement
      this.current = { ...next }
      this.applyWallStyle(this.wallBack.material, next.wall)
      this.wallBack.material.color.copy(this.colors.wall)
      this.wallStyle = next.wall
    } else if (next.wall !== this.wallStyle) {
      this.applyWallStyle(this.wallFront.material, next.wall)
      this.wallFront.material.color.copy(this.colors.wall)
      this.wallFront.material.opacity = 0
      this.wallFront.visible = true
      this.wallFading = true
      this.wallStyle = next.wall
    }
    if (this.options.reducedMotion || !this.isVisible) this.current = { ...next }
    this.renderOnce()
  }

  setTourPlaying(isPlaying: boolean): void {
    if (this.options.reducedMotion) return
    this.isTourPlaying = isPlaying
    this.lastShotAt = performance.now()
  }

  dispose(): void {
    this.renderer?.setAnimationLoop(null)
    this.resizeObserver?.disconnect()
    this.visibilityObserver?.disconnect()
    this.controls?.detach()

    for (const geometry of [...this.roomGeometries, ...(this.product?.geometries ?? [])]) geometry.dispose()
    for (const material of [...this.roomMaterials, this.materials.finish, this.materials.dark, this.materials.steel, this.materials.hole]) {
      material.dispose()
    }
    for (const { color, bump } of this.textures.values()) {
      color.dispose()
      bump.dispose()
    }
    for (const texture of this.extraTextures) texture.dispose()
    this.floorTexture?.dispose()
    this.brushedTexture?.dispose()
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
    const studio = createStudioEnvironment()
    this.scene.environment = this.pmrem.fromScene(studio, 0.02).texture
    // la scène source n'est plus utile une fois convertie en cube de reflets
    studio.traverse((object) => {
      if (object instanceof Mesh) {
        object.geometry.dispose()
        ;(object.material as MeshBasicMaterial).dispose()
      }
    })
  }

  private track<T extends BufferGeometry>(geometry: T): T {
    this.roomGeometries.push(geometry)
    return geometry
  }

  private standard(parameters: ConstructorParameters<typeof MeshStandardMaterial>[0]): MeshStandardMaterial {
    const material = new MeshStandardMaterial(parameters)
    this.roomMaterials.push(material)
    return material
  }

  private basic(parameters: ConstructorParameters<typeof MeshBasicMaterial>[0]): MeshBasicMaterial {
    const material = new MeshBasicMaterial(parameters)
    this.roomMaterials.push(material)
    return material
  }

  private buildRoom() {
    const wallGeometry = this.track(new PlaneGeometry(WALL_SIZE.width, WALL_SIZE.height))

    this.wallBack = new Mesh(wallGeometry, this.standard({}))
    this.wallBack.receiveShadow = true
    // second mur légèrement devant : sert au fondu entre deux matières
    this.wallFront = new Mesh(wallGeometry, this.standard({ transparent: true, opacity: 0 }))
    this.wallFront.position.z = 0.002
    this.wallFront.receiveShadow = true
    this.wallFront.visible = false

    this.floorTexture = createFloorTexture()
    this.floor = new Mesh(
      this.track(new PlaneGeometry(WALL_SIZE.width, 14)),
      this.standard({ map: this.floorTexture, roughness: 0.45 })
    )
    this.floor.rotation.x = -Math.PI / 2
    this.floor.position.set(0, FLOOR_Y, 6)
    this.floor.receiveShadow = true

    const baseboard = new Mesh(
      this.track(new PlaneGeometry(WALL_SIZE.width, 0.35)),
      this.standard({ color: '#f1efe9', roughness: 0.5 })
    )
    baseboard.position.set(0, FLOOR_Y + 0.175, 0.01)
    baseboard.receiveShadow = true

    this.buildContactShadow()
    this.buildLampPool()
    this.scene.add(this.wallBack, this.wallFront, this.floor, baseboard, this.buildMirror(), this.buildSconce())
  }

  // fausse occlusion ambiante autour de la plaque
  private buildContactShadow() {
    const texture = createContactShadowTexture()
    this.extraTextures.push(texture)
    this.contactShadow = new Mesh(
      this.track(new PlaneGeometry(1, 1)),
      this.basic({ map: texture, transparent: true, opacity: 0.42, depthWrite: false })
    )
    this.contactShadow.position.z = 0.004
    this.contactShadow.renderOrder = 1
    this.scene.add(this.contactShadow)
  }

  private fitContactShadow(plateWidth: number) {
    if (!this.contactShadow) return
    this.contactShadow.scale.set(
      (plateWidth + SHADOW_MARGIN) / SHADOW_TEXTURE_RATIO,
      (1 + SHADOW_MARGIN) / SHADOW_TEXTURE_RATIO,
      1
    )
    this.contactShadow.position.x = SHADOW_OFFSET.x
    this.contactShadow.position.y = SHADOW_OFFSET.y
  }

  // halo chaud de l'applique sur le mur
  private buildLampPool() {
    const texture = createLightPoolTexture()
    this.extraTextures.push(texture)
    this.lampPool = new Mesh(
      this.track(new PlaneGeometry(LAMP_POOL_SIZE, LAMP_POOL_SIZE)),
      this.basic({ map: texture, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending })
    )
    this.lampPool.position.set(LAMP_POSITION.x, LAMP_POSITION.y, 0.006)
    this.lampPool.renderOrder = 2
    this.scene.add(this.lampPool)
  }

  private mirrorTexture() {
    const texture = createMirrorTexture()
    this.extraTextures.push(texture)
    return texture
  }

  // miroir rond à cadre laiton, à gauche de la plaque
  private buildMirror(): Group {
    const group = new Group()
    const glass = new Mesh(
      this.track(new CircleGeometry(1.15, 64)),
      this.standard({ map: this.mirrorTexture(), metalness: 0.25, roughness: 0.1 })
    )
    const frame = new Mesh(
      this.track(new TorusGeometry(1.15, 0.05, 24, 96)),
      this.standard({ color: '#a88a4a', metalness: 1, roughness: 0.28 })
    )
    frame.castShadow = true
    glass.position.z = 0.02
    frame.position.z = 0.04
    group.add(glass, frame)
    group.position.set(-3.7, 0.5, 0)
    return group
  }

  // applique murale : la source de lumière chaude de la pièce
  private buildSconce(): Group {
    const group = new Group()
    const brass = this.standard({ color: '#a88a4a', metalness: 1, roughness: 0.28 })
    this.lampShade = this.standard({ color: '#f4e7d2', emissive: '#ffb067', emissiveIntensity: 0, roughness: 0.8, side: DoubleSide })

    const back = new Mesh(this.track(new CylinderGeometry(0.2, 0.2, 0.08, 48)), brass)
    back.rotation.x = Math.PI / 2
    back.position.z = 0.04
    back.castShadow = true

    const shade = new Mesh(this.track(new SphereGeometry(0.42, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2)), this.lampShade)
    shade.position.set(0, 0, 0.55)
    shade.rotation.x = -Math.PI / 2

    // bague laiton au bord de la vasque : la lisibilité de l'objet vue de face
    const rim = new Mesh(this.track(new TorusGeometry(0.42, 0.025, 16, 64)), brass)
    rim.position.z = 0.55
    rim.castShadow = true

    group.add(back, shade, rim)
    group.position.set(LAMP_POSITION.x, LAMP_POSITION.y, 0)
    return group
  }

  private buildLights() {
    this.keyLight.position.set(-2.2, 2.8, 5)
    this.keyLight.castShadow = true
    this.keyLight.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE)
    this.keyLight.shadow.camera.left = -4
    this.keyLight.shadow.camera.right = 4
    this.keyLight.shadow.camera.top = 4
    this.keyLight.shadow.camera.bottom = -4
    this.keyLight.shadow.radius = 5
    this.keyLight.shadow.bias = -0.0004
    this.keyLight.shadow.normalBias = 0.02
    // ombre portée plus douce : l'ombre de contact fait le gros du travail
    this.keyLight.shadow.intensity = 0.5

    this.fillLight.position.set(2, 1, 5)
    this.lampLight.position.set(LAMP_POSITION.x, LAMP_POSITION.y, LAMP_POSITION.z + 0.4)

    this.scene.add(this.keyLight, this.fillLight, this.lampLight)
  }

  private applyWallStyle(material: MeshStandardMaterial, style: WallStyle) {
    let textures = this.textures.get(style)
    if (!textures) {
      textures = createWallTextures(style)
      this.textures.set(style, textures)
    }
    const surface = WALL_SURFACE[style]
    material.map = textures.color
    material.bumpMap = textures.bump
    material.bumpScale = surface.bumpScale
    material.roughness = surface.roughness
    material.needsUpdate = true
  }

  // métal brossé : stries fines en relief et en rugosité, sinon surface lisse
  private applyBrushing(isBrushed: boolean) {
    const material = this.materials.finish
    if (isBrushed === Boolean(material.bumpMap)) return
    if (isBrushed) {
      this.brushedTexture ??= createBrushedTexture()
      material.bumpMap = this.brushedTexture
      material.bumpScale = BRUSHED_BUMP
      material.roughnessMap = this.brushedTexture
    } else {
      material.bumpMap = null
      material.roughnessMap = null
    }
    material.needsUpdate = true
  }

  private unitsPerPixel(): number {
    const height = this.container?.clientHeight || 1
    const distance = this.camera.position.distanceTo(this.look)
    return (2 * distance * Math.tan(MathUtils.degToRad(this.camera.fov / 2))) / height
  }

  // pose cible du plan courant
  private computeShot(now: number) {
    const setting = SHOTS[this.shot]
    const width = this.product?.width ?? 1
    const scale = this.shot === 'room' ? 1 : 1 + (width - 1) * SHOT_SCALE_PER_WIDTH
    const sway = this.isTourPlaying ? SWAY_AMPLITUDE : 0
    const zoom = this.controls?.zoom ?? 1
    const pan = this.controls?.pan ?? { x: 0, y: 0 }
    const orbit = this.controls?.orbit ?? { yaw: 0, pitch: 0 }

    this.lookTarget.set(setting.target[0] + pan.x, setting.target[1] + pan.y, setting.target[2])
    this.cameraTarget.set(
      setting.position[0] * scale + pan.x + Math.sin(now * SWAY_SPEED) * sway,
      setting.position[1] * scale + pan.y + Math.cos(now * SWAY_SPEED * 0.8) * sway,
      setting.position[2] * scale
    )

    // zoom = rapprocher la caméra du point visé, puis orbite autour de lui
    const offset = this.cameraTarget.clone().sub(this.lookTarget).multiplyScalar(1 / zoom)
    offset.applyAxisAngle(new Vector3(0, 1, 0), orbit.yaw)
    const right = new Vector3().crossVectors(offset, new Vector3(0, 1, 0)).normalize()
    offset.applyAxisAngle(right, orbit.pitch)
    this.cameraTarget.copy(this.lookTarget).add(offset)
  }

  private snapCamera() {
    this.computeShot(performance.now())
    this.camera.position.copy(this.cameraTarget)
    this.look.copy(this.lookTarget)
    this.camera.lookAt(this.look)
  }

  private tick = () => {
    const now = performance.now()
    const isReduced = this.options.reducedMotion

    this.updateTour(now)
    this.controls?.update()
    this.computeShot(now)
    const damping = isReduced ? 1 : CAMERA_DAMPING
    this.camera.position.lerp(this.cameraTarget, damping)
    this.look.lerp(this.lookTarget, damping)
    this.camera.lookAt(this.look)

    this.materials.finish.color.lerp(this.finishTarget, isReduced ? 1 : COLOR_DAMPING)
    this.updateLighting(isReduced)
    this.updateRockers()

    this.renderer?.render(this.scene, this.camera)
  }

  private updateTour(now: number) {
    if (!this.isTourPlaying || this.controls?.isDragging || now - this.lastShotAt < TOUR_INTERVAL_MS) return
    const index = TOUR_SEQUENCE.indexOf(this.shot)
    const next = TOUR_SEQUENCE[(index + 1) % TOUR_SEQUENCE.length]!
    this.setShot(next)
    this.options.onShotChange?.(next)
  }

  private updateLighting(isReduced: boolean) {
    const k = isReduced ? 1 : AMBIANCE_DAMPING
    const c = this.current
    const t = this.target
    c.environment = MathUtils.lerp(c.environment, t.environment, k)
    c.exposure = MathUtils.lerp(c.exposure, t.exposure, k)
    c.key = MathUtils.lerp(c.key, t.key, k)
    c.fill = MathUtils.lerp(c.fill, t.fill, k)
    c.lamp = MathUtils.lerp(c.lamp, t.lamp, k)
    this.lampMix = MathUtils.lerp(this.lampMix, this.lampOn ? 1 : 0, isReduced ? 1 : LAMP_DAMPING)

    this.scene.environmentIntensity = c.environment
    if (this.renderer) this.renderer.toneMappingExposure = c.exposure
    this.keyLight.intensity = c.key
    this.fillLight.intensity = c.fill
    this.keyLight.color.lerp(this.colors.key, k)
    const lamp = c.lamp * this.lampMix
    this.lampLight.intensity = lamp * LAMP_POWER
    if (this.lampShade) this.lampShade.emissiveIntensity = Math.min(1.6, lamp * 0.18)
    if (this.lampPool) this.lampPool.material.opacity = Math.min(0.85, lamp * LAMP_POOL_GAIN)

    this.floor?.material.color.lerp(this.colors.floor, k)
    if (this.wallBack) this.wallBack.material.color.lerp(this.colors.wall, k)
    this.updateWallFade()
  }

  private updateWallFade() {
    if (!this.wallFading || !this.wallFront || !this.wallBack) return
    const front = this.wallFront.material
    front.opacity = Math.min(1, front.opacity + WALL_FADE)
    front.color.lerp(this.colors.wall, 0.1)
    if (front.opacity < 1) return

    // fondu terminé : le mur du fond prend la matière du mur de devant
    const back = this.wallBack.material
    back.map = front.map
    back.bumpMap = front.bumpMap
    back.bumpScale = front.bumpScale
    back.roughness = front.roughness
    back.color.copy(front.color)
    back.needsUpdate = true
    this.wallFront.visible = false
    this.wallFading = false
  }

  private updateRockers() {
    const goal = this.lampOn ? ROCKER_UP : ROCKER_DOWN
    for (const rocker of this.product?.rockers ?? []) {
      rocker.rotation.x = MathUtils.lerp(rocker.rotation.x, goal, ROCKER_DAMPING)
    }
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

  private renderOnce() {
    if (!this.renderer) return
    this.camera.lookAt(this.look)
    this.renderer.render(this.scene, this.camera)
  }

  private isOverRocker(event: PointerEvent): boolean {
    if (!this.renderer || !this.product) return false
    const rect = this.renderer.domElement.getBoundingClientRect()
    const ndc = new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    )
    this.raycaster.setFromCamera(ndc, this.camera)
    return this.raycaster.intersectObjects(this.product.rockers).length > 0
  }
}
