<template>
  <section id="interieur" class="section" aria-labelledby="situation-title">
    <div class="container">
      <h2 id="situation-title" data-reveal>Dessiné pour s'intégrer. Pensé pour se distinguer.</h2>
      <p class="text" data-reveal>Dans un intérieur, chaque détail contribue à l'équilibre de l'ensemble.</p>

      <div class="room" data-reveal>
        <RoomPhoto />
      </div>
    </div>
  </section>
</template>

<style scoped>
h2 {
  max-width: 18ch;
}

.text {
  max-width: 46ch;
  margin-top: var(--s-4);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.room {
  margin-top: var(--s-6);
}
</style>
