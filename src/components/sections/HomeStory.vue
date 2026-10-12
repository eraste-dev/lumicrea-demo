<script setup lang="ts">
import { defaultFinish } from '~/data/finishes'

const steps = [
  {
    title: "6 mm d'aluminium renforcé.",
    text: "Une façade qui a du corps : épaisse, rigide, précise. On la sent avant même de la regarder."
  },
  {
    title: 'Un design intemporel.',
    text: "Des lignes nettes qui traversent les modes et s'effacent devant l'architecture, sans jamais disparaître."
  },
  {
    title: "Simple à installer. Robuste dans le temps.",
    text: "Un appareillage pensé pour se poser sans histoire, et pour durer."
  }
]

// le produit tourne et s'approche pendant que la section défile
const root = ref<HTMLElement | null>(null)
const progress = useScrollProgress(root)

const activeIndex = computed(() =>
  Math.min(steps.length - 1, Math.floor(progress.value * (steps.length + 0.5)))
)
</script>

<template>
  <section id="reveal" ref="root" class="story" aria-labelledby="story-title">
    <div class="container inner">
      <div class="sticky">
        <SceneStage :finish="defaultFinish" :progress="progress" />
      </div>

      <div class="steps">
        <header class="intro" data-reveal>
          <span class="eyebrow">Vendôme</span>
          <h2 id="story-title">La matière au premier regard.</h2>
          <p class="lead">
            Des lignes précises, des surfaces travaillées et des finitions qui donnent au détail toute sa place.
          </p>
        </header>

        <article
          v-for="(step, index) in steps"
          :key="step.title"
          class="step"
          :class="{ 'is-active': index === activeIndex }"
        >
          <span class="count">0{{ index + 1 }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.story {
  padding-block: var(--s-6) var(--s-7);
}

.inner {
  display: grid;
  gap: var(--s-4);
}

/* mobile : le produit reste collé en haut, les étapes défilent dessous */
.sticky {
  position: sticky;
  top: var(--header-height);
  z-index: 2;
  width: min(70vw, 38svh);
  margin-inline: auto;
  padding-block: var(--s-3);
  background: var(--bg);
}

.intro {
  padding-block: var(--s-5);
}

.lead {
  max-width: 40ch;
  margin-top: var(--s-4);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.step {
  display: grid;
  gap: var(--s-3);
  align-content: center;
  min-height: 50svh;
  opacity: 0.3;
  transition: opacity 0.4s ease-out;
}

.step.is-active {
  opacity: 1;
}

.count {
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  color: var(--c-gold);
}

h3 {
  max-width: 16ch;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
}

.step p {
  max-width: 40ch;
  color: var(--fg-muted);
}

@media (min-width: 900px) {
  .inner {
    grid-template-columns: 1fr 1fr;
    gap: var(--s-6);
  }

  .sticky {
    top: calc(var(--header-height) + 6vh);
    align-self: start;
    width: 100%;
    max-width: 560px;
    margin-inline: 0;
    padding-block: 0;
    background: none;
  }

  .intro {
    min-height: 50svh;
    align-content: center;
    padding-block: 0;
  }

  .step {
    min-height: 70svh;
  }
}

/* mouvement réduit : pas de séquence, le produit n'est pas collé */
@media (prefers-reduced-motion: reduce) {
  .sticky {
    position: static;
  }

  .step {
    min-height: auto;
    padding-block: var(--s-5);
    opacity: 1;
  }
}
</style>
