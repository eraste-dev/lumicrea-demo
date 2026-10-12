<template>
  <section id="showroom" class="section" aria-labelledby="showroom-title">
    <div class="container inner">
      <div>
        <span class="eyebrow" data-reveal>Showroom</span>
        <h2 id="showroom-title" data-reveal>Venez toucher la matière.</h2>
        <p class="lead" data-reveal>
          Au showroom de Suresnes, comparez les finitions en main et laissez-vous conseiller sur votre projet.
        </p>
      </div>

      <address class="details" data-reveal>
        <p>
          <strong>Lumicrea</strong><br>
          102 rue Rouget de L'Isle<br>
          Suresnes
        </p>
        <p>
          Du lundi au vendredi<br>
          9h30 – 12h30 · 14h – 18h
        </p>
        <p>
          <a class="phone" href="tel:+33180881001">01 80 88 10 01</a>
        </p>
        <ButtonLink to="/contact">Nous contacter</ButtonLink>
      </address>
    </div>
  </section>
</template>

<style scoped>
.inner {
  display: grid;
  gap: var(--s-6);
  align-items: end;
}

.lead {
  max-width: 40ch;
  margin-top: var(--s-4);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.details {
  display: grid;
  gap: var(--s-4);
  justify-items: start;
  padding-top: var(--s-4);
  border-top: 1px solid var(--line);
  font-style: normal;
}

.phone {
  font-size: 1.5rem;
  font-weight: 300;
  text-decoration: none;
  border-bottom: 1px solid var(--c-gold);
}

@media (min-width: 900px) {
  .inner {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
