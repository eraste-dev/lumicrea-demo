<script setup lang="ts">
import { getMechanism } from '~/data/mechanisms'
import type {
  ProductViewer,
  ViewerAmbiance,
  ViewerFinish,
  ViewerShot
} from '~/domain/scene/ProductViewer'
import { createProductViewer } from '~/providers/container'

const props = defineProps<{
  mechanisms: string[]
  finish: ViewerFinish
  shot: ViewerShot
  ambiance: ViewerAmbiance
  isTourPlaying: boolean
  zoom: number
  // change à chaque demande de recentrage
  resetToken: number
  captureWheel: boolean
  label: string
}>()
const emit = defineEmits<{
  ready: []
  failed: []
  switch: []
  interact: []
  shotChange: [shot: ViewerShot]
  zoomChange: [zoom: number]
}>()

// au-delà, on garde l'aperçu 2D plutôt que d'attendre indéfiniment
const LOAD_TIMEOUT_MS = 10000

const host = ref<HTMLElement | null>(null)
const isReducedMotion = useReducedMotion()

let viewer: ProductViewer | undefined
let isDisposed = false

const shapes = () => props.mechanisms.map(id => getMechanism(id).shape)

onMounted(async () => {
  await nextTick()
  if (!host.value) return

  const timeout = setTimeout(() => emit('failed'), LOAD_TIMEOUT_MS)

  try {
    const instance = await createProductViewer({
      reducedMotion: isReducedMotion.value,
      captureWheel: props.captureWheel,
      onZoomChange: zoom => emit('zoomChange', zoom),
      onSwitch: () => emit('switch'),
      onUserInteract: () => emit('interact'),
      onShotChange: shot => emit('shotChange', shot)
    })
    if (isDisposed || !host.value) return

    instance.mount(host.value)
    instance.setProduct(shapes())
    instance.setFinish(props.finish)
    instance.setAmbiance(props.ambiance)
    instance.setShot(props.shot)
    instance.setTourPlaying(props.isTourPlaying)
    instance.setZoom(props.zoom)
    viewer = instance

    clearTimeout(timeout)
    emit('ready')
  } catch (error) {
    clearTimeout(timeout)
    console.warn('[viewer] rendu 3D indisponible, repli sur l\'aperçu 2D', error)
    emit('failed')
  }
})

// comparaison par contenu : un nouveau tableau identique ne reconstruit pas la plaque
watch(() => props.mechanisms.join(','), () => viewer?.setProduct(shapes()))
watch(() => props.finish, finish => viewer?.setFinish(finish), { deep: true })
watch(() => props.shot, shot => viewer?.setShot(shot))
watch(() => props.ambiance, ambiance => viewer?.setAmbiance(ambiance))
watch(() => props.isTourPlaying, playing => viewer?.setTourPlaying(playing))
watch(() => props.zoom, zoom => viewer?.setZoom(zoom))
watch(() => props.resetToken, () => viewer?.resetView())

onBeforeUnmount(() => {
  isDisposed = true
  viewer?.dispose()
  viewer = undefined
})
</script>

<template>
  <div ref="host" class="canvas" role="img" :aria-label="label" />
</template>

<style scoped>
.canvas {
  width: 100%;
  height: 100%;
}

.canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.canvas :deep(canvas:active) {
  cursor: grabbing;
}
</style>
