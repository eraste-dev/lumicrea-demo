import { CanvasTexture, LinearFilter, RepeatWrapping, SRGBColorSpace } from 'three'
import type { WallStyle } from './viewerConfig'

const SIZE = 512

// bruit de valeur, répétable (se raccorde sur lui-même)
function hash(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 144665) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const smooth = (t: number): number => t * t * (3 - 2 * t)

function valueNoise(x: number, y: number, period: number, seed: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = smooth(x - x0)
  const fy = smooth(y - y0)
  const wrap = (v: number) => ((v % period) + period) % period
  const a = hash(wrap(x0), wrap(y0), seed)
  const b = hash(wrap(x0 + 1), wrap(y0), seed)
  const c = hash(wrap(x0), wrap(y0 + 1), seed)
  const d = hash(wrap(x0 + 1), wrap(y0 + 1), seed)
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
}

// bruit fractal : somme d'octaves, résultat dans [0, 1]
function fbm(u: number, v: number, baseFrequency: number, octaves: number, seed: number): number {
  let sum = 0
  let amplitude = 0.5
  let frequency = baseFrequency
  let total = 0
  for (let i = 0; i < octaves; i++) {
    sum += amplitude * valueNoise(u * frequency, v * frequency, frequency, seed + i)
    total += amplitude
    amplitude *= 0.5
    frequency *= 2
  }
  return sum / total
}

function makeCanvas(): { canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponible')
  return { canvas, ctx }
}

type Sampler = (u: number, v: number) => number

// remplit un canvas en niveaux de gris à partir d'une fonction (u, v) → [0, 1]
function paint(sample: Sampler): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas()
  const image = ctx.createImageData(SIZE, SIZE)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const value = clamp(sample(x / SIZE, y / SIZE), 0, 1)
      const channel = Math.round(value * 255)
      const i = (y * SIZE + x) * 4
      image.data[i] = channel
      image.data[i + 1] = channel
      image.data[i + 2] = channel
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  return canvas
}

function toTexture(canvas: HTMLCanvasElement, isColor: boolean, repeat: [number, number] = [3, 2]): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(...repeat)
  texture.anisotropy = 8
  if (isColor) texture.colorSpace = SRGBColorSpace
  return texture
}

export interface WallTextures {
  color: CanvasTexture
  // relief : accroche la lumière rasante
  bump: CanvasTexture
}

const WALL_SAMPLERS: Record<WallStyle, { color: Sampler, bump: Sampler }> = {
  // enduit : nuages doux + grain fin
  plaster: {
    color: (u, v) => 0.9 + 0.1 * fbm(u, v, 3, 4, 11) - 0.05 * fbm(u, v, 48, 2, 5),
    bump: (u, v) => 0.5 * fbm(u, v, 6, 5, 21) + 0.35 * fbm(u, v, 40, 3, 8) + 0.15 * fbm(u, v, 110, 1, 3)
  },
  // béton : variations plus marquées, grain fin, sans taches
  concrete: {
    color: (u, v) => 0.84 + 0.16 * fbm(u, v, 4, 5, 12) - 0.05 * fbm(u, v, 34, 3, 6) - 0.03 * fbm(u, v, 120, 1, 7),
    bump: (u, v) => 0.55 * fbm(u, v, 9, 5, 22) + 0.3 * fbm(u, v, 55, 3, 9) + 0.15 * fbm(u, v, 140, 1, 31)
  },
  // marbre : veines issues d'un bruit fractal déformant une sinusoïde
  marble: {
    color: (u, v) => {
      const turbulence = fbm(u, v, 3, 5, 14)
      const main = Math.abs(Math.sin(Math.PI * (u * 3 + v * 1.5 + turbulence * 3.2)))
      const fine = Math.abs(Math.sin(Math.PI * (u * 7 - v * 3 + turbulence * 5)))
      return 1 - Math.pow(1 - main, 16) * 0.42 - Math.pow(1 - fine, 22) * 0.2 - 0.06 * fbm(u, v, 8, 3, 2)
    },
    bump: (u, v) => 0.5 + 0.05 * fbm(u, v, 30, 3, 4)
  }
}

export function createWallTextures(style: WallStyle): WallTextures {
  const { color, bump } = WALL_SAMPLERS[style]
  return { color: toTexture(paint(color), true), bump: toTexture(paint(bump), false) }
}

// lames de parquet : teinte et veinage propres à chaque lame, joints sombres
export function createFloorTexture(): CanvasTexture {
  const planks = 6
  const { canvas, ctx } = makeCanvas()
  const image = ctx.createImageData(SIZE, SIZE)
  for (let y = 0; y < SIZE; y++) {
    const plank = Math.floor((y / SIZE) * planks)
    const tint = 0.78 + 0.22 * hash(plank, 0, 77)
    const edge = y % (SIZE / planks) < 2 ? 0.45 : 1
    for (let x = 0; x < SIZE; x++) {
      const grain = 0.88 + 0.12 * fbm(x / SIZE + plank * 0.37, y / SIZE * 0.08, 10, 3, plank + 90)
      const channel = Math.round(255 * Math.min(1, tint * grain) * edge)
      const i = (y * SIZE + x) * 4
      image.data[i] = channel
      image.data[i + 1] = channel
      image.data[i + 2] = channel
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  return toTexture(canvas, true, [2, 2])
}

// acier brossé : fines stries horizontales, utilisées en relief et en variation de rugosité
export function createBrushedTexture(): CanvasTexture {
  const canvas = paint((u, v) => {
    const streak = valueNoise(u * 3, v * 420, 420, 61)
    const fine = valueNoise(u * 8, v * 900, 900, 62)
    return 0.78 + 0.14 * streak + 0.08 * fine
  })
  return toTexture(canvas, false, [1, 1])
}

// ombre de contact douce autour d'un rectangle (plaque posée sur le mur)
export function createContactShadowTexture(): CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponible')
  ctx.shadowColor = 'rgba(0,0,0,1)'
  ctx.shadowBlur = 56
  ctx.fillStyle = '#000'
  ctx.fillRect(90, 90, size - 180, size - 180)
  const texture = new CanvasTexture(canvas)
  texture.minFilter = LinearFilter
  return texture
}

// halo de lumière chaude projeté sur le mur par l'applique
export function createLightPoolTexture(): CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponible')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,190,120,1)')
  gradient.addColorStop(0.35, 'rgba(255,160,90,0.45)')
  gradient.addColorStop(1, 'rgba(255,140,70,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}


// reflet de pièce simulé sur le miroir : dégradé froid avec une bande de lumière diagonale
export function createMirrorTexture(): CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponible')
  const base = ctx.createLinearGradient(0, 0, size, size)
  base.addColorStop(0, '#f1f4f5')
  base.addColorStop(0.55, '#b9c4c8')
  base.addColorStop(1, '#7f8c92')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)
  const band = ctx.createLinearGradient(0, size * 0.2, size * 0.7, size * 0.9)
  band.addColorStop(0.35, 'rgba(255,255,255,0)')
  band.addColorStop(0.5, 'rgba(255,255,255,0.55)')
  band.addColorStop(0.65, 'rgba(255,255,255,0)')
  ctx.fillStyle = band
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}
