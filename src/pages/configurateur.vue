<script setup lang="ts">
import { collections, findCollection } from '~/data/collections'
import { getMechanism, mechanismsByCollection } from '~/data/mechanisms'
import { priceOfConfiguration } from '~/data/pricing'

useHead({ title: 'Configurateur — Lumicrea' })

const MAX_SLOTS = 4
const DEFAULT_SLOTS = 2
const DEFAULT_MECHANISM = 'interrupteur'

const collectionSlug = ref('vendome')
const collection = computed(() => findCollection(collectionSlug.value) ?? collections[0]!)
const availableMechanisms = computed(() =>
  (mechanismsByCollection[collection.value.slug] ?? [DEFAULT_MECHANISM]).map(getMechanism)
)

const finishId = ref(collection.value.finishes[0]!.id)
const finish = computed(() =>
  collection.value.finishes.find(f => f.id === finishId.value) ?? collection.value.finishes[0]!
)

// un mécanisme par poste ; la plaque s'adapte à leur nombre
const slots = ref<string[]>(Array.from({ length: DEFAULT_SLOTS }, () => DEFAULT_MECHANISM))
const slotCount = computed(() => slots.value.length)

// changer de collection : on garde la finition et les appareils qui existent encore
watch(collectionSlug, () => {
  const stillThere = collection.value.finishes.some(f => f.id === finishId.value)
  if (!stillThere) finishId.value = collection.value.finishes[0]!.id
  const allowed = availableMechanisms.value.map(m => m.id)
  slots.value = slots.value.map(id => (allowed.includes(id) ? id : DEFAULT_MECHANISM))
})

const isInitial = computed(() =>
  collectionSlug.value === 'vendome'
  && slotCount.value === DEFAULT_SLOTS
  && finishId.value === collections[0]!.finishes[0]!.id
  && slots.value.every(id => id === DEFAULT_MECHANISM)
)

const recap = computed(() => {
  const counts = new Map<string, number>()
  for (const id of slots.value) counts.set(id, (counts.get(id) ?? 0) + 1)
  return [...counts].map(([id, n]) => ({ label: getMechanism(id).label, n }))
})

const summary = computed(() => {
  const parts = recap.value.map(r => `${r.n} ${r.label.toLowerCase()}`).join(' + ')
  return `${collection.value.name} · Plaque ${slotCount.value} poste${slotCount.value > 1 ? 's' : ''} · ${parts} · ${finish.value.name}`
})

function addSlot() {
  if (slotCount.value >= MAX_SLOTS) return
  slots.value = [...slots.value, DEFAULT_MECHANISM]
}

function removeSlot() {
  if (slotCount.value <= 1) return
  slots.value = slots.value.slice(0, -1)
}

function setMechanism(index: number, id: string) {
  slots.value = slots.value.map((m, i) => (i === index ? id : m))
}

function reset() {
  collectionSlug.value = 'vendome'
  finishId.value = collections[0]!.finishes[0]!.id
  slots.value = Array.from({ length: DEFAULT_SLOTS }, () => DEFAULT_MECHANISM)
}

const isViewerOpen = ref(false)
const summaryDetail = computed(() =>
  `${slotCount.value} poste${slotCount.value > 1 ? 's' : ''} · ${recap.value.map(r => `${r.n} ${r.label.toLowerCase()}`).join(' + ')}`
)

const cart = useCart()
const totalCents = computed(() => priceOfConfiguration(collectionSlug.value, slots.value))

function addToCart() {
  cart.add({
    collectionSlug: collection.value.slug,
    collectionName: collection.value.name,
    finishName: finish.value.name,
    tone: finish.value.tone,
    highlight: finish.value.highlight,
    mechanisms: [...slots.value]
  })
}

const guarantees = [
  { label: 'Garantie', value: '2 ans', text: 'Sur tous les produits Lumicrea.' },
  { label: 'Livraison offerte', value: 'Dès 500 €', text: "D'achat, partout en France." },
  { label: 'Accompagnement', value: 'Conseil', text: "Pour choisir l'installation adaptée à votre projet." },
  { label: 'Projets', value: 'Sur mesure', text: "Conçus avec les architectes et décorateurs d'intérieur." }
]

const mapsUrl = "https://www.google.com/maps/search/?api=1&query=102+rue+Rouget+de+L'Isle+Suresnes"

const page = ref<HTMLElement | null>(null)
usePageMotion(page)
</script>

<template>
  <div ref="page">
    <section class="hero section section--alt" aria-labelledby="config-title">
      <div class="container">
        <span class="eyebrow" data-hero>Configurateur</span>
        <h1 id="config-title" data-hero>Composez votre plaque.</h1>
        <p class="lead" data-hero>
          Choisissez votre collection, votre finition et vos appareils : l'aperçu se met à jour en direct.
        </p>
      </div>
    </section>

    <section class="section" aria-label="Composition">
      <div class="container layout">
        <div class="stage">
          <PlateStage :mechanisms="slots" :finish="finish" :summary="summary" />

          <dl class="recap">
            <div>
              <dt>Collection</dt>
              <dd>{{ collection.name }} · {{ collection.origin }}</dd>
            </div>
            <div>
              <dt>Finition</dt>
              <dd>{{ finish.name }}</dd>
            </div>
            <div>
              <dt>Plaque</dt>
              <dd>{{ slotCount }} poste{{ slotCount > 1 ? 's' : '' }}</dd>
            </div>
            <div>
              <dt>Appareils</dt>
              <dd>{{ recap.map(r => `${r.n} × ${r.label}`).join(', ') }}</dd>
            </div>
            <div class="recap-total">
              <dt>Total TTC</dt>
              <dd>{{ formatPrice(totalCents) }}</dd>
            </div>
          </dl>
        </div>

        <div class="panel">
          <fieldset class="group">
            <legend class="label">1 · Collection</legend>
            <label v-for="item in collections" :key="item.slug" class="pill pill--wide">
              <input v-model="collectionSlug" class="sr-only" type="radio" name="collection" :value="item.slug">
              <span>{{ item.name }}</span>
            </label>
            <p class="hint">{{ collection.subtitle }}</p>
          </fieldset>

          <fieldset class="group">
            <legend class="label">2 · Finition : {{ finish.name }}</legend>
            <label v-for="item in collection.finishes" :key="item.id" class="swatch-option" :title="item.name">
              <input v-model="finishId" class="sr-only" type="radio" name="finish" :value="item.id">
              <span class="swatch" :style="{ background: item.tone }" />
              <span class="sr-only">{{ item.name }}</span>
            </label>
          </fieldset>

          <fieldset class="group">
            <legend class="label">3 · Postes ({{ slotCount }})</legend>
            <button type="button" class="step" :disabled="slotCount <= 1" aria-label="Retirer un poste" @click="removeSlot">−</button>
            <span class="count" aria-live="polite">{{ slotCount }}</span>
            <button type="button" class="step" :disabled="slotCount >= MAX_SLOTS" aria-label="Ajouter un poste" @click="addSlot">+</button>
          </fieldset>

          <fieldset class="group">
            <legend class="label">4 · Appareils</legend>
            <div v-for="(slot, index) in slots" :key="index" class="row">
              <span class="row-label">Poste {{ index + 1 }}</span>
              <label v-for="item in availableMechanisms" :key="item.id" class="pill">
                <input
                  class="sr-only"
                  type="radio"
                  :name="`slot-${index}`"
                  :value="item.id"
                  :checked="slot === item.id"
                  @change="setMechanism(index, item.id)"
                >
                <span>{{ item.label }}</span>
              </label>
            </div>
          </fieldset>

          <div class="actions">
            <button type="button" class="buy" @click="addToCart">
              Ajouter au panier · {{ formatPrice(totalCents) }}
            </button>
            <button type="button" class="view3d" @click="isViewerOpen = true">Visualiser en 3D</button>
            <button type="button" class="reset" :disabled="isInitial" @click="reset">Réinitialiser</button>
          </div>
        </div>
      </div>

      <!-- la plaque composée, telle quelle : mêmes appareils, même finition, même collection -->
      <ViewerModal
        v-model:finish-id="finishId"
        :is-open="isViewerOpen"
        title="Votre plaque"
        :subtitle="`${collection.name} · ${summaryDetail}`"
        :mechanisms="slots"
        :finishes="collection.finishes"
        :price-cents="totalCents"
        @close="isViewerOpen = false"
        @add="addToCart"
      />
    </section>

    <section class="section section--alt" aria-labelledby="why-title">
      <div class="container">
        <span class="eyebrow" data-reveal>Nos engagements</span>
        <h2 id="why-title" data-reveal>Le haut de gamme devient accessible.</h2>
        <ul class="guarantees">
          <li v-for="item in guarantees" :key="item.label" class="guarantee" data-reveal>
            <span class="guarantee-label">{{ item.label }}</span>
            <strong class="guarantee-value">{{ item.value }}</strong>
            <p>{{ item.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="section section--stage scope-dark" aria-labelledby="showroom-cta-title">
      <div class="container showroom">
        <div class="showroom-info" data-reveal>
          <span class="eyebrow">Showroom · Suresnes</span>
          <h2 id="showroom-cta-title">Voyez les finitions en vrai.</h2>

          <dl class="details">
            <div>
              <dt>Adresse</dt>
              <dd>102 rue Rouget de L'Isle, Suresnes</dd>
            </div>
            <div>
              <dt>Horaires</dt>
              <dd>Lundi au vendredi<br>9h30–12h30 · 14h–18h</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd><a href="tel:+33180881001">01 80 88 10 01</a></dd>
            </div>
          </dl>

          <div class="actions">
            <ButtonLink to="tel:+33180881001">Appeler le showroom</ButtonLink>
            <ButtonLink :to="mapsUrl" variant="ghost">Itinéraire</ButtonLink>
          </div>
        </div>

        <ul class="showroom-cards">
          <li v-for="item in collections" :key="item.slug" data-reveal>
            <NuxtLink :to="`/collections/${item.slug}`" class="showroom-card">
              <img :src="item.photo" :alt="item.alt" loading="lazy" decoding="async">
              <span class="showroom-card-body">
                <span class="showroom-card-origin">{{ item.origin }}</span>
                <span class="showroom-card-name">{{ item.name }}</span>
                <span class="showroom-card-cta">Explorer →</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  padding-top: calc(var(--header-height) + var(--s-6));
}

.lead {
  max-width: 44ch;
  margin-top: var(--s-4);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.layout {
  display: grid;
  gap: var(--s-5);
  align-items: start;
}

/* l'aperçu et son résumé restent visibles pendant qu'on règle les options */
.stage {
  display: grid;
  gap: var(--s-3);
}

.recap {
  display: grid;
  gap: var(--s-2);
  margin: 0;
  padding: var(--s-4);
  border: 1px solid var(--line);
  font-size: var(--fs-small);
}

.recap div {
  display: flex;
  justify-content: space-between;
  gap: var(--s-3);
}

.recap dt {
  color: var(--fg-muted);
}

.recap dd {
  margin: 0;
  text-align: right;
}

.recap-total {
  padding-top: var(--s-2);
  border-top: 1px solid var(--line);
  font-size: 1.25rem;
}

.recap-total dd {
  font-weight: 600;
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

.panel {
  display: grid;
  gap: var(--s-5);
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

.hint {
  width: 100%;
  max-width: 50ch;
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

.step {
  width: 48px;
  height: 48px;
  border: 1px solid var(--line);
  background: none;
  font-size: 1.25rem;
  cursor: pointer;
}

.step:hover:not(:disabled) {
  border-color: var(--fg);
}

.step:disabled,
.reset:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.count {
  min-width: 2ch;
  text-align: center;
  font-size: 1.25rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2);
  width: 100%;
}

.row-label {
  min-width: 7ch;
  font-size: var(--fs-small);
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

.pill--wide {
  padding: 0 var(--s-5);
}

.pill:has(input:checked) {
  background: var(--fg);
  color: var(--bg);
}

.pill:has(input:focus-visible),
.swatch-option:has(input:focus-visible),
.step:focus-visible {
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

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}

.view3d {
  min-height: 48px;
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

.reset {
  min-height: 48px;
  padding: 0 var(--s-4);
  border: 1px solid var(--line);
  background: none;
  cursor: pointer;
}

h2 {
  max-width: 20ch;
}

/* engagements : grands chiffres séparés par des filets, sans cartes */
.guarantees {
  display: grid;
  margin-top: var(--s-6);
  border-top: 1px solid var(--line);
}

.guarantee {
  display: grid;
  gap: var(--s-2);
  align-content: start;
  padding: var(--s-4) 0;
  border-bottom: 1px solid var(--line);
}

.guarantee-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-gold);
}

.guarantee-value {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.guarantee p {
  max-width: 28ch;
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

/* showroom : bande sombre, infos à gauche, collections en visuels à droite */
.showroom {
  display: grid;
  gap: var(--s-6);
  align-items: center;
}

.showroom-info {
  display: grid;
  gap: var(--s-4);
  justify-items: start;
}

.details {
  display: grid;
  gap: var(--s-3);
  width: 100%;
  margin: 0;
}

.details div {
  display: grid;
  gap: var(--s-1);
  padding-bottom: var(--s-3);
  border-bottom: 1px solid var(--line);
}

.details dt {
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

.details dd {
  margin: 0;
}

.details a {
  text-underline-offset: 4px;
}

.showroom-cards {
  display: grid;
  gap: var(--s-3);
}

.showroom-card {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  color: var(--c-white);
  text-decoration: none;
}

.showroom-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--ease);
}

.showroom-card:hover img {
  transform: scale(1.05);
}

.showroom-card-body {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: end;
  gap: var(--s-1);
  padding: var(--s-4);
  background: linear-gradient(180deg, transparent 35%, rgb(0 0 0 / 0.75));
}

.showroom-card-origin {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.8;
}

.showroom-card-name {
  font-size: 2rem;
  font-weight: 300;
  line-height: 1.1;
}

.showroom-card-cta {
  font-size: var(--fs-small);
  font-weight: 600;
}

.showroom-card:focus-visible {
  outline: 2px solid var(--c-gold);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .showroom-card img {
    transition: none;
  }

  .showroom-card:hover img {
    transform: none;
  }
}

@media (min-width: 900px) {
  .layout {
    grid-template-columns: 1fr 1fr;
    gap: var(--s-6);
  }

  .stage {
    position: sticky;
    top: calc(var(--header-height) + var(--s-4));
  }

  .guarantees {
    grid-template-columns: repeat(4, 1fr);
  }

  .guarantee {
    padding: var(--s-5) var(--s-4);
    border-bottom: 0;
    border-left: 1px solid var(--line);
  }

  .guarantee:first-child {
    padding-left: 0;
    border-left: 0;
  }

  .showroom {
    grid-template-columns: 1fr 1fr;
    gap: var(--s-7);
  }

  .showroom-cards {
    grid-template-columns: 1fr 1fr;
  }

  .showroom-card {
    aspect-ratio: 3 / 4;
  }
}
</style>
