<script setup lang="ts">
import logoOnLight from '~/assets/images/lumicrea-teste-logo-1631732811.webp'
import logoOnDark from '~/assets/images/logo-lumicrea-blanc-ft.webp'

// Deux versions du logo : on affiche celle qui contraste avec le thème actif.
// Les deux sont décoratives (alt vide) : le lien parent porte le libellé accessible.
</script>

<template>
  <span class="logo">
    <img class="on-light" :src="logoOnLight" alt="" width="2139" height="752" decoding="async">
    <img class="on-dark" :src="logoOnDark" alt="" width="2415" height="884" decoding="async">
  </span>
</template>

<style scoped>
.logo {
  display: block;
  line-height: 0;
}

img {
  display: block;
  width: auto;
  height: var(--logo-height, 40px);
}

.on-dark {
  display: none;
}

[data-theme='dark'] .on-light {
  display: none;
}

[data-theme='dark'] .on-dark {
  display: block;
}
</style>
