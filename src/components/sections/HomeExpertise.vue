<script setup lang="ts">
// Les quatre piliers du site actuel, reformulés.
const pillars = [
  {
    title: 'Le design',
    text: "Des gammes pensées au plus près de la clientèle, que l'on peut aussi acheter en tant que particulier."
  },
  {
    title: 'Le conseil',
    text: "Un accompagnement pour choisir une installation adaptée à votre projet, de la finition à la composition."
  },
  {
    title: 'La réalisation',
    text: "Une collaboration avec les architectes et décorateurs pour des installations sur mesure."
  },
  {
    title: 'La conception',
    text: "Des produits conçus en interne, en lien direct avec les usines."
  }
]
</script>

<template>
  <section class="section section--alt" aria-labelledby="expertise-title">
    <div class="container">
      <div class="head">
        <span class="eyebrow" data-reveal>Notre expertise</span>
        <h2 id="expertise-title" data-reveal>Concevoir, fabriquer, accompagner.</h2>
      </div>

      <ol class="pillars">
        <li v-for="(pillar, index) in pillars" :key="pillar.title" v-spotlight class="pillar" data-reveal>
          <span class="number">0{{ index + 1 }}</span>
          <h3>{{ pillar.title }}</h3>
          <p>{{ pillar.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
h2 {
  max-width: 16ch;
}

.pillars {
  display: grid;
  gap: 1px;
  margin: var(--s-6) 0 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--line);
  background: var(--line);
}

.pillar {
  position: relative;
  display: grid;
  gap: var(--s-3);
  align-content: start;
  padding: var(--s-5) var(--s-4);
  overflow: hidden;
  background: var(--bg-alt);
}

.pillar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    320px circle at var(--mx, 50%) var(--my, 0%),
    rgb(155 122 31 / 0.13),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease-out;
  pointer-events: none;
}

.pillar:hover::before {
  opacity: 1;
}

.pillar > * {
  position: relative;
}

.number {
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  color: var(--c-gold);
}

h3 {
  font-size: 1.75rem;
}

p {
  color: var(--fg-muted);
}

@media (min-width: 700px) {
  .pillars {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1100px) {
  .pillars {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
