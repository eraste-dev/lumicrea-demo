<script setup lang="ts">
import { findCollection, type DemoProduct, type ProductType } from '~/data/collections'
import { priceOfConfiguration } from '~/data/pricing'

const route = useRoute()
const collection = findCollection(String(route.params.slug))
if (!collection) {
  throw createError({ statusCode: 404, statusMessage: 'Collection introuvable', fatal: true })
}

useHead({ title: `${collection.name} — Lumicrea` })

const typeFilter = ref<ProductType | 'all'>('all')
const finishId = ref(collection.finishes[0]!.id)
const finish = computed(() => collection.finishes.find(f => f.id === finishId.value) ?? collection.finishes[0]!)

const typeOptions = [
  { value: 'all', label: 'Tout' },
  { value: 'interrupteur', label: 'Interrupteurs' },
  { value: 'prise', label: 'Prises' }
] as const

const visibleProducts = computed(() =>
  collection.products.filter(p => typeFilter.value === 'all' || p.type === typeFilter.value)
)

const cart = useCart()
// produit ouvert dans le visualiseur 3D (null = fenêtre fermée)
const viewing = ref<DemoProduct | null>(null)
// la fenêtre reste montée : on lui garde un produit à afficher même fermée
const shown = computed(() => viewing.value ?? collection.products[0]!)

function mechanismsOf(product: DemoProduct): string[] {
  return Array.from({ length: product.slots }, () => product.mechanism)
}

function priceOf(product: DemoProduct): number {
  return priceOfConfiguration(collection!.slug, mechanismsOf(product))
}

function addToCart(product: DemoProduct) {
  cart.add({
    collectionSlug: collection!.slug,
    collectionName: collection!.name,
    finishName: finish.value.name,
    tone: finish.value.tone,
    highlight: finish.value.highlight,
    mechanisms: mechanismsOf(product)
  })
}

const page = ref<HTMLElement | null>(null)
usePageMotion(page)
</script>

<template>
  <div ref="page">
    <section class="hero section section--alt" aria-labelledby="collection-title">
      <div class="container hero-inner">
        <div>
          <span class="eyebrow" data-hero>{{ collection.origin }}</span>
          <h1 id="collection-title" data-hero>{{ collection.name }} — le sens du détail.</h1>
          <p class="lead" data-hero>{{ collection.subtitle }}</p>
        </div>
        <img class="photo" data-hero :src="collection.photo" :alt="collection.alt" decoding="async">
      </div>
    </section>

    <section class="section" aria-labelledby="catalogue-title">
      <div class="container">
        <h2 id="catalogue-title" class="sr-only">Produits</h2>

        <div class="controls">
          <fieldset class="group">
            <legend class="label">Type</legend>
            <label v-for="option in typeOptions" :key="option.value" class="pill">
              <input v-model="typeFilter" class="sr-only" type="radio" name="type" :value="option.value">
              <span>{{ option.label }}</span>
            </label>
          </fieldset>

          <fieldset class="group">
            <legend class="label">Finition : {{ finish.name }}</legend>
            <label v-for="item in collection.finishes" :key="item.id" class="swatch-option" :title="item.name">
              <input v-model="finishId" class="sr-only" type="radio" name="finish" :value="item.id">
              <span class="swatch" :style="{ background: item.tone }" />
              <span class="sr-only">{{ item.name }}</span>
            </label>
          </fieldset>
        </div>

        <ul v-if="visibleProducts.length" class="grid">
          <li v-for="product in visibleProducts" :key="product.id" class="card" data-reveal>
            <div class="stage">
              <PlateVisual
                :mechanisms="mechanismsOf(product)"
                :tone="finish.tone"
                :highlight="finish.highlight"
                :label="`${product.name}, finition ${finish.name}`"
              />
            </div>
            <div class="info">
              <h3><NuxtLink :to="`/produits/${collection.slug}/${product.id}`" class="title-link">{{ product.name }}</NuxtLink></h3>
              <p class="meta">{{ product.type === 'prise' ? 'Prise' : 'Interrupteur' }} · {{ finish.name }}</p>
              <p class="price">{{ formatPrice(priceOf(product)) }} <span class="vat">TTC</span></p>
              <div class="buy">
                <button type="button" class="add" @click="addToCart(product)">
                  Ajouter au panier
                </button>
                <button type="button" class="view3d" @click="viewing = product">Voir en 3D</button>
              </div>
            </div>
          </li>
        </ul>

        <div v-else class="empty">
          <p>Aucun produit ne correspond à ces filtres.</p>
          <button type="button" class="reset" @click="typeFilter = 'all'">Réinitialiser</button>
        </div>
      </div>
    </section>

    <section class="section section--alt" aria-label="Pour aller plus loin">
      <div class="container end">
        <ButtonLink to="/configurateur">Essayer le configurateur</ButtonLink>
        <ButtonLink to="/" variant="ghost">Retour à l'accueil</ButtonLink>
      </div>
    </section>

    <ViewerModal
      v-model:finish-id="finishId"
      :is-open="viewing !== null"
      :title="shown.name"
      :subtitle="`${collection.name} · ${collection.origin}`"
      :mechanisms="mechanismsOf(shown)"
      :finishes="collection.finishes"
      :price-cents="priceOf(shown)"
      :detail-path="`/produits/${collection.slug}/${shown.id}`"
      @close="viewing = null"
      @add="addToCart(shown)"
    />
  </div>
</template>

<style scoped>
.hero {
  padding-top: calc(var(--header-height) + var(--s-6));
}

.hero-inner {
  display: grid;
  gap: var(--s-5);
  align-items: center;
}

h1 {
  max-width: 14ch;
}

.lead {
  max-width: 44ch;
  margin-top: var(--s-4);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.photo {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.controls {
  display: grid;
  gap: var(--s-4);
  margin-bottom: var(--s-5);
}

.group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  border: 0;
}

.label {
  float: left;
  width: 100%;
  margin-bottom: var(--s-2);
  padding: 0;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

.pill {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--s-3);
  border: 1px solid var(--line);
  font-size: var(--fs-small);
  cursor: pointer;
  transition: background 0.2s ease-out, color 0.2s ease-out;
}

.pill:has(input:checked) {
  background: var(--fg);
  color: var(--bg);
}

.pill:has(input:focus-visible),
.swatch-option:has(input:focus-visible) {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
}

.swatch-option {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
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
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25), 0 0 0 2px var(--bg), 0 0 0 4px var(--fg);
}

.grid {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.card {
  border: 1px solid var(--line);
}

.stage {
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: var(--s-5) var(--s-4);
  background: var(--bg-alt);
}

.info {
  display: grid;
  gap: var(--s-2);
  padding: var(--s-4);
}

h3 {
  font-size: 1.25rem;
}

.meta {
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

.view3d {
  min-height: 44px;
  padding: 0 var(--s-4);
  border: 1px solid currentColor;
  border-radius: var(--radius);
  background: none;
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease-out, color 0.2s ease-out;
}

.view3d:hover {
  background: var(--btn-bg);
  border-color: var(--btn-bg);
  color: var(--btn-fg);
}

.title-link {
  text-decoration: none;
}

.title-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.price {
  margin-top: var(--s-1);
  font-size: 1.5rem;
  font-weight: 300;
}

.vat {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--fg-muted);
}

.buy {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3);
  margin-top: var(--s-2);
}

.add {
  min-height: 44px;
  padding: 0 var(--s-4);
  border: 0;
  border-radius: var(--radius);
  background: var(--btn-bg);
  color: var(--btn-fg);
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease-out;
}

.add:hover {
  background: var(--btn-bg-hover);
}

.more {
  justify-self: start;
  margin-top: var(--s-2);
  font-size: var(--fs-small);
  font-weight: 600;
  text-underline-offset: 4px;
}

.empty {
  display: grid;
  gap: var(--s-3);
  justify-items: start;
  padding: var(--s-5) 0;
  color: var(--fg-muted);
}

.reset {
  min-height: 44px;
  padding: 0 var(--s-4);
  border: 1px solid currentColor;
  background: none;
  cursor: pointer;
}

.end {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}

@media (min-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr 1fr;
  }

  .controls {
    grid-template-columns: auto 1fr;
    gap: var(--s-6);
  }
}
</style>
