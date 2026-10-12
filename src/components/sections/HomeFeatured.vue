<script setup lang="ts">
import { findCollection, findProduct } from '~/data/collections'
import { priceOfConfiguration } from '~/data/pricing'

// Produit phare : choisi ici, remplaçable sans toucher au reste.
const FEATURED_COLLECTION = 'vendome'
const FEATURED_PRODUCT = 'interrupteur-double'
const FEATURED_FINISH = 'laiton-brosse'

const collection = findCollection(FEATURED_COLLECTION)!
const product = findProduct(FEATURED_COLLECTION, FEATURED_PRODUCT)!

const cart = useCart()
const finishId = ref(
  collection.finishes.some(f => f.id === FEATURED_FINISH) ? FEATURED_FINISH : collection.finishes[0]!.id
)
const finish = computed(() => collection.finishes.find(f => f.id === finishId.value) ?? collection.finishes[0]!)
const mechanisms = Array.from({ length: product.slots }, () => product.mechanism)
const priceCents = priceOfConfiguration(collection.slug, mechanisms)
const detailPath = `/produits/${collection.slug}/${product.id}`

const perks = ['Garantie 2 ans', 'Livraison offerte dès 500 €', 'Façade aluminium 6 mm']

function addToCart() {
  cart.add({
    collectionSlug: collection.slug,
    collectionName: collection.name,
    finishName: finish.value.name,
    tone: finish.value.tone,
    highlight: finish.value.highlight,
    mechanisms
  })
}

// achat direct : on met au panier puis on file à la commande
async function buyNow() {
  addToCart()
  await navigateTo('/commande')
}
</script>

<template>
  <section id="produit-phare" class="section" aria-labelledby="featured-title">
    <div class="container inner">
      <div class="viewer" data-reveal>
        <ProductShowcase
          :mechanisms="mechanisms"
          :finish="finish"
          :label="`${product.name} ${collection.name}, finition ${finish.name}`"
          controls="minimal"
          initial-ambiance="salon"
          initial-shot="three-quarter"
          autoplay
        />
      </div>

      <div class="info">
        <span class="eyebrow" data-reveal>Produit phare · {{ collection.name }}</span>
        <h2 id="featured-title" data-reveal>{{ product.name }}</h2>
        <p class="lead" data-reveal>{{ product.description }}</p>

        <p class="price" data-reveal>{{ formatPrice(priceCents) }} <span class="vat">TTC</span></p>

        <fieldset class="group" data-reveal>
          <legend class="label">Finition : {{ finish.name }}</legend>
          <label v-for="item in collection.finishes" :key="item.id" class="swatch-option" :title="item.name">
            <input v-model="finishId" class="sr-only" type="radio" name="featured-finish" :value="item.id">
            <span class="swatch" :style="{ background: item.tone }" />
            <span class="sr-only">{{ item.name }}</span>
          </label>
        </fieldset>

        <div class="actions" data-reveal>
          <button type="button" class="buy" @click="buyNow">Acheter maintenant</button>
          <button type="button" class="add" @click="addToCart">Ajouter au panier</button>
        </div>

        <ul class="perks" data-reveal>
          <li v-for="perk in perks" :key="perk">{{ perk }}</li>
        </ul>

        <NuxtLink :to="detailPath" class="more" data-reveal>Voir la fiche produit →</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.inner {
  display: grid;
  gap: var(--s-6);
  align-items: center;
}

.info {
  display: grid;
  gap: var(--s-4);
  justify-items: start;
}

h2 {
  font-size: clamp(2rem, 4vw, 3rem);
}

.lead {
  max-width: 44ch;
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

.buy,
.add {
  min-height: 52px;
  padding: 0 var(--s-5);
  border: 1px solid var(--btn-bg);
  border-radius: var(--radius);
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease-out, color 0.2s ease-out;
}

.buy {
  background: var(--btn-bg);
  color: var(--btn-fg);
}

.buy:hover {
  background: var(--btn-bg-hover);
}

.add {
  background: none;
  color: var(--fg);
}

.add:hover {
  background: var(--btn-bg);
  color: var(--btn-fg);
}

.perks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2) var(--s-4);
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

.perks li::before {
  content: '✓ ';
  color: var(--c-gold);
}

.more {
  font-size: var(--fs-small);
  font-weight: 600;
  text-underline-offset: 4px;
}

@media (min-width: 900px) {
  .inner {
    grid-template-columns: 1.3fr 1fr;
    gap: var(--s-7);
  }
}
</style>
