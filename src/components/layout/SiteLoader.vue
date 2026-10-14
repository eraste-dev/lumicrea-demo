<script setup lang="ts">
// Loader d'entrée : un interrupteur Vendôme bascule, la lumière s'allume, le nom se révèle.
const MIN_MS = 1700
const MIN_MS_REDUCED = 300
const EXIT_MS = 600
const SEEN_KEY = 'lumicrea-loaded'
const WORDMARK = 'LUMICREA'.split('')

const phase = ref<'loading' | 'leaving' | 'gone'>('loading')

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function whenLoaded(): Promise<void> {
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
}

onMounted(async () => {
  const root = document.documentElement
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const minMs = isReduced ? MIN_MS_REDUCED : MIN_MS

  root.style.overflow = 'hidden'
  // performance.now() compte depuis la navigation, l'animation a déjà démarré
  await Promise.all([whenLoaded(), wait(Math.max(0, minMs - performance.now()))])

  phase.value = 'leaving'
  await wait(isReduced ? 0 : EXIT_MS)
  phase.value = 'gone'

  root.style.overflow = ''
  root.dataset.loaded = '1'
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // pas de stockage : le loader se rejouera, tant pis
  }
})
</script>

<template>
  <div
    v-if="phase !== 'gone'"
    class="loader"
    :class="{ 'is-leaving': phase === 'leaving' }"
    role="status"
    aria-live="polite"
  >
    <span class="sr-only">Chargement de Lumicrea</span>

    <div class="loader__stage" aria-hidden="true">
      <div class="loader__glow" />

      <div class="loader__plate">
        <div class="loader__rocker">
          <span class="loader__led" />
        </div>
      </div>

      <p class="loader__word">
        <span v-for="(letter, i) in WORDMARK" :key="i" class="loader__letter" :style="{ '--i': i }">
          {{ letter }}
        </span>
      </p>
      <p class="loader__tag">Collection Vendôme</p>
    </div>
  </div>
</template>

<style>
/* sessions suivantes : pas de loader (posé par le script du <head>) */
html[data-loaded] .loader {
  display: none;
}

.loader {
  --loader-light: #e9c46a;
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  background: var(--c-scene);
  color: var(--c-light);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
  /* filet de sécurité si le JS ne s'exécute pas : le loader ne bloque jamais le site */
  animation: loader-failsafe 0s linear 6s forwards;
}

.loader.is-leaving {
  opacity: 0;
  transform: scale(1.04);
  pointer-events: none;
}

.loader__stage {
  position: relative;
  display: grid;
  justify-items: center;
  gap: var(--s-4);
}

/* halo de lumière qui s'étend quand l'interrupteur bascule */
.loader__glow {
  position: absolute;
  top: 44px;
  left: 50%;
  width: 70vmax;
  height: 70vmax;
  translate: -50% -50%;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(233 196 106 / 0.28) 0%, rgb(233 196 106 / 0.08) 30%, transparent 62%);
  opacity: 0;
  scale: 0.1;
  animation: loader-glow 1.1s var(--ease) 0.7s forwards, loader-flicker 0.4s steps(1) 0.7s;
}

.loader__plate {
  position: relative;
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  background: #141414;
  border: 1px solid var(--c-line-dark);
  border-radius: var(--radius);
  box-shadow: 0 24px 48px rgb(0 0 0 / 0.5);
  perspective: 240px;
  opacity: 0;
  animation: loader-rise 0.5s var(--ease) 0.05s forwards;
}

.loader__rocker {
  position: relative;
  width: 36px;
  height: 56px;
  background: linear-gradient(#2a2a2a, #1c1c1c);
  border: 1px solid var(--c-line-dark);
  border-radius: var(--radius);
  transform: rotateX(-16deg);
  transform-origin: center;
  animation: loader-flip 0.18s cubic-bezier(0.5, 0, 0.2, 1.4) 0.65s forwards;
}

.loader__led {
  position: absolute;
  left: 50%;
  bottom: 8px;
  width: 4px;
  height: 4px;
  translate: -50% 0;
  border-radius: 50%;
  background: #3a3a3a;
  animation: loader-led 0.2s linear 0.7s forwards;
}

.loader__word {
  display: flex;
  gap: 0.32em;
  margin: 0;
  font-size: var(--fs-lead);
  font-weight: 300;
  letter-spacing: 0.1em;
}

.loader__letter {
  color: #3a3a3a;
  animation: loader-letter 0.35s var(--ease) calc(0.8s + var(--i) * 70ms) forwards;
}

.loader__tag {
  margin: calc(var(--s-3) * -1) 0 0;
  font-size: var(--fs-small);
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--fg-muted);
  opacity: 0;
  animation: loader-rise 0.6s var(--ease) 1.3s forwards;
}

@keyframes loader-rise {
  from {
    opacity: 0;
    translate: 0 8px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes loader-flip {
  to {
    transform: rotateX(16deg);
  }
}

@keyframes loader-led {
  to {
    background: var(--loader-light);
    box-shadow: 0 0 8px 2px var(--loader-light);
  }
}

@keyframes loader-glow {
  to {
    opacity: 1;
    scale: 1;
  }
}

/* léger scintillement de filament à l'allumage */
@keyframes loader-flicker {
  0% { opacity: 0.2; }
  35% { opacity: 0.9; }
  60% { opacity: 0.4; }
  100% { opacity: 1; }
}

@keyframes loader-letter {
  to {
    color: var(--c-white);
    text-shadow: 0 0 14px rgb(233 196 106 / 0.7);
  }
}

@keyframes loader-failsafe {
  to {
    opacity: 0;
    visibility: hidden;
  }
}

/* mouvement réduit : l'interrupteur est déjà allumé, rien ne bouge */
@media (prefers-reduced-motion: reduce) {
  .loader,
  .loader * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }

  .loader.is-leaving {
    transform: none;
  }

  .loader__glow {
    opacity: 1;
    scale: 1;
  }

  .loader__plate,
  .loader__tag {
    opacity: 1;
  }

  .loader__rocker {
    transform: rotateX(16deg);
  }

  .loader__led {
    background: var(--loader-light);
    box-shadow: 0 0 8px 2px var(--loader-light);
  }

  .loader__letter {
    color: var(--c-white);
  }
}
</style>
