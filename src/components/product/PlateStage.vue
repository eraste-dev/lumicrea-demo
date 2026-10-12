<script setup lang="ts">
import type { Finish } from '~/domain/product/Finish'

// Aperçu de la plaque composée + résumé de sélection (toujours visible).
defineProps<{
  mechanisms: string[]
  finish: Pick<Finish, 'name' | 'tone' | 'highlight'>
  summary: string
}>()
</script>

<template>
  <div class="stage">
    <div class="preview">
      <PlateVisual
        :mechanisms="mechanisms"
        :tone="finish.tone"
        :highlight="finish.highlight"
        :label="summary"
      />
    </div>
    <p class="summary" aria-live="polite">{{ summary }}</p>
  </div>
</template>

<style scoped>
.stage {
  display: grid;
  gap: var(--s-3);
  padding: var(--s-4);
  border: 1px solid var(--line);
  background: var(--bg-alt);
}

/* mur neutre éclairé du haut : fait ressortir la plaque et son ombre */
.preview {
  display: grid;
  place-items: center;
  min-height: 340px;
  padding: var(--s-5) var(--s-4);
  background:
    radial-gradient(ellipse at 50% 0%, rgb(255 255 255 / 0.55), transparent 65%),
    linear-gradient(180deg, #d9d8d4, #c4c2bd);
}

.preview > :deep(.plate) {
  width: calc(var(--slots) * 20% + 14%);
}

.summary {
  font-size: var(--fs-small);
  color: var(--fg-muted);
}
</style>
