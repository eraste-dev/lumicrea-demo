<script setup lang="ts">
import { FREE_SHIPPING_THRESHOLD_CENTS } from '~/data/pricing'

const cart = useCart()
const { isOpen, close } = useCartDrawer()
const route = useRoute()

const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

const remainingForFree = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - cart.subtotalCents.value))
const freeProgress = computed(() =>
  Math.min(100, Math.round((cart.subtotalCents.value / FREE_SHIPPING_THRESHOLD_CENTS) * 100))
)

useModalFocus(isOpen, panel, closeButton, close)

// on referme le tiroir à chaque changement de page
watch(() => route.fullPath, close)
</script>

<template>
  <div v-if="isOpen" class="overlay" @click.self="close">
    <aside
      ref="panel"
      class="drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <header class="head">
        <h2 id="drawer-title">Votre panier <span v-if="cart.count.value" class="badge">{{ cart.count.value }}</span></h2>
        <button ref="closeButton" type="button" class="close" aria-label="Fermer le panier" @click="close">×</button>
      </header>

      <div v-if="cart.items.value.length === 0" class="empty">
        <p>Votre panier est vide.</p>
        <ButtonLink to="/configurateur">Composer ma plaque</ButtonLink>
      </div>

      <template v-else>
        <ul class="lines">
          <li v-for="item in cart.items.value" :key="item.id" class="row">
            <CartLineInfo :item="item" />
            <div class="controls">
              <div class="qty" role="group" :aria-label="`Quantité, ${item.collectionName}`">
                <button type="button" class="step" aria-label="Diminuer la quantité" @click="cart.setQuantity(item.id, item.quantity - 1)">−</button>
                <span class="count" aria-live="polite">{{ item.quantity }}</span>
                <button
                  type="button"
                  class="step"
                  aria-label="Augmenter la quantité"
                  :disabled="item.quantity >= cart.maxQuantity"
                  @click="cart.setQuantity(item.id, item.quantity + 1)"
                >+</button>
              </div>
              <p class="price">{{ formatPrice(item.unitPriceCents * item.quantity) }}</p>
              <button type="button" class="remove" @click="cart.remove(item.id)">Retirer</button>
            </div>
          </li>
        </ul>

        <footer class="foot">
          <div class="free">
            <p v-if="remainingForFree > 0">
              Plus que <strong>{{ formatPrice(remainingForFree) }}</strong> pour la livraison offerte.
            </p>
            <p v-else>Livraison offerte sur votre commande.</p>
            <div class="bar" aria-hidden="true"><span :style="{ width: `${freeProgress}%` }" /></div>
          </div>

          <p class="subtotal">
            <span>Sous-total</span>
            <strong>{{ formatPrice(cart.subtotalCents.value) }}</strong>
          </p>
          <ButtonLink to="/commande" class="cta">Commander</ButtonLink>
          <button type="button" class="continue" @click="close">Continuer mes achats</button>
        </footer>
      </template>
    </aside>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
  background: rgb(0 0 0 / 0.5);
  animation: fade 0.25s ease-out;
}

.drawer {
  display: flex;
  flex-direction: column;
  width: min(100%, 440px);
  height: 100%;
  background: var(--bg-alt);
  color: var(--fg);
  box-shadow: -20px 0 50px -20px rgb(0 0 0 / 0.5);
  animation: slide 0.35s var(--ease);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--s-3) var(--s-4);
  border-bottom: 1px solid var(--line);
}

.head h2 {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-size: 1.25rem;
}

.badge {
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: var(--c-gold);
  color: var(--c-white);
  font-size: 0.75rem;
  font-weight: 700;
}

.close {
  width: 44px;
  height: 44px;
  border: 0;
  background: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
}

.empty {
  display: grid;
  gap: var(--s-4);
  justify-items: start;
  padding: var(--s-5) var(--s-4);
  color: var(--fg-muted);
}

.lines {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--s-4);
}

.row {
  display: grid;
  gap: var(--s-3);
  padding: var(--s-4) 0;
  border-bottom: 1px solid var(--line);
}

.controls {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}

.qty {
  display: flex;
  align-items: center;
}

.step {
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  background: none;
  cursor: pointer;
}

.step:hover:not(:disabled) {
  border-color: var(--fg);
}

.step:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.count {
  min-width: 3ch;
  text-align: center;
}

.price {
  margin-left: auto;
  font-weight: 500;
}

.remove {
  padding: 0;
  border: 0;
  background: none;
  font-size: var(--fs-small);
  color: var(--fg-muted);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

.foot {
  display: grid;
  gap: var(--s-3);
  padding: var(--s-4);
  border-top: 1px solid var(--line);
}

.free {
  display: grid;
  gap: var(--s-2);
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

.bar {
  height: 4px;
  background: var(--line);
}

.bar span {
  display: block;
  height: 100%;
  background: var(--c-gold);
  transition: width 0.4s var(--ease);
}

.subtotal {
  display: flex;
  justify-content: space-between;
  font-size: 1.125rem;
}

.cta {
  width: 100%;
}

.continue {
  justify-self: center;
  padding: var(--s-1);
  border: 0;
  background: none;
  font-size: var(--fs-small);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

@keyframes fade {
  from { opacity: 0; }
}

@keyframes slide {
  from { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .overlay,
  .drawer {
    animation: none;
  }
}
</style>
