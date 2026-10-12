<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container inner">
      <SiteLogo class="logo" />
      <p class="note">© {{ year }} Lumicrea. Tous droits réservés.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding-block: var(--s-5);
  border-top: 1px solid var(--line);
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
}

.logo {
  --logo-height: 36px;
}

.note {
  /* laisse la place au bouton retour en haut */
  padding-right: 72px;
  font-size: var(--fs-small);
  color: var(--fg-muted);
}
</style>
