<script setup lang="ts">
import chambre from '~/assets/images/home/realisation-chambre.webp'
import cuisine from '~/assets/images/home/realisation-cuisine.webp'
import bronze from '~/assets/images/home/realisation-bronze.webp'
import noir from '~/assets/images/home/realisation-noir.webp'
import salleDeBain from '~/assets/images/home/realisation-salle-de-bain.webp'

// Photos de réalisations du site actuel. Légendes à valider (pièce, finition, crédit).
const projects = [
  {
    src: chambre,
    label: 'Acier brossé',
    alt: 'Plaque en acier brossé avec deux leviers, une prise et un port USB sur un mur capitonné, près d\'un chevet'
  },
  {
    src: cuisine,
    label: 'Laiton',
    alt: 'Cuisine noire et bois avec une plaque laiton à deux prises sur un mur sombre'
  },
  {
    src: bronze,
    label: 'Bronze',
    alt: 'Plaque bronze avec deux leviers et une prise, dans un intérieur clair'
  },
  {
    src: noir,
    label: 'Noir brossé',
    alt: 'Plaque noire brossée à deux leviers laiton sur un mur blanc'
  },
  {
    src: salleDeBain,
    label: "Salle d'eau",
    alt: "Vasque en pierre et prise noire brossée sur un mur vert d'eau"
  }
]

const strip = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(true)
const isDragging = ref(false)

let startX = 0
let startScroll = 0

function updateEdges() {
  const el = strip.value
  if (!el) return
  canPrev.value = el.scrollLeft > 4
  canNext.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 4
}

// une carte + son espacement
function step(): number {
  const first = strip.value?.querySelector('li')
  return first ? first.getBoundingClientRect().width + 16 : 300
}

function scrollByCard(direction: 1 | -1) {
  strip.value?.scrollBy({ left: direction * step(), behavior: 'smooth' })
}

// glisser à la souris (au doigt, le défilement natif suffit)
function onPointerDown(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !strip.value) return
  isDragging.value = true
  startX = event.clientX
  startScroll = strip.value.scrollLeft
  strip.value.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging.value || !strip.value) return
  strip.value.scrollLeft = startScroll - (event.clientX - startX)
}

function onPointerUp(event: PointerEvent) {
  if (!isDragging.value || !strip.value) return
  isDragging.value = false
  strip.value.releasePointerCapture(event.pointerId)
}

onMounted(updateEdges)
</script>

<template>
  <!-- l'ancre sert au lien "Réalisations" du header -->
  <section id="realisations" class="section projects" aria-labelledby="projects-title">
    <div class="container head">
      <div>
        <span class="eyebrow" data-reveal>Réalisations</span>
        <h2 id="projects-title" data-reveal>Le design prend place.</h2>
        <p class="text" data-reveal>
          Découvrez comment les produits s'intègrent à des projets d'architecture intérieure.
        </p>
      </div>

      <div class="arrows" data-reveal>
        <button class="arrow" type="button" aria-label="Réalisations précédentes" :disabled="!canPrev" @click="scrollByCard(-1)">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button class="arrow" type="button" aria-label="Réalisations suivantes" :disabled="!canNext" @click="scrollByCard(1)">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>

    <ul
      ref="strip"
      class="strip"
      :class="{ 'is-dragging': isDragging }"
      data-reveal
      @scroll.passive="updateEdges"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <li v-for="project in projects" :key="project.label" class="item">
        <img
          class="photo"
          :src="project.src"
          :alt="project.alt"
          draggable="false"
          loading="lazy"
          decoding="async"
        >
        <span class="label">{{ project.label }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.projects {
  border-top: 1px solid var(--line);
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: var(--s-4);
}

.text {
  max-width: 46ch;
  margin-top: var(--s-4);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.arrows {
  display: flex;
  gap: var(--s-2);
}

.arrow {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: none;
  cursor: pointer;
  transition: background 0.2s ease-out, color 0.2s ease-out, opacity 0.2s ease-out;
}

.arrow:hover:not(:disabled) {
  background: var(--fg);
  color: var(--bg);
}

.arrow:disabled {
  opacity: 0.35;
  cursor: default;
}

/* la bande démarre alignée sur le conteneur et déborde jusqu'au bord de l'écran */
.strip {
  --edge: max(var(--gutter), calc((100vw - var(--container)) / 2));
  display: flex;
  gap: var(--s-3);
  margin: var(--s-6) 0 0;
  padding: 0 var(--edge);
  overflow-x: auto;
  list-style: none;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--edge);
  scrollbar-width: none;
  cursor: grab;
}

.strip::-webkit-scrollbar {
  display: none;
}

/* pendant le glissement, le magnétisme de scroll est coupé */
.strip.is-dragging {
  scroll-snap-type: none;
  scroll-behavior: auto;
  cursor: grabbing;
  user-select: none;
}

.item {
  position: relative;
  flex: none;
  width: clamp(240px, 26vw, 340px);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  scroll-snap-align: start;
  background: var(--bg-alt);
}

.photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--ease);
}

.item:hover .photo {
  transform: scale(1.05);
}

/* dégradé sous la légende pour la garder lisible sur n'importe quelle photo */
.item::after {
  content: '';
  position: absolute;
  inset: 55% 0 0;
  background: linear-gradient(180deg, transparent, rgb(10 10 10 / 0.65));
  pointer-events: none;
}

.label {
  position: absolute;
  bottom: var(--s-3);
  left: var(--s-3);
  z-index: 1;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #fff;
}

@media (prefers-reduced-motion: reduce) {
  .photo {
    transition: none;
  }

  .item:hover .photo {
    transform: none;
  }
}
</style>
