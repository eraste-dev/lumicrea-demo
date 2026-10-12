<template>
  <SiteLoader />
  <a class="skip-link" href="#contenu">Aller au contenu</a>
  <SiteHeader />
  <main id="contenu">
    <NuxtPage />
  </main>
  <SiteFooter />
  <BackToTop />
  <CartDrawer />
  <ToastHost />
</template>

<style>
.skip-link {
  position: absolute;
  top: -100px;
  left: var(--s-3);
  z-index: 100;
  padding: var(--s-2) var(--s-3);
  background: var(--c-white);
  color: var(--c-graphite);
}

.skip-link:focus {
  top: var(--s-3);
}
</style>
