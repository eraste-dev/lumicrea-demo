<script setup lang="ts">
import { getMechanism } from '~/data/mechanisms'
import type { CartItem } from '~/composables/useCart'

// Vignette + description d'une ligne de panier (panier, commande, confirmation).
const props = defineProps<{ item: CartItem }>()

const title = computed(() =>
  `${props.item.collectionName} · plaque ${props.item.mechanisms.length} poste${props.item.mechanisms.length > 1 ? 's' : ''}`
)
const details = computed(() =>
  describeMechanisms(props.item.mechanisms, id => getMechanism(id).label)
)
</script>

<template>
  <div class="line">
    <div class="thumb">
      <PlateVisual
        :mechanisms="item.mechanisms"
        :tone="item.tone"
        :highlight="item.highlight"
        :label="`${title}, finition ${item.finishName}`"
      />
    </div>
    <div class="text">
      <p class="title">{{ title }}</p>
      <p class="meta">{{ item.finishName }}</p>
      <p class="meta">{{ details }}</p>
    </div>
  </div>
</template>

<style scoped>
.line {
  display: flex;
  gap: var(--s-3);
  align-items: center;
}

.thumb {
  flex: none;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  padding: var(--s-2);
  background: linear-gradient(180deg, #d9d8d4, #c4c2bd);
}

.thumb :deep(.plate) {
  width: 100%;
  max-height: 100%;
  box-shadow: 0 8px 10px -6px rgb(0 0 0 / 0.5), inset 0 0 0 1px var(--edge);
}

.thumb :deep(.mech) {
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.38), inset 0 1px 0 rgb(255 255 255 / 0.6);
}

.title {
  font-weight: 500;
}

.meta {
  font-size: var(--fs-small);
  color: var(--fg-muted);
}
</style>
