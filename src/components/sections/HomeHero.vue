<script setup lang="ts">
import { defaultFinish } from '~/data/finishes'

// la touche 3D allume ou éteint le hero seulement ; le reste de la page ne bouge pas
const isLightOn = ref(true)
</script>

<template>
  <section
    id="accueil"
    class="hero"
    :class="{ 'scope-dark': !isLightOn }"
    aria-labelledby="hero-title"
  >
    <div class="container inner">
      <div class="text">
        <span class="eyebrow" data-hero>Designer &amp; concepteur d'appareillage électrique français</span>
        <h1 id="hero-title" data-hero>Le détail qui transforme un intérieur.</h1>
        <p class="lead" data-hero>
          Interrupteurs et prises design, pensés pour dialoguer avec l'architecture de chaque espace.
        </p>
        <div class="actions" data-hero>
          <ButtonLink to="/collections/vendome">Explorer la collection Vendôme</ButtonLink>
          <ButtonLink to="#finitions" variant="ghost">Découvrir les finitions</ButtonLink>
        </div>
      </div>

      <!-- scène 3D, avec l'aperçu 2D en repli -->
      <div class="visual" data-hero data-parallax="-8">
        <SceneStage v-model:light-on="isLightOn" :finish="defaultFinish" hint />
      </div>
    </div>

    <a class="scroll-hint" href="#reveal" data-hero>
      <span>Défiler</span>
      <span class="scroll-line" aria-hidden="true" />
    </a>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: clip;
  display: flex;
  align-items: center;
  min-height: 100svh;
  padding-block: 140px var(--s-6);
  /* les variables de thème changent (scope-dark) : on fond le passage jour → soirée */
  background: var(--bg);
  color: var(--fg);
  transition: background 0.7s ease-out, color 0.7s ease-out;
}

.inner {
  display: grid;
  gap: var(--s-6);
  align-items: center;
}

.lead {
  max-width: 34ch;
  margin-top: var(--s-4);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
  margin-top: var(--s-5);
}

.visual {
  position: relative;
  justify-self: center;
  width: 100%;
  max-width: 600px;
}

/* halo chaud derrière la plaque, visible seulement le soir */
.visual::before {
  content: '';
  position: absolute;
  inset: -18%;
  z-index: -1;
  background: radial-gradient(circle, rgb(255 176 103 / 0.3) 0%, rgb(255 176 103 / 0.08) 40%, transparent 65%);
  opacity: 0;
  transition: opacity 0.7s ease-out;
  pointer-events: none;
}

.scope-dark .visual::before {
  opacity: 1;
}

.scroll-hint {
  /* masqué en mobile : il chevaucherait le visuel */
  display: none;
  position: absolute;
  bottom: var(--s-4);
  left: 50%;
  justify-items: center;
  gap: var(--s-2);
  transform: translateX(-50%);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--fg-muted);
  transition: color 0.2s ease-out;
}

.scroll-hint:hover {
  color: var(--fg);
}

.scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, currentColor, transparent);
}

@media (min-width: 900px) {
  .scroll-hint {
    display: grid;
  }

  .inner {
    grid-template-columns: 1fr 1fr;
  }

  .visual {
    justify-self: end;
  }
}
</style>
