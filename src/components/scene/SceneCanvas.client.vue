<script setup lang="ts">
import type { Finish } from '~/domain/product/Finish'
import type { SceneRenderer } from '~/domain/scene/SceneRenderer'
import { createSceneRenderer } from '~/providers/container'

const props = defineProps<{
  finish: Finish
  progress?: number
  isLightOn?: boolean
}>()
const emit = defineEmits<{
  ready: []
  failed: []
  switch: []
}>()

// au-delà, on garde l'aperçu 2D plutôt que d'attendre indéfiniment
const LOAD_TIMEOUT_MS = 8000

const host = ref<HTMLElement | null>(null)
const isReducedMotion = useReducedMotion()

let renderer: SceneRenderer | undefined
let isDisposed = false

onMounted(async () => {
  // Nuxt rend le template des .client.vue un tick après le montage
  await nextTick()
  if (!host.value) return

  const timeout = setTimeout(() => emit('failed'), LOAD_TIMEOUT_MS)

  try {
    const instance = await createSceneRenderer({
      reducedMotion: isReducedMotion.value,
      onSwitch: () => emit('switch')
    })
    if (isDisposed || !host.value) return

    instance.mount(host.value)
    instance.setFinish(props.finish)
    instance.setLightOn(props.isLightOn ?? true)
    renderer = instance

    clearTimeout(timeout)
    emit('ready')
  } catch (error) {
    clearTimeout(timeout)
    console.warn('[scene] rendu 3D indisponible, repli sur l\'aperçu 2D', error)
    emit('failed')
  }
})

watch(() => props.finish, (finish) => renderer?.setFinish(finish))
watch(() => props.progress, (value) => renderer?.setProgress(value ?? 0))
watch(() => props.isLightOn, (value) => renderer?.setLightOn(value ?? true))

onBeforeUnmount(() => {
  isDisposed = true
  renderer?.dispose()
  renderer = undefined
})
</script>

<template>
  <div
    ref="host"
    class="canvas"
    role="img"
    :aria-label="`Interrupteur en finition ${finish.name}, aperçu 3D interactif`"
  />
</template>

<style scoped>
.canvas {
  width: 100%;
  height: 100%;
}

.canvas :deep(canvas) {
  display: block;
  touch-action: pan-y;
  width: 100%;
  height: 100%;
}
</style>
