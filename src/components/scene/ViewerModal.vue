<script setup lang="ts">
import type { CollectionFinish } from '~/data/collections'

// Fenêtre qui présente un produit dans le visualiseur 3D. Le rendu n'est monté qu'à l'ouverture
// et libéré à la fermeture : aucune scène WebGL tant que personne ne l'a demandée.
const props = defineProps<{
  isOpen: boolean
  title: string
  subtitle: string
  mechanisms: string[]
  finishes: CollectionFinish[]
  priceCents: number
  // absent pour une plaque composée (pas de fiche produit)
  detailPath?: string
}>()
const emit = defineEmits<{ close: [], add: [] }>()

const finishId = defineModel<string>('finishId', { required: true })

const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const isOpenRef = toRef(props, 'isOpen')

const finish = computed(() => props.finishes.find(f => f.id === finishId.value) ?? props.finishes[0]!)

useModalFocus(isOpenRef, panel, closeButton, () => emit('close'))
</script>

<template>
  <div v-if="isOpen" class="overlay" @click.self="emit('close')">
    <div
      ref="panel"
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-modal-title"
    >
      <header class="head">
        <div>
          <p class="subtitle">{{ subtitle }}</p>
          <h2 id="viewer-modal-title">{{ title }}</h2>
        </div>
        <button ref="closeButton" type="button" class="close" aria-label="Fermer le visualiseur" @click="emit('close')">×</button>
      </header>

      <div class="body">
        <ProductShowcase
          :mechanisms="mechanisms"
          :finish="finish"
          :label="`${title}, finition ${finish.name}`"
          initial-ambiance="salon"
          autoplay
          capture-wheel
        />
      </div>

      <footer class="foot">
        <fieldset class="group">
          <legend class="label">Finition : {{ finish.name }}</legend>
          <label v-for="item in finishes" :key="item.id" class="swatch-option" :title="item.name">
            <input v-model="finishId" class="sr-only" type="radio" name="modal-finish" :value="item.id">
            <span class="swatch" :style="{ background: item.tone }" />
            <span class="sr-only">{{ item.name }}</span>
          </label>
        </fieldset>

        <p class="price">{{ formatPrice(priceCents) }} <span class="vat">TTC</span></p>

        <div class="actions">
          <button type="button" class="buy" @click="emit('add')">Ajouter au panier</button>
          <ButtonLink v-if="detailPath" :to="detailPath" variant="ghost">Fiche produit</ButtonLink>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: var(--s-3);
  background: rgb(0 0 0 / 0.65);
  animation: fade 0.25s ease-out;
}

.dialog {
  display: grid;
  gap: var(--s-4);
  width: min(100%, 1040px);
  max-height: 100%;
  overflow-y: auto;
  padding: var(--s-4);
  background: var(--bg-alt);
  color: var(--fg);
  animation: rise 0.35s var(--ease);
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s-3);
}

.subtitle {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

h2 {
  font-size: 1.75rem;
}

.close {
  flex: none;
  width: 44px;
  height: 44px;
  border: 0;
  background: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
}

.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3) var(--s-5);
}

.group {
  margin: 0;
  padding: 0;
  border: 0;
}

.label {
  margin-bottom: var(--s-1);
  padding: 0;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

.swatch-option {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
}

.swatch-option:has(input:focus-visible) {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
}

.swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25), 0 0 0 1px var(--line);
  transition: transform 0.2s var(--ease), box-shadow 0.2s ease-out;
}

.swatch-option:hover .swatch {
  transform: scale(1.12);
}

.swatch-option:has(input:checked) .swatch {
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25), 0 0 0 2px var(--bg-alt), 0 0 0 4px var(--fg);
}

.price {
  margin-left: auto;
  font-size: 1.5rem;
  font-weight: 300;
}

.vat {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--fg-muted);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}

.buy {
  min-height: 48px;
  padding: 0 var(--s-5);
  border: 0;
  border-radius: var(--radius);
  background: var(--btn-bg);
  color: var(--btn-fg);
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease-out;
}

.buy:hover {
  background: var(--btn-bg-hover);
}

@keyframes fade {
  from { opacity: 0; }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(16px); }
}

@media (prefers-reduced-motion: reduce) {
  .overlay,
  .dialog {
    animation: none;
  }
}
</style>
