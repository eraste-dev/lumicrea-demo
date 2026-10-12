<script setup lang="ts">
import { VIEWER_ZOOM, type ViewerAmbiance, type ViewerFinish, type ViewerShot } from '~/domain/scene/ProductViewer'

// Visualiseur 3D d'une plaque posée sur un mur, avec plans, ambiances et visite animée.
// Tant que la 3D n'est pas prête (ou si elle échoue), l'aperçu 2D reste affiché.
const props = withDefaults(defineProps<{
  mechanisms: string[]
  finish: ViewerFinish & { name: string, highlight: string }
  label: string
  // minimal : ambiances + visite seulement
  controls?: 'full' | 'minimal'
  initialShot?: ViewerShot
  initialAmbiance?: ViewerAmbiance
  autoplay?: boolean
  // vrai : la molette zoome sans Ctrl (fenêtre plein écran, où la page ne défile pas)
  captureWheel?: boolean
}>(), {
  controls: 'full',
  initialShot: 'three-quarter',
  initialAmbiance: 'salon',
  autoplay: false,
  captureWheel: false
})

const shots: { id: ViewerShot, label: string }[] = [
  { id: 'room', label: 'Pièce' },
  { id: 'face', label: 'Face' },
  { id: 'three-quarter', label: 'Trois-quarts' },
  { id: 'detail', label: 'Détail' },
  { id: 'grazing', label: 'Rasant' }
]

const ambiances: { id: ViewerAmbiance, label: string, swatch: string }[] = [
  { id: 'studio', label: 'Studio', swatch: '#cfcdc8' },
  { id: 'salon', label: 'Salon', swatch: '#d9ccb9' },
  { id: 'marble', label: 'Marbre', swatch: '#ecebe7' },
  { id: 'evening', label: 'Soir', swatch: '#3b3f3a' }
]

const isReducedMotion = useReducedMotion()
const shot = ref<ViewerShot>(props.initialShot)
const ambiance = ref<ViewerAmbiance>(props.initialAmbiance)
const isTourPlaying = ref(props.autoplay && !isReducedMotion.value)
const isReady = ref(false)
const hasFailed = ref(false)
const zoom = ref(1)
const resetToken = ref(0)

const BRUSHED_MIN_METALNESS = 0.7
const BRUSHED_MIN_ROUGHNESS = 0.45

// choisir un plan à la main arrête la visite automatique
function pickShot(next: ViewerShot) {
  isTourPlaying.value = false
  shot.value = next
}

function zoomBy(factor: number) {
  isTourPlaying.value = false
  zoom.value = Math.min(VIEWER_ZOOM.max, Math.max(VIEWER_ZOOM.min, zoom.value * factor))
}

function resetView() {
  zoom.value = 1
  resetToken.value += 1
}

// +, -, 0 quand le visualiseur a le focus
function onKeydown(event: KeyboardEvent) {
  if (event.key === '+' || event.key === '=') zoomBy(VIEWER_ZOOM.buttonStep)
  else if (event.key === '-') zoomBy(1 / VIEWER_ZOOM.buttonStep)
  else if (event.key === '0') resetView()
  else return
  event.preventDefault()
}

const viewerFinish = computed<ViewerFinish>(() => ({
  tone: props.finish.tone,
  metalness: props.finish.metalness,
  roughness: props.finish.roughness,
  // métal assez rugueux et métallique : finition brossée (stries visibles)
  brushed: props.finish.metalness >= BRUSHED_MIN_METALNESS && props.finish.roughness >= BRUSHED_MIN_ROUGHNESS
}))
</script>

<template>
  <figure class="showcase">
    <div
      class="frame"
      :data-ambiance="ambiance"
      tabindex="0"
      role="group"
      aria-label="Visualiseur 3D : + et - pour zoomer, 0 pour recentrer"
      @keydown="onKeydown"
    >
      <div class="fallback" :class="{ 'is-hidden': isReady }">
        <PlateVisual
          :mechanisms="mechanisms"
          :tone="finish.tone"
          :highlight="finish.highlight"
          :label="label"
        />
      </div>

      <ProductViewerCanvas
        v-if="!hasFailed"
        class="canvas"
        :class="{ 'is-visible': isReady }"
        :mechanisms="mechanisms"
        :finish="viewerFinish"
        :shot="shot"
        :ambiance="ambiance"
        :is-tour-playing="isTourPlaying"
        :zoom="zoom"
        :reset-token="resetToken"
        :capture-wheel="captureWheel"
        :label="`${label}, aperçu 3D interactif`"
        @ready="isReady = true"
        @failed="hasFailed = true"
        @interact="isTourPlaying = false"
        @shot-change="shot = $event"
        @zoom-change="zoom = $event"
      />

      <div v-if="isReady" class="zoom" role="group" aria-label="Zoom">
        <button type="button" class="round" aria-label="Zoom avant" :disabled="zoom >= VIEWER_ZOOM.max" @click="zoomBy(VIEWER_ZOOM.buttonStep)">+</button>
        <button type="button" class="round" aria-label="Zoom arrière" :disabled="zoom <= VIEWER_ZOOM.min" @click="zoomBy(1 / VIEWER_ZOOM.buttonStep)">−</button>
        <button type="button" class="round round--reset" aria-label="Recentrer la vue" @click="resetView">⟲</button>
      </div>

      <div v-if="isReady" class="bar">
        <div v-if="controls === 'full'" class="group" role="group" aria-label="Plan de caméra">
          <button
            v-for="item in shots"
            :key="item.id"
            type="button"
            class="chip"
            :aria-pressed="shot === item.id"
            @click="pickShot(item.id)"
          >{{ item.label }}</button>
        </div>

        <div class="group" role="group" aria-label="Ambiance">
          <button
            v-for="item in ambiances"
            :key="item.id"
            type="button"
            class="chip chip--ambiance"
            :aria-pressed="ambiance === item.id"
            @click="ambiance = item.id"
          >
            <span class="dot" :style="{ background: item.swatch }" />
            {{ item.label }}
          </button>
        </div>

        <button
          v-if="!isReducedMotion"
          type="button"
          class="chip chip--tour"
          :aria-pressed="isTourPlaying"
          @click="isTourPlaying = !isTourPlaying"
        >{{ isTourPlaying ? '❚❚ Pause' : '▶ Visite' }}</button>
      </div>
    </div>

    <figcaption v-if="isReady" class="hint">
      Glissez pour tourner · Maj + glisser pour déplacer · {{ captureWheel ? 'Molette' : 'Ctrl + molette' }} pour zoomer · Double-clic pour recentrer
    </figcaption>
  </figure>
</template>

<style scoped>
.showcase {
  display: grid;
  gap: var(--s-3);
  margin: 0;
}

.frame {
  position: relative;
  min-height: 360px;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: linear-gradient(180deg, #d9d8d4, #c4c2bd);
}

.frame[data-ambiance='evening'] {
  background: linear-gradient(180deg, #3b3f3a, #232622);
}

.fallback,
.canvas {
  position: absolute;
  inset: 0;
}

.fallback {
  display: grid;
  place-items: center;
  padding: 18%;
  transition: opacity 0.5s ease-out;
}

.fallback.is-hidden {
  opacity: 0;
  pointer-events: none;
}

.canvas {
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

.canvas.is-visible {
  opacity: 1;
}

.bar {
  position: absolute;
  right: var(--s-3);
  bottom: var(--s-3);
  left: var(--s-3);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2) var(--s-3);
  pointer-events: none;
}

.group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-1);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-height: 36px;
  padding: 0 var(--s-3);
  border: 1px solid rgb(255 255 255 / 0.35);
  border-radius: 999px;
  background: rgb(15 15 15 / 0.55);
  backdrop-filter: blur(8px);
  color: var(--c-white);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  pointer-events: auto;
  transition: background 0.2s ease-out, color 0.2s ease-out;
}

.chip:hover {
  background: rgb(15 15 15 / 0.8);
}

.chip[aria-pressed='true'] {
  border-color: var(--c-white);
  background: var(--c-white);
  color: var(--c-graphite);
}

.chip:focus-visible {
  outline: 2px solid var(--c-gold);
  outline-offset: 2px;
}

.chip--tour {
  margin-left: auto;
}

.dot {
  width: 10px;
  height: 10px;
  border: 1px solid rgb(0 0 0 / 0.3);
  border-radius: 50%;
}

.zoom {
  position: absolute;
  top: var(--s-3);
  right: var(--s-3);
  display: grid;
  gap: var(--s-1);
}

.round {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgb(255 255 255 / 0.35);
  border-radius: 50%;
  background: rgb(15 15 15 / 0.55);
  backdrop-filter: blur(8px);
  color: var(--c-white);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease-out;
}

.round:hover:not(:disabled) {
  background: rgb(15 15 15 / 0.85);
}

.round:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.round:focus-visible,
.frame:focus-visible {
  outline: 2px solid var(--c-gold);
  outline-offset: 2px;
}

.round--reset {
  font-size: 1rem;
}

.hint {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
  color: var(--fg-muted);
}

@media (min-width: 900px) {
  .frame {
    min-height: 460px;
  }
}
</style>
