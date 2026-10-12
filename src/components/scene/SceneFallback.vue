<script setup lang="ts">
import type { Finish } from '~/domain/product/Finish'

// Aperçu 2D : affiché avant le chargement de la 3D et si WebGL échoue.
defineProps<{
  finish: Finish
}>()
</script>

<template>
  <div
    class="plate"
    role="img"
    :aria-label="`Interrupteur en finition ${finish.name}`"
    :style="{ '--tone': finish.tone, '--light': finish.highlight }"
  >
    <div class="rocker" />
  </div>
</template>

<style scoped>
.plate {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--light) 0%, var(--tone) 45%, var(--tone) 100%);
  box-shadow:
    0 30px 60px -20px rgb(0 0 0 / 0.55),
    inset 0 0 0 1px rgb(255 255 255 / 0.12);
  transition: background 0.4s ease-in-out;
}

.rocker {
  width: 44%;
  height: 60%;
  border-radius: var(--radius);
  background: linear-gradient(160deg, var(--light) 0%, var(--tone) 70%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.35),
    0 6px 14px rgb(0 0 0 / 0.35);
  transition: background 0.4s ease-in-out;
}
</style>
