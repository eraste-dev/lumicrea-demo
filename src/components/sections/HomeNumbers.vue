<script setup lang="ts">
// Chiffres repris du site actuel (lumicrea.fr) : à faire valider par la marque.
const stats = [
  { value: 6, prefix: '', suffix: '', label: 'finitions pour la collection Vendôme' },
  { value: 6, prefix: '', suffix: ' mm', label: "d'aluminium renforcé en façade" },
  { value: 2, prefix: '', suffix: ' ans', label: 'de garantie sur tous les produits' },
  { value: 500, prefix: 'dès ', suffix: ' €', label: "d'achat : la livraison est offerte" }
]
</script>

<template>
  <section class="section" aria-labelledby="numbers-title">
    <div class="container">
      <div class="head">
        <span class="eyebrow" data-reveal>Pourquoi Lumicrea</span>
        <h2 id="numbers-title" data-reveal>Le haut de gamme devient accessible.</h2>
        <p class="lead" data-reveal>
          Lumicrea conçoit, fabrique et distribue ses gammes d'appareillage pour la France et l'Europe.
        </p>
      </div>

      <dl class="stats">
        <div v-for="stat in stats" :key="stat.label" class="stat" data-reveal>
          <dt class="value">
            <span v-if="stat.prefix" class="affix">{{ stat.prefix }}</span>
            <span :data-count="stat.value">{{ stat.value }}</span>
            <span class="affix">{{ stat.suffix }}</span>
          </dt>
          <dd class="label">{{ stat.label }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.head {
  max-width: 720px;
}

h2 {
  font-size: clamp(2rem, 5vw, 3.75rem);
}

.lead {
  max-width: 46ch;
  margin-top: var(--s-4);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--s-5) var(--s-4);
  margin: var(--s-6) 0 0;
}

.stat {
  padding-top: var(--s-4);
  border-top: 1px solid var(--line);
}

.value {
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  font-weight: 300;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.affix {
  font-size: 0.4em;
  letter-spacing: 0.04em;
  color: var(--fg-muted);
}

.label {
  max-width: 22ch;
  margin: var(--s-3) 0 0;
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

@media (min-width: 900px) {
  .stats {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
