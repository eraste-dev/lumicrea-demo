<script setup lang="ts">
import { collectionHighlights, findCollection, findProduct, type DemoProduct } from '~/data/collections'
import { getMechanism } from '~/data/mechanisms'
import { priceOfConfiguration } from '~/data/pricing'

const route = useRoute()
const collection = findCollection(String(route.params.collection))
const product = findProduct(String(route.params.collection), String(route.params.product))
if (!collection || !product) {
  throw createError({ statusCode: 404, statusMessage: 'Produit introuvable', fatal: true })
}

useHead({ title: `${product.name} ${collection.name} — Lumicrea` })

const cart = useCart()
const finishId = ref(collection.finishes[0]!.id)
const finish = computed(() => collection.finishes.find(f => f.id === finishId.value) ?? collection.finishes[0]!)

const mechanismsOf = (item: DemoProduct): string[] => Array.from({ length: item.slots }, () => item.mechanism)
const mechanisms = computed(() => mechanismsOf(product))
const priceCents = computed(() => priceOfConfiguration(collection.slug, mechanisms.value))
const highlights = collectionHighlights[collection.slug] ?? []
const related = collection.products.filter(p => p.id !== product.id)

const viewerLabel = computed(() => `${product.name} ${collection.name}, finition ${finish.value.name}`)

function addToCart() {
  cart.add({
    collectionSlug: collection!.slug,
    collectionName: collection!.name,
    finishName: finish.value.name,
    tone: finish.value.tone,
    highlight: finish.value.highlight,
    mechanisms: mechanisms.value
  })
}

const page = ref<HTMLElement | null>(null)
usePageMotion(page)
</script>

<template>
  <div ref="page">
    <section class="section product" aria-labelledby="product-title">
      <div class="container">
        <nav class="crumbs" aria-label="Fil d'Ariane">
          <NuxtLink to="/">Accueil</NuxtLink>
          <span aria-hidden="true">/</span>
          <NuxtLink :to="`/collections/${collection.slug}`">{{ collection.name }}</NuxtLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{{ product.name }}</span>
        </nav>

        <div class="layout">
          <ProductShowcase
            :mechanisms="mechanisms"
            :finish="finish"
            :label="viewerLabel"
            initial-ambiance="salon"
            autoplay
          />

          <div class="info">
            <span class="eyebrow" data-hero>{{ collection.name }} · {{ collection.origin }}</span>
            <h1 id="product-title" data-hero>{{ product.name }}</h1>
            <p class="lead" data-hero>{{ product.description }}</p>

            <p class="price" data-hero>{{ formatPrice(priceCents) }} <span class="vat">TTC</span></p>

            <fieldset class="group">
              <legend class="label">Finition : {{ finish.name }}</legend>
              <label v-for="item in collection.finishes" :key="item.id" class="swatch-option" :title="item.name">
                <input v-model="finishId" class="sr-only" type="radio" name="finish" :value="item.id">
                <span class="swatch" :style="{ background: item.tone }" />
                <span class="sr-only">{{ item.name }}</span>
              </label>
            </fieldset>

            <div class="actions">
              <button type="button" class="buy" @click="addToCart">Ajouter au panier</button>
              <ButtonLink to="/configurateur" variant="ghost">Composer ma plaque</ButtonLink>
            </div>

            <ul class="highlights">
              <li v-for="item in highlights" :key="item">{{ item }}</li>
              <li>Garantie 2 ans · Livraison offerte dès 500 €</li>
            </ul>

            <dl class="specs">
              <div>
                <dt>Appareil</dt>
                <dd>{{ getMechanism(product.mechanism).label }}</dd>
              </div>
              <div>
                <dt>Plaque</dt>
                <dd>{{ product.slots }} poste{{ product.slots > 1 ? 's' : '' }}</dd>
              </div>
              <div>
                <dt>Collection</dt>
                <dd>{{ collection.name }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="related-title">
      <div class="container">
        <h2 id="related-title" data-reveal>Dans la collection {{ collection.name }}</h2>
        <ul class="related">
          <li v-for="item in related" :key="item.id" data-reveal>
            <NuxtLink :to="`/produits/${collection.slug}/${item.id}`" class="card">
              <span class="thumb">
                <PlateVisual
                  :mechanisms="mechanismsOf(item)"
                  :tone="finish.tone"
                  :highlight="finish.highlight"
                  :label="`${item.name}, finition ${finish.name}`"
                />
              </span>
              <span class="card-name">{{ item.name }}</span>
              <span class="card-price">{{ formatPrice(priceOfConfiguration(collection.slug, mechanismsOf(item))) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.product {
  padding-top: calc(var(--header-height) + var(--s-5));
}

.crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  margin-bottom: var(--s-5);
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

.crumbs a {
  text-underline-offset: 4px;
}

.layout {
  display: grid;
  gap: var(--s-6);
  align-items: start;
}

.info {
  display: grid;
  gap: var(--s-4);
}

h1 {
  font-size: clamp(2rem, 4vw, 3rem);
}

.lead {
  max-width: 46ch;
  color: var(--fg-muted);
}

.price {
  font-size: 2rem;
  font-weight: 300;
}

.vat {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--fg-muted);
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

.swatch-option {
  display: grid;
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
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25), 0 0 0 2px var(--bg), 0 0 0 4px var(--fg);
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

.highlights {
  display: grid;
  gap: var(--s-2);
  padding-top: var(--s-4);
  border-top: 1px solid var(--line);
  font-size: var(--fs-small);
}

.highlights li::before {
  content: '— ';
  color: var(--c-gold);
}

.specs {
  display: grid;
  gap: var(--s-2);
  margin: 0;
  font-size: var(--fs-small);
}

.specs div {
  display: flex;
  justify-content: space-between;
  padding-bottom: var(--s-2);
  border-bottom: 1px solid var(--line);
}

.specs dt {
  color: var(--fg-muted);
}

.specs dd {
  margin: 0;
}

h2 {
  max-width: 24ch;
}

.related {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  margin-top: var(--s-5);
}

.card {
  display: grid;
  gap: var(--s-2);
  text-decoration: none;
}

.thumb {
  display: grid;
  place-items: center;
  height: 180px;
  padding: var(--s-4);
  background: linear-gradient(180deg, #d9d8d4, #c4c2bd);
  transition: transform 0.4s var(--ease);
}

.card:hover .thumb {
  transform: translateY(-4px);
}

.card-name {
  font-weight: 500;
}

.card-price {
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

@media (min-width: 900px) {
  .layout {
    grid-template-columns: 1.3fr 1fr;
    gap: var(--s-7);
  }

  .info {
    position: sticky;
    top: calc(var(--header-height) + var(--s-4));
  }
}
</style>
