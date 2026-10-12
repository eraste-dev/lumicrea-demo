<script setup lang="ts">
import type { Finish } from '~/domain/product/Finish'

defineProps<{
  finish: Finish
  progress?: number
  // affiche une légende qui invite à appuyer sur l'interrupteur
  hint?: boolean
}>()

// état de l'interrupteur : local par défaut, ou piloté par le parent avec v-model:light-on
const isLightOn = defineModel<boolean>('lightOn', { default: true })

// tant que la 3D n'est pas prête (ou si elle échoue), l'aperçu 2D reste affiché
const isReady = ref(false)
const hasFailed = ref(false)
</script>

<template>
  <figure class="stage">
    <div class="frame">
      <div class="layer fallback" :class="{ 'is-hidden': isReady }">
        <SceneFallback :finish="finish" />
      </div>

      <SceneCanvas
        v-if="!hasFailed"
        class="layer canvas"
        :class="{ 'is-visible': isReady }"
        :finish="finish"
        :progress="progress"
        :is-light-on="isLightOn"
        @switch="isLightOn = !isLightOn"
        @ready="isReady = true"
        @failed="hasFailed = true"
      />
    </div>
    <figcaption v-if="hint" class="hint">
      {{ isLightOn ? "Appuyez sur l'interrupteur pour éteindre la lumière." : 'Appuyez à nouveau pour la rallumer.' }}
    </figcaption>
  </figure>
</template>

<style scoped>
.stage {
  display: grid;
  gap: var(--s-3);
  margin: 0;
}

.frame {
  position: relative;
  aspect-ratio: 1;
}

.layer {
  position: absolute;
  inset: 0;
}

/* l'aperçu 2D a la même emprise que l'objet 3D */
.fallback {
  display: grid;
  place-items: center;
  padding: 18%;
  transition: opacity 0.4s ease-out;
}

.fallback.is-hidden {
  opacity: 0;
}

.canvas {
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

.canvas.is-visible {
  opacity: 1;
}

.hint {
  justify-self: center;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-align: center;
  text-transform: uppercase;
  color: var(--fg-muted);
}
</style>
