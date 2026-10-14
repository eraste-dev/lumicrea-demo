<script setup lang="ts">
import { deliveryOptions, shippingCents, vatIncluded, type DeliveryMethod } from '~/data/pricing'
import type { CheckoutForm, FormErrors } from '~/utils/checkoutValidation'

useHead({ title: 'Commande — Lumicrea' })

const PAYMENT_PROCESSING_MS = 1600

const cart = useCart()
const toast = useToast()
const delivery = ref<DeliveryMethod>('standard')
const errors = ref<FormErrors>({})
const isPaying = ref(false)

const form = reactive<CheckoutForm>({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  postalCode: '',
  city: '',
  cardNumber: '',
  cardHolder: '',
  cardExpiry: '',
  cardCvc: ''
})

const shipping = computed(() => shippingCents(delivery.value, cart.subtotalCents.value))
const total = computed(() => cart.subtotalCents.value + shipping.value)

// panier vide : retour (après restauration côté navigateur)
watch(() => cart.isReady.value, (ready) => {
  if (ready && cart.items.value.length === 0) navigateTo('/configurateur')
}, { immediate: true })

const cardNumber = computed({
  get: () => form.cardNumber,
  set: (value: string) => { form.cardNumber = formatCardNumber(value) }
})
const cardExpiry = computed({
  get: () => form.cardExpiry,
  set: (value: string) => { form.cardExpiry = formatExpiry(value) }
})

function validateAll(): FormErrors {
  return {
    ...validateContact(form),
    ...(delivery.value === 'standard' ? validateAddress(form) : {}),
    ...validatePayment(form)
  }
}

// amène le premier champ en erreur à l'écran
async function focusFirstError() {
  await nextTick()
  const firstId = Object.keys(errors.value)[0]
  const field = firstId ? document.getElementById(firstId) : null
  field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  field?.focus({ preventScroll: true })
}

async function pay() {
  if (isPaying.value) return
  errors.value = validateAll()
  if (Object.keys(errors.value).length > 0) {
    toast.push({ message: 'Certains champs sont à corriger avant de payer.' })
    return focusFirstError()
  }

  isPaying.value = true
  // paiement simulé : aucune donnée de carte n'est conservée ni transmise
  await new Promise(resolve => setTimeout(resolve, PAYMENT_PROCESSING_MS))

  saveLastOrder({
    number: generateOrderNumber(),
    placedAt: new Date().toISOString(),
    items: cart.items.value,
    subtotalCents: cart.subtotalCents.value,
    shippingCents: shipping.value,
    totalCents: total.value,
    delivery: delivery.value,
    customer: {
      email: form.email.trim(),
      fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      address: form.address.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim()
    },
    cardLast4: form.cardNumber.replace(/\D/g, '').slice(-4)
  })
  cart.clear()
  form.cardNumber = ''
  form.cardCvc = ''
  await navigateTo('/commande/confirmation')
}
</script>

<template>
  <div>
    <section class="hero section section--alt" aria-labelledby="checkout-title">
      <div class="container">
        <span class="eyebrow">Commande</span>
        <h1 id="checkout-title">Finaliser ma commande</h1>
      </div>
    </section>

    <section class="section" aria-label="Formulaire de commande">
      <div v-if="cart.items.value.length" class="container layout">
        <form class="form" novalidate @submit.prevent="pay">
          <fieldset class="block">
            <legend><span class="num">1</span> Vos informations</legend>
            <div class="fields">
              <FormField id="email" v-model="form.email" class="full" label="E-mail" type="email" autocomplete="email" inputmode="email" :error="errors.email" />
              <FormField id="firstName" v-model="form.firstName" label="Prénom" autocomplete="given-name" :error="errors.firstName" />
              <FormField id="lastName" v-model="form.lastName" label="Nom" autocomplete="family-name" :error="errors.lastName" />
              <FormField id="phone" v-model="form.phone" class="full" label="Téléphone" type="tel" autocomplete="tel" inputmode="tel" :required="false" :error="errors.phone" />
            </div>
          </fieldset>

          <fieldset class="block">
            <legend><span class="num">2</span> Livraison</legend>
            <div class="options">
              <label v-for="option in deliveryOptions" :key="option.id" class="option">
                <input v-model="delivery" class="sr-only" type="radio" name="delivery" :value="option.id">
                <span class="option-body">
                  <strong>{{ option.label }}</strong>
                  <span>{{ option.detail }}</span>
                </span>
                <span class="option-price">
                  {{ shippingCents(option.id, cart.subtotalCents.value) === 0 ? 'Offerte' : formatPrice(shippingCents(option.id, cart.subtotalCents.value)) }}
                </span>
              </label>
            </div>

            <div v-if="delivery === 'standard'" class="fields">
              <FormField id="address" v-model="form.address" class="full" label="Adresse" autocomplete="street-address" :error="errors.address" />
              <FormField id="postalCode" v-model="form.postalCode" label="Code postal" autocomplete="postal-code" inputmode="numeric" :maxlength="5" :error="errors.postalCode" />
              <FormField id="city" v-model="form.city" label="Ville" autocomplete="address-level2" :error="errors.city" />
            </div>
          </fieldset>

          <fieldset class="block">
            <legend><span class="num">3</span> Paiement par carte</legend>
            <div class="fields">
              <FormField id="cardNumber" v-model="cardNumber" class="full" label="Numéro de carte" autocomplete="cc-number" inputmode="numeric" placeholder="1234 5678 9012 3456" :error="errors.cardNumber" />
              <FormField id="cardHolder" v-model="form.cardHolder" class="full" label="Titulaire de la carte" autocomplete="cc-name" :error="errors.cardHolder" />
              <FormField id="cardExpiry" v-model="cardExpiry" label="Expiration" autocomplete="cc-exp" inputmode="numeric" placeholder="MM / AA" :error="errors.cardExpiry" />
              <FormField id="cardCvc" v-model="form.cardCvc" label="Cryptogramme" autocomplete="cc-csc" inputmode="numeric" :maxlength="3" placeholder="123" :error="errors.cardCvc" />
            </div>
          </fieldset>

          <button type="submit" class="pay" :disabled="isPaying">
            {{ isPaying ? 'Paiement en cours…' : `Payer ${formatPrice(total)}` }}
          </button>
        </form>

        <aside class="summary" aria-labelledby="order-title">
          <h2 id="order-title">Votre commande</h2>
          <ul class="items">
            <li v-for="item in cart.items.value" :key="item.id" class="item">
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
              <dd>{{ formatPrice(cart.subtotalCents.value) }}</dd>
            </div>
            <div>
              <dt>Livraison</dt>
              <dd>{{ shipping === 0 ? 'Offerte' : formatPrice(shipping) }}</dd>
            </div>
            <div class="grand">
              <dt>Total TTC</dt>
              <dd>{{ formatPrice(total) }}</dd>
            </div>
            <div class="vat">
              <dt>dont TVA (20 %)</dt>
              <dd>{{ formatPrice(vatIncluded(total)) }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  padding-top: calc(var(--header-height) + var(--s-5));
  padding-bottom: var(--s-5);
}

.layout {
  display: grid;
  gap: var(--s-6);
  align-items: start;
}

.form {
  display: grid;
  gap: var(--s-5);
}

.block {
  margin: 0;
  padding: 0 0 var(--s-5);
  border: 0;
  border-bottom: 1px solid var(--line);
}

.block legend {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  margin-bottom: var(--s-4);
  padding: 0;
  font-size: 1.25rem;
  font-weight: 300;
}

.num {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--c-gold);
  border-radius: 50%;
  color: var(--c-gold);
  font-size: 0.8125rem;
  font-weight: 600;
}

.fields {
  display: grid;
  gap: var(--s-3);
  margin-top: var(--s-4);
}

.options {
  display: grid;
  gap: var(--s-2);
}

.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.2s ease-out;
}

.option:hover {
  border-color: var(--fg-muted);
}

.option:has(input:checked) {
  border-color: var(--fg);
  box-shadow: inset 0 0 0 1px var(--fg);
}

.option:has(input:focus-visible) {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
}

.option-body {
  display: grid;
  gap: 2px;
  font-size: var(--fs-small);
  color: var(--fg-muted);
}

.option-body strong {
  font-size: var(--fs-body);
  font-weight: 500;
  color: var(--fg);
}

.option-price {
  font-weight: 600;
}

.pay {
  min-height: 56px;
  border: 0;
  border-radius: var(--radius);
  background: var(--btn-bg);
  color: var(--btn-fg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease-out;
}

.pay:hover:not(:disabled) {
  background: var(--btn-bg-hover);
}

.pay:disabled {
  opacity: 0.6;
  cursor: progress;
}

.summary {
  padding: var(--s-5);
  border: 1px solid var(--line);
  background: var(--bg-alt);
}

.summary h2 {
  margin-bottom: var(--s-4);
  font-size: 1.5rem;
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

@media (min-width: 700px) {
  .fields {
    grid-template-columns: 1fr 1fr;
  }

  .fields .full {
    grid-column: 1 / -1;
  }
}

@media (min-width: 900px) {
  .layout {
    grid-template-columns: 1fr 420px;
    gap: var(--s-7);
  }

  .summary {
    position: sticky;
    top: calc(var(--header-height) + var(--s-4));
  }
}
</style>
