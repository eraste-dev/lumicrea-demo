<script setup lang="ts">
const items = [
  'Vendôme, conçu en France',
  'Aluminium renforcé 6 mm',
  'Six finitions',
  'Garantie 2 ans',
  'Livraison offerte dès 500 €'
]
</script>

<template>
  <section class="marquee section--alt" aria-label="Les points forts de Lumicrea">
    <div class="track">
      <!-- la séquence est doublée pour boucler ; la copie est cachée aux lecteurs d'écran -->
      <ul v-for="copy in 2" :key="copy" class="list" :aria-hidden="copy === 2">
        <li v-for="item in items" :key="item" class="item">{{ item }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.marquee {
  overflow: hidden;
  border-block: 1px solid var(--line);
}

/* décaler de 50 % (une séquence) puis recommencer : la boucle est invisible */
.track {
  display: flex;
  width: max-content;
  animation: scroll 40s linear infinite;
}

.marquee:hover .track {
  animation-play-state: paused;
}

.list {
  display: flex;
  flex: none;
}

.item {
  padding: var(--s-4) var(--s-5);
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 300;
  white-space: nowrap;
}

/* petit losange doré entre deux mentions */
.item::after {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: var(--s-5);
  vertical-align: middle;
  background: var(--c-gold);
  transform: rotate(45deg);
}

@keyframes scroll {
  to {
    transform: translateX(-50%);
  }
}

/* mouvement réduit : bandeau fixe, la seconde copie disparaît */
@media (prefers-reduced-motion: reduce) {
  .marquee {
    overflow-x: auto;
  }

  .track {
    animation: none;
  }

  .list:last-child {
    display: none;
  }
}
</style>
