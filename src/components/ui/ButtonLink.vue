<script setup lang="ts">
withDefaults(defineProps<{
  to: string
  variant?: 'solid' | 'ghost'
}>(), {
  variant: 'solid'
})
</script>

<template>
  <NuxtLink v-magnetic :to="to" class="btn" :class="`btn--${variant}`">
    <slot />
  </NuxtLink>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 var(--s-4);
  border: 1px solid transparent;
  border-radius: var(--radius);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition:
    background 0.2s ease-out,
    color 0.2s ease-out,
    border-color 0.2s ease-out,
    translate 0.25s var(--ease);
}

/* couleurs : variables de thème (tokens.css) */
.btn--solid {
  background: var(--btn-bg);
  color: var(--btn-fg);
}

.btn--solid:hover {
  background: var(--btn-bg-hover);
}

.btn--ghost {
  border-color: currentColor;
}

.btn--ghost:hover {
  background: var(--btn-bg);
  border-color: var(--btn-bg);
  color: var(--btn-fg);
}
</style>
