<script setup lang="ts">
import { vatIncluded } from '~/data/pricing'
import type { Order } from '~/composables/useOrder'

useHead({ title: 'Commande confirmée — Lumicrea', meta: [{ name: 'robots', content: 'noindex' }] })

const SHOWROOM_ADDRESS = "Showroom Lumicrea · 102 rue Rouget de L'Isle, 92150 Suresnes"

const order = ref<Order | null>(null)
const isLoaded = ref(false)

// la commande vit dans sessionStorage : lecture côté navigateur uniquement
onMounted(() => {
  order.value = loadLastOrder()
  isLoaded.value = true
  if (!order.value) navigateTo('/')
})

const placedOn = computed(() =>
  order.value
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(order.value.placedAt))
    : ''
)

const deliveryText = computed(() => {
  if (!order.value) return ''
  const { delivery, customer } = order.value
  return delivery === 'showroom'
    ? `Retrait gratuit — ${SHOWROOM_ADDRESS}`
    : `${customer.fullName}, ${customer.address}, ${customer.postalCode} ${customer.city}`
})
</script>

<template>
  <div>
    <section class="hero section section--alt" aria-labelledby="done-title">
      <div class="container">
        <span class="eyebrow">Commande confirmée</span>
        <h1 id="done-title">Merci pour votre commande.</h1>
        <p v-if="order" class="lead">
          Votre commande est enregistrée au nom de <strong>{{ order.customer.fullName }}</strong>
          ({{ order.customer.email }}).
        </p>
      </div>
    </section>

    <section v-if="order" class="section" aria-label="Récapitulatif de la commande">
      <div class="container layout">
        <dl class="facts">
          <div>
            <dt>Numéro de commande</dt>
            <dd class="number">{{ order.number }}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{{ placedOn }}</dd>
          </div>
          <div>
            <dt>{{ order.delivery === 'showroom' ? 'Retrait' : 'Livraison' }}</dt>
            <dd>{{ deliveryText }}</dd>
          </div>
          <div>
            <dt>Paiement</dt>
            <dd>Carte se terminant par {{ order.cardLast4 }}</dd>
          </div>
        </dl>

        <div class="recap">
          <ul class="items">
            <li v-for="item in order.items" :key="item.id" class="item">
              <CartLineInfo :item="item" />
              <p class="item-price">
                <span class="qty">× {{ item.quantity }}</span>
                {{ formatPrice(item.unitPriceCents * item.quantity) }}
              </p>
            </li>
          </ul>

          <dl class="totals">
            <div>
              <dt>Sous-total</dt>
              <dd>{{ formatPrice(order.subtotalCents) }}</dd>
            </div>
            <div>
              <dt>Livraison</dt>
              <dd>{{ order.shippingCents === 0 ? 'Offerte' : formatPrice(order.shippingCents) }}</dd>
            </div>
            <div class="grand">
              <dt>Total TTC</dt>
              <dd>{{ formatPrice(order.totalCents) }}</dd>
            </div>
            <div class="vat">
              <dt>dont TVA (20 %)</dt>
              <dd>{{ formatPrice(vatIncluded(order.totalCents)) }}</dd>
            </div>
          </dl>
        </div>

        <div class="actions">
          <ButtonLink to="/">Retour à l'accueil</ButtonLink>
          <ButtonLink to="/configurateur" variant="ghost">Composer une autre plaque</ButtonLink>
        </div>
      </div>
    </section>

    <section v-else-if="!isLoaded" class="section" aria-busy="true" />
  </div>
</template>

<style scoped>
.hero {
  padding-top: calc(var(--header-height) + var(--s-6));
}

.lead {
  margin-top: var(--s-3);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.layout {
  display: grid;
  gap: var(--s-6);
}

.facts {
  display: grid;
  gap: var(--s-4);
  margin: 0;
}

.facts dt,
.totals dt {
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

.facts dd {
  margin: var(--s-1) 0 0;
}

.number {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 0.04em;
}

.recap {
  padding: var(--s-5);
  border: 1px solid var(--line);
  background: var(--bg-alt);
}

.items {
  display: grid;
  gap: var(--s-3);
}

.item {
  display: grid;
  gap: var(--s-2);
  padding-bottom: var(--s-3);
  border-bottom: 1px solid var(--line);
}

.item-price {
  justify-self: end;
  font-weight: 500;
}

.qty {
  margin-right: var(--s-2);
  font-weight: 400;
  color: var(--fg-muted);
}

.totals {
  display: grid;
  gap: var(--s-2);
  margin: var(--s-4) 0 0;
}

.totals div {
  display: flex;
  justify-content: space-between;
  gap: var(--s-3);
}

.totals dd {
  margin: 0;
}

.grand {
  padding-top: var(--s-3);
  border-top: 1px solid var(--line);
  font-size: 1.25rem;
  font-weight: 600;
}

.vat {
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}

@media (min-width: 900px) {
  .layout {
    grid-template-columns: 1fr 1fr;
    gap: var(--s-7);
  }

  .actions {
    grid-column: 1 / -1;
  }
}
</style>
