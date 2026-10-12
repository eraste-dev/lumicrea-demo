<script setup lang="ts">
import cuisine from '~/assets/images/home/realisation-cuisine.webp'
</script>

<template>
  <section class="section scope-dark conclusion" aria-labelledby="conclusion-title">
    <img
      class="bg"
      :src="cuisine"
      alt=""
      loading="lazy"
      decoding="async"
      data-parallax="-6"
    >
    <div class="shade" />

    <div class="container content">
      <h2 id="conclusion-title" data-reveal>Tout commence par un détail.</h2>
      <div class="actions" data-reveal>
        <ButtonLink to="/collections/vendome">Explorer la collection Vendôme</ButtonLink>
        <ButtonLink to="/contact" variant="ghost">Nous contacter</ButtonLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.conclusion {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding-block: var(--s-8);
  background: var(--c-scene);
  color: var(--fg);
}

/* plus haute que la section : la marge sert à la parallaxe */
.bg {
  position: absolute;
  top: -10%;
  left: 0;
  z-index: -2;
  width: 100%;
  height: 120%;
  object-fit: cover;
  object-position: 50% 45%;
}

/* voile pour garder le texte lisible : plus dense côté texte */
.shade {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgb(10 10 10 / 0.88) 0%, rgb(10 10 10 / 0.55) 55%, rgb(10 10 10 / 0.3) 100%);
}

h2 {
  max-width: 14ch;
  font-size: clamp(2.25rem, 6vw, 4.5rem);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
  margin-top: var(--s-5);
}
</style>
