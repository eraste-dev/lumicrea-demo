<script setup lang="ts">
// Anneau de progression : l'arc doré se remplit avec le scroll, un clic ramène en haut.
const RADIUS = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const progress = ref(0)
const isVisible = ref(false)
let frame = 0

function update() {
  frame = 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, window.scrollY / max) : 0
  // n'apparaît qu'une fois le premier écran dépassé
  isVisible.value = window.scrollY > window.innerHeight * 0.6
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(update)
}

function backToTop() {
  // le comportement (fluide ou immédiat) suit le CSS, donc le mouvement réduit
  window.scrollTo({ top: 0 })
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <button
    class="top"
    :class="{ 'is-visible': isVisible }"
    type="button"
    aria-label="Revenir en haut de la page"
    @click="backToTop"
  >
    <svg class="ring" viewBox="0 0 48 48" aria-hidden="true">
      <circle class="ring-track" cx="24" cy="24" :r="RADIUS" />
      <circle
        class="ring-fill"
        cx="24"
        cy="24"
        :r="RADIUS"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="CIRCUMFERENCE * (1 - progress)"
      />
    </svg>
    <svg class="arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>

<style scoped>
.top {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 25;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--bg-alt);
  color: var(--fg);
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.14);
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition:
    opacity 0.3s ease-out,
    transform 0.3s var(--ease),
    visibility 0s linear 0.3s;
}

.top.is-visible {
  opacity: 1;
  visibility: visible;
  transform: none;
  transition-delay: 0s;
}

.top:hover .arrow {
  transform: translateY(-2px);
}

.ring {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
}

.ring-track,
.ring-fill {
  fill: none;
  stroke-width: 1.5;
}

.ring-track {
  stroke: var(--line);
}

.ring-fill {
  stroke: var(--c-gold);
  stroke-linecap: round;
}

.arrow {
  transition: transform 0.25s var(--ease);
}

@media (min-width: 900px) {
  .top {
    right: 28px;
    bottom: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .top,
  .arrow {
    transition: none;
  }
}
</style>
