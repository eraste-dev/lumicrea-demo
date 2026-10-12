<script setup lang="ts">
import { finishes, defaultFinish } from '~/data/finishes'
import { finishPhotos } from '~/data/finishPhotos'

const TILT_DEGREES = 8

const selectedId = ref(defaultFinish.id)
const selected = computed(() => finishes.find(f => f.id === selectedId.value) ?? defaultFinish)

// la photo s'incline légèrement vers le pointeur (position de -0,5 à 0,5)
const pointer = reactive({ x: 0, y: 0 })

function onPointerMove(event: PointerEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  pointer.x = (event.clientX - rect.left) / rect.width - 0.5
  pointer.y = (event.clientY - rect.top) / rect.height - 0.5
}

function onPointerLeave() {
  pointer.x = 0
  pointer.y = 0
}

const cardStyle = computed(() => ({
  '--ry': `${pointer.x * TILT_DEGREES}deg`,
  '--rx': `${-pointer.y * TILT_DEGREES}deg`
}))
</script>

<template>
  <section id="finitions" class="section section--stage scope-dark" aria-labelledby="finishes-title">
    <!-- fond d'ambiance : la photo de la finition choisie, floutée et assombrie -->
    <div class="ambient" aria-hidden="true">
      <img
        v-for="finish in finishes"
        :key="finish.id"
        class="ambient-img"
        :class="{ 'is-active': finish.id === selectedId }"
        :src="finishPhotos[finish.id]"
        alt=""
        loading="lazy"
        decoding="async"
      >
    </div>

    <div class="container inner">
      <div data-reveal>
        <span class="eyebrow">Finitions</span>
        <h2 id="finishes-title">Une finition, une signature.</h2>

        <fieldset class="picker">
          <legend class="sr-only">Choisir une finition</legend>
          <label v-for="finish in finishes" :key="finish.id" class="option">
            <input
              v-model="selectedId"
              class="sr-only"
              type="radio"
              name="finish"
              :value="finish.id"
            >
            <span class="swatch" :style="{ background: finish.tone }" />
            <span class="name">{{ finish.name }}</span>
          </label>
        </fieldset>

        <p class="active" aria-live="polite">
          Finition active : <strong>{{ selected.name }}</strong>
        </p>
      </div>

      <figure
        class="card"
        :style="cardStyle"
        data-reveal
        @pointermove="onPointerMove"
        @pointerleave="onPointerLeave"
      >
        <div class="frame">
          <img
            v-for="finish in finishes"
            :key="finish.id"
            class="photo"
            :class="{ 'is-active': finish.id === selectedId }"
            :src="finishPhotos[finish.id]"
            :alt="`Interrupteur Vendôme en finition ${finish.name}, posé sur un mur sombre`"
            :aria-hidden="finish.id !== selectedId"
            width="880"
            height="1168"
            loading="lazy"
            decoding="async"
          >
        </div>
        <figcaption class="caption">Vendôme — {{ selected.name }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.section--stage {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

/* le flou déborde un peu : on agrandit la couche pour cacher les bords */
.ambient {
  position: absolute;
  inset: -12%;
  z-index: -1;
}

.ambient::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 70% 50%, transparent 0%, var(--c-scene) 85%);
}

.ambient-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(56px) brightness(0.55) saturate(1.2);
  opacity: 0;
  transition: opacity 0.9s ease-out;
}

.ambient-img.is-active {
  opacity: 1;
}

.inner {
  display: grid;
  gap: var(--s-6);
  align-items: center;
}

.picker {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--s-2);
  margin: var(--s-5) 0 0;
  padding: 0;
  border: 0;
}

.option {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  min-height: 48px;
  padding: 0 var(--s-3);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgb(10 10 10 / 0.35);
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: border-color 0.2s ease-out;
}

.option:hover {
  border-color: rgb(255 255 255 / 0.4);
}

.option:has(input:checked) {
  border-color: var(--c-light);
}

.option:has(input:focus-visible) {
  outline: 2px solid var(--c-gold);
  outline-offset: 3px;
}

.swatch {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25);
}

.name {
  font-size: var(--fs-small);
}

.active {
  margin-top: var(--s-4);
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

.active strong {
  color: var(--fg);
  font-weight: 600;
}

/* la photo : inclinaison 3D légère au pointeur, fondu enchaîné entre finitions */
.card {
  justify-self: center;
  width: min(100%, 420px);
  margin: 0;
  perspective: 900px;
}

.frame {
  position: relative;
  aspect-ratio: 880 / 1168;
  overflow: hidden;
  border-radius: var(--radius);
  box-shadow: 0 40px 80px -30px rgb(0 0 0 / 0.8);
  transform: rotateY(var(--ry, 0deg)) rotateX(var(--rx, 0deg));
  transition: transform 0.25s var(--ease);
}

.photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

.photo.is-active {
  opacity: 1;
}

.caption {
  margin-top: var(--s-3);
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-align: center;
  color: var(--fg-muted);
}

@media (min-width: 900px) {
  .inner {
    grid-template-columns: 1fr 1fr;
  }

  .picker {
    max-width: 440px;
  }

  .card {
    justify-self: end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .frame {
    transform: none;
  }
}
</style>
