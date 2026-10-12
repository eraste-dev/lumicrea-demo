<script setup lang="ts">
import { getMechanism } from '~/data/mechanisms'

// Plaque et appareils dessinés en CSS : s'adapte à la largeur de son conteneur.
defineProps<{
  mechanisms: string[]
  tone: string
  highlight: string
  label: string
}>()
</script>

<template>
  <div
    class="plate"
    role="img"
    :aria-label="label"
    :style="{ '--tone': tone, '--light': highlight, '--slots': mechanisms.length }"
  >
    <span
      v-for="(mechanism, index) in mechanisms"
      :key="index"
      class="mech"
      :class="`mech--${getMechanism(mechanism).shape}`"
    />
  </div>
</template>

<style scoped>
.plate {
  --edge: color-mix(in srgb, var(--tone) 55%, black);
  display: grid;
  grid-template-columns: repeat(var(--slots), 1fr);
  gap: 10%;
  align-items: center;
  width: calc(var(--slots) * 20% + 14%);
  max-width: 100%;
  aspect-ratio: calc(var(--slots) * 0.75 + 0.35) / 1;
  margin-inline: auto;
  padding: 7%;
  border-radius: 3px;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 0.28), transparent 40%, rgb(0 0 0 / 0.18)),
    linear-gradient(135deg, var(--light), var(--tone) 60%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    inset 0 -1px 0 rgb(0 0 0 / 0.35),
    inset 0 0 0 1px var(--edge),
    0 2px 3px rgb(0 0 0 / 0.35),
    0 28px 36px -14px rgb(0 0 0 / 0.55);
  transition: width 0.4s var(--ease), aspect-ratio 0.4s var(--ease), background 0.3s ease-in-out;
}

/* appareil : cadre en creux + face biseautée plus claire que la plaque */
.mech {
  position: relative;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.4), transparent 45%, rgb(0 0 0 / 0.22)),
    linear-gradient(160deg, var(--light), var(--tone));
  box-shadow:
    0 0 0 2px rgb(0 0 0 / 0.38),
    0 0 0 3px rgb(255 255 255 / 0.18),
    inset 0 1px 0 rgb(255 255 255 / 0.7),
    inset 0 -2px 3px rgb(0 0 0 / 0.35),
    0 6px 8px rgb(0 0 0 / 0.3);
}

.mech--rocker {
  height: 66%;
  border-radius: 2px;
}

/* ligne de bascule de la touche */
.mech--rocker::after {
  content: '';
  position: absolute;
  inset: 50% 6% auto;
  height: 1px;
  background: rgb(0 0 0 / 0.28);
  box-shadow: 0 1px 0 rgb(255 255 255 / 0.4);
}

/* prise 2P+T : socle en creux, deux alvéoles et la terre */
.mech--socket {
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 36% 56%, #050505 0 7%, transparent 8%),
    radial-gradient(circle at 64% 56%, #050505 0 7%, transparent 8%),
    radial-gradient(circle at 50% 50%, rgb(0 0 0 / 0.55) 0 62%, transparent 63%),
    linear-gradient(160deg, var(--light), var(--tone));
  box-shadow:
    0 0 0 2px rgb(0 0 0 / 0.4),
    0 0 0 4px var(--tone),
    0 0 0 5px rgb(0 0 0 / 0.3),
    inset 0 3px 6px rgb(0 0 0 / 0.6),
    0 6px 8px rgb(0 0 0 / 0.3);
}

.mech--socket::after {
  content: '';
  position: absolute;
  top: 12%;
  left: 50%;
  width: 7%;
  height: 16%;
  translate: -50% 0;
  border-radius: 2px;
  background: linear-gradient(90deg, #b9bcc0, #f3f4f5, #8d9094);
}

/* bouton poussoir : anneau + dôme */
.mech--button {
  width: 64%;
  aspect-ratio: 1;
  justify-self: center;
  border-radius: 50%;
  background:
    radial-gradient(circle at 38% 32%, rgb(255 255 255 / 0.65), transparent 38%),
    radial-gradient(circle, var(--light), var(--tone) 70%);
  box-shadow:
    0 0 0 4px rgb(0 0 0 / 0.38),
    0 0 0 5px rgb(255 255 255 / 0.18),
    inset 0 -3px 5px rgb(0 0 0 / 0.4),
    0 6px 8px rgb(0 0 0 / 0.3);
}

/* variateur : molette striée avec repère */
.mech--dial {
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    repeating-conic-gradient(rgb(0 0 0 / 0.12) 0 4deg, transparent 4deg 12deg),
    radial-gradient(circle at 38% 32%, rgb(255 255 255 / 0.5), transparent 45%),
    linear-gradient(160deg, var(--light), var(--tone));
}

.mech--dial::after {
  content: '';
  position: absolute;
  top: 8%;
  left: 50%;
  width: 3px;
  height: 24%;
  translate: -50% 0;
  border-radius: 2px;
  background: rgb(0 0 0 / 0.75);
}
</style>
