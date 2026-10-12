<script setup lang="ts">
const isOpen = ref(false)

const links = [
  { to: '/collections/vendome', label: 'Vendôme' },
  { to: '/collections/axess', label: 'aXess' },
  { to: '/configurateur', label: 'Configurateur' },
  { to: '/#realisations', label: 'Réalisations' }
]

const cart = useCart()
const cartDrawer = useCartDrawer()
const cartLabel = computed(() =>
  cart.count.value > 0 ? `Panier, ${cart.count.value} article${cart.count.value > 1 ? 's' : ''}` : 'Panier'
)

// on referme le menu à chaque changement de page
const route = useRoute()
watch(() => route.fullPath, () => {
  isOpen.value = false
})

// le router ignore le hash : "/#realisations" serait toujours actif sur l'accueil
function isActive(to: string): boolean {
  return !to.includes('#') && route.path.startsWith(to)
}

// pas de scroll de la page derrière le menu mobile
watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') isOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="header">
    <div class="container bar">
      <NuxtLink to="/" class="logo" aria-label="Lumicrea, accueil">
        <SiteLogo />
      </NuxtLink>

      <nav id="menu" class="nav" :class="{ 'is-open': isOpen }" aria-label="Navigation principale">
        <ul class="nav-list">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="nav-link"
              :class="{ 'is-active': isActive(link.to) }"
              :aria-current="isActive(link.to) ? 'page' : undefined"
            >{{ link.label }}</NuxtLink>
          </li>
        </ul>
        <ButtonLink to="/configurateur" variant="ghost">Composer ma plaque</ButtonLink>
      </nav>

      <div class="tools">
        <button type="button" class="cart" :aria-label="cartLabel" aria-haspopup="dialog" @click="cartDrawer.open">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M5 8h14l-1 12H6L5 8Z" stroke-linejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke-linecap="round" />
          </svg>
          <span v-if="cart.isReady.value && cart.count.value > 0" class="cart-count">{{ cart.count.value }}</span>
        </button>
        <ThemeToggle />
        <button
          class="burger"
          type="button"
          :aria-expanded="isOpen"
          aria-controls="menu"
          @click="isOpen = !isOpen"
        >
          <span class="sr-only">{{ isOpen ? 'Fermer le menu' : 'Ouvrir le menu' }}</span>
          <span class="burger-line burger-line--top" :class="{ 'is-open': isOpen }" />
          <span class="burger-line burger-line--bottom" :class="{ 'is-open': isOpen }" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* fixe : reste visible pendant tout le défilement */
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: var(--z-header);
  color: var(--fg);
  border-bottom: 1px solid var(--line);
}

/* fond translucide flouté ; sur un pseudo-élément, pour ne pas casser le menu mobile en `fixed` */
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--bg-alt) 92%, transparent);
  backdrop-filter: blur(12px);
}

.bar {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  height: var(--header-height);
}

.logo {
  --logo-height: 46px;
  position: relative;
  z-index: calc(var(--z-menu) + 1);
  margin-right: auto;
}

/* toujours au-dessus du panneau du menu mobile, sinon on ne peut plus le fermer */
.tools {
  position: relative;
  z-index: calc(var(--z-menu) + 1);
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

.cart {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.cart-count {
  position: absolute;
  top: 4px;
  right: 2px;
  display: grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--c-gold);
  color: var(--c-white);
  font-size: 0.6875rem;
  font-weight: 700;
}

.burger {
  display: grid;
  gap: 7px;
  place-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.burger-line {
  width: 24px;
  height: 1px;
  background: currentColor;
  transition: transform 0.25s var(--ease);
}

.burger-line--top.is-open {
  transform: translateY(4px) rotate(45deg);
}

.burger-line--bottom.is-open {
  transform: translateY(-4px) rotate(-45deg);
}

/* menu mobile : panneau plein écran */
.nav {
  position: fixed;
  inset: 0;
  z-index: var(--z-menu);
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: var(--s-5);
  padding: var(--gutter);
  background: var(--bg-alt);
}

.nav.is-open {
  display: flex;
}

.nav-list {
  display: grid;
  gap: var(--s-4);
  font-size: 2rem;
  font-weight: 300;
}

.nav-link {
  text-decoration: none;
}

@media (min-width: 900px) {
  .burger {
    display: none;
  }

  .logo {
    margin-right: 0;
  }

  .nav,
  .nav.is-open {
    position: static;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--s-5);
    margin-left: auto;
    padding: 0;
    background: none;
  }

  .nav-list {
    display: flex;
    gap: var(--s-5);
    font-size: var(--fs-small);
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .nav-link {
    padding-block: var(--s-2);
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease-out;
  }

  .nav-link:hover,
  .nav-link.is-active {
    border-color: var(--c-gold);
  }
}
</style>
