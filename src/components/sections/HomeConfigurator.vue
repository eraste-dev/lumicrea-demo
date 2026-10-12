<script setup lang="ts">
import { finishes, defaultFinish } from '~/data/finishes'

const sizes = [1, 2, 3]

const slots = ref(2)
const finishId = ref(defaultFinish.id)
const finish = computed(() => finishes.find(f => f.id === finishId.value) ?? defaultFinish)
</script>

<template>
  <section id="composer" class="section" aria-labelledby="config-title">
    <div class="container inner">
      <div class="text">
        <span class="eyebrow" data-reveal>Configurateur</span>
        <h2 id="config-title" data-reveal>Composez votre plaque.</h2>
        <p class="lead" data-reveal>
          Choisissez une plaque et explorez les possibilités de composition selon vos besoins.
        </p>
        <ButtonLink to="/configurateur" class="cta" data-reveal>Essayer le configurateur</ButtonLink>
      </div>

      <div class="composer" data-reveal>
        <div
          class="preview"
          :style="{ '--tone': finish.tone, '--light': finish.highlight, '--slots': slots }"
        >
          <div class="plate" role="img" :aria-label="`Plaque ${slots} poste${slots > 1 ? 's' : ''}, finition ${finish.name}`">
            <span v-for="n in slots" :key="n" class="rocker" />
          </div>
        </div>

        <fieldset class="group">
          <legend class="label">Postes</legend>
          <label v-for="size in sizes" :key="size" class="size">
            <input v-model="slots" class="sr-only" type="radio" name="slots" :value="size">
            <span>{{ size }}</span>
          </label>
        </fieldset>

        <fieldset class="group">
          <legend class="label">Finition : {{ finish.name }}</legend>
          <label v-for="item in finishes" :key="item.id" class="swatch-option" :title="item.name">
            <input v-model="finishId" class="sr-only" type="radio" name="composer-finish" :value="item.id">
            <span class="swatch" :style="{ background: item.tone }" />
            <span class="sr-only">{{ item.name }}</span>
          </label>
        </fieldset>
      </div>
    </div>
  </section>
</template>

<style scoped>
.inner {
  display: grid;
  gap: var(--s-6);
  align-items: center;
}

.lead {
  max-width: 40ch;
  margin-top: var(--s-4);
  font-size: var(--fs-lead);
  color: var(--fg-muted);
}

.cta {
  margin-top: var(--s-5);
}

.composer {
  display: grid;
  gap: var(--s-4);
  padding: var(--s-5) var(--s-4);
  border: 1px solid var(--line);
  background: var(--bg-alt);
}

.preview {
  display: grid;
  place-items: center;
  min-height: 220px;
}

/* la plaque s'allonge avec le nombre de postes */
.plate {
  display: grid;
  grid-template-columns: repeat(var(--slots), 1fr);
  gap: 14%;
  align-items: center;
  width: calc(var(--slots) * 24% + 14%);
  max-width: 100%;
  aspect-ratio: calc(var(--slots) * 0.7 + 0.3) / 1;
  padding: 8%;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--light), var(--tone) 55%);
  box-shadow: 0 24px 40px -18px rgb(0 0 0 / 0.5), inset 0 0 0 1px rgb(255 255 255 / 0.12);
  transition: width 0.4s var(--ease), aspect-ratio 0.4s var(--ease), background 0.3s ease-in-out;
}

.rocker {
  height: 62%;
  background: linear-gradient(160deg, var(--light), var(--tone));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.35), 0 4px 8px rgb(0 0 0 / 0.3);
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

.size {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.2s ease-out, background 0.2s ease-out;
}

.size:hover {
  border-color: var(--fg);
}

.size:has(input:checked) {
  background: var(--fg);
  color: var(--bg);
}

.size:has(input:focus-visible),
.swatch-option:has(input:focus-visible) {
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
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.25), 0 0 0 2px var(--bg-alt), 0 0 0 4px var(--fg);
}

@media (min-width: 900px) {
  .inner {
    grid-template-columns: 1fr 1fr;
  }

  .composer {
    padding: var(--s-5);
  }
}
</style>
