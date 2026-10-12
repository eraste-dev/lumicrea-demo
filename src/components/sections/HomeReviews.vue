<script setup lang="ts">
// Résumés des thèmes des avis Google visibles sur lumicrea.fr (textes complets non
// récupérés). À remplacer par les avis exacts, avec auteur, avant mise en ligne.
const reviews = [
  {
    topic: 'Le rapport qualité-prix',
    text: "Face à la concurrence, un prix qui reste juste, et un effet bien réel sur l'ambiance de la pièce."
  },
  {
    topic: 'La souplesse du service',
    text: "Choisi pour une rénovation haut de gamme, avec la possibilité d'échanger vers une référence plus premium."
  },
  {
    topic: 'La livraison et la gamme Vendôme',
    text: "Une livraison rapide, une gamme Vendôme appréciée, et un service client qui cherche des solutions."
  }
]
</script>

<template>
  <section class="section section--alt" aria-labelledby="reviews-title">
    <div class="container">
      <span class="eyebrow" data-reveal>Ils nous font confiance</span>
      <h2 id="reviews-title" data-reveal>Ce que retiennent nos clients.</h2>

      <ul class="list">
        <li v-for="review in reviews" :key="review.topic" class="review" data-reveal>
          <p class="topic">{{ review.topic }}</p>
          <p class="text">{{ review.text }}</p>
        </li>
      </ul>

      <p class="source" data-reveal>D'après les avis clients publiés sur Google.</p>
    </div>
  </section>
</template>

<style scoped>
h2 {
  max-width: 18ch;
}

.list {
  display: grid;
  gap: var(--s-4);
  margin-top: var(--s-6);
}

.review {
  display: grid;
  gap: var(--s-3);
  align-content: start;
  padding: var(--s-4) 0 0;
  border-top: 1px solid var(--line);
}

.topic {
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-gold);
}

.text {
  font-size: var(--fs-lead);
  font-weight: 300;
  line-height: 1.45;
}

.source {
  margin-top: var(--s-5);
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

@media (min-width: 900px) {
  .list {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--s-5);
  }
}
</style>
