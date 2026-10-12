<script setup lang="ts">
import { finishes } from '~/data/finishes'
import vendomePhoto from '~/assets/images/home/collection-vendome.webp'
import axessPhoto from '~/assets/images/home/collection-axess.webp'

// Contenu repris du site actuel (lumicrea.fr) : noms de finitions à faire valider.
const collections = [
  {
    id: 'vendome',
    origin: 'Conçu en France',
    name: 'Vendôme',
    pitch: "Façades en aluminium renforcé de 6 mm, design intemporel, installation simple et robuste. Le haut de gamme, à la française.",
    finishes: finishes.map(f => ({ name: f.name, tone: f.tone })),
    cta: 'Découvrir Vendôme',
    to: '/collections/vendome',
    photo: vendomePhoto,
    alt: 'Deux prises à façade laiton brossé sur un mur de marbre, entre deux miroirs ronds'
  },
  {
    id: 'axess',
    origin: 'Conçu en Angleterre',
    name: 'aXess',
    pitch: "Le style de l'appareillage design, à portée de main. Une gamme d'entrée qui laisse de la place au choix.",
    finishes: ['Blanc Satiné', 'Chrome Miroir', 'Acier Brossé', 'Étain', 'Noir Mat', 'Champagne', 'Laiton Poli', 'Laiton Brossé']
      .map(name => ({ name, tone: '' })),
    cta: 'Découvrir aXess',
    to: '/collections/axess',
    photo: axessPhoto,
    alt: 'Chevet de chambre avec un interrupteur et une prise à façade laiton sur un panneau bois'
  }
]
</script>

<template>
  <section id="collections" class="section section--alt" aria-labelledby="collections-title">
    <div class="container">
      <h2 id="collections-title" data-reveal>Deux univers. Un même sens du détail.</h2>

      <div class="cards">
        <article
          v-for="collection in collections"
          :key="collection.id"
          v-spotlight
          class="card"
          data-reveal
        >
          <div class="media">
            <img
              class="photo"
              :src="collection.photo"
              :alt="collection.alt"
              loading="lazy"
              decoding="async"
            >
          </div>

          <div class="body">
            <span class="origin">{{ collection.origin }}</span>
            <h3>{{ collection.name }}</h3>
            <p class="pitch">{{ collection.pitch }}</p>

            <ul class="chips" :aria-label="`Finitions ${collection.name}`">
              <li v-for="finish in collection.finishes" :key="finish.name" class="chip">
                <span v-if="finish.tone" class="dot" :style="{ background: finish.tone }" />
                {{ finish.name }}
              </li>
            </ul>

            <ButtonLink :to="collection.to" variant="ghost">{{ collection.cta }}</ButtonLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
h2 {
  max-width: 18ch;
}

.cards {
  display: grid;
  gap: var(--s-4);
  margin-top: var(--s-6);
}

.card {
  position: relative;
  display: grid;
  align-content: start;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--bg);
}

.media {
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

/* léger zoom au survol de la carte */
.photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--ease);
}

.card:hover .photo {
  transform: scale(1.04);
}

/* halo doré qui suit la souris (--mx / --my posées par v-spotlight) */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(
    380px circle at var(--mx, 50%) var(--my, 0%),
    rgb(155 122 31 / 0.14),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease-out;
  pointer-events: none;
}

.card:hover::before {
  opacity: 1;
}

.body {
  position: relative;
  display: grid;
  gap: var(--s-4);
  align-content: start;
  padding: var(--s-5) var(--s-4);
}

.origin {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

h3 {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
}

.pitch {
  max-width: 42ch;
  color: var(--fg-muted);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  padding: var(--s-1) var(--s-3);
  border: 1px solid var(--line);
  font-size: var(--fs-small);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.body :deep(.btn) {
  justify-self: start;
}

@media (min-width: 900px) {
  .cards {
    grid-template-columns: 1fr 1fr;
    gap: var(--s-5);
  }

  .body {
    padding: var(--s-5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo {
    transition: none;
  }

  .card:hover .photo {
    transform: none;
  }
}
</style>
