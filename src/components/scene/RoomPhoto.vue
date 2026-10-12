<script setup lang="ts">
import ambiance from '~/assets/images/home/ambiance-laiton.webp'

// Photo d'ambiance du site actuel. Un bouton posé sur l'interrupteur permet
// d'éteindre et de rallumer la pièce (voile sombre).
const isOn = ref(true)
</script>

<template>
  <figure class="room">
    <div class="viewport">
      <!-- le cadre garde le ratio de la photo : le bouton reste calé sur l'interrupteur -->
      <div class="frame">
        <img
          class="photo"
          :src="ambiance"
          alt="Interrupteur à levier en laiton brossé sur un mur d'enduit beige, dans un intérieur aux tons chauds"
          width="1600"
          height="836"
          loading="lazy"
          decoding="async"
        >
        <div class="night" :class="{ 'is-on': !isOn }" />

        <button
          class="switch"
          :class="{ 'is-off': !isOn }"
          type="button"
          :aria-pressed="isOn"
          :aria-label="isOn ? 'Éteindre la lumière' : 'Allumer la lumière'"
          @click="isOn = !isOn"
        />
      </div>
    </div>

    <figcaption class="caption">
      {{ isOn ? "Essayez : appuyez sur l'interrupteur." : 'Appuyez à nouveau pour rallumer.' }}
    </figcaption>
  </figure>
</template>

<style scoped>
.room {
  margin: 0;
}

.viewport {
  position: relative;
  overflow: hidden;
  background: #2a2623;
}

.frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1600 / 836;
}

.photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* voile de nuit, avec un reste de lueur autour de l'interrupteur */
.night {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 28% 44%,
    rgb(8 10 18 / 0.55) 0%,
    rgb(8 10 18 / 0.86) 45%
  );
  opacity: 0;
  transition: opacity 0.6s ease-out;
  pointer-events: none;
}

.night.is-on {
  opacity: 1;
}

/* zone cliquable : la plaque de la photo (14,7 % → 38,7 % en largeur, 18,7 % → 67,7 % en hauteur) */
.switch {
  position: absolute;
  top: 18.7%;
  left: 14.7%;
  width: 24%;
  height: 49%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

/* anneau qui invite à cliquer, joué trois fois puis stoppé */
.switch::after {
  content: '';
  position: absolute;
  top: 52%;
  left: 54%;
  width: 14%;
  aspect-ratio: 1;
  border: 1px solid rgb(255 255 255 / 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ping 2.2s ease-out 3;
  pointer-events: none;
}

.switch.is-off::after {
  animation: none;
  opacity: 0;
}

.switch:focus-visible {
  outline: 2px solid var(--c-gold);
  outline-offset: -4px;
}

@keyframes ping {
  0% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(0.5);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2.4);
  }
}

.caption {
  margin-top: var(--s-3);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg);
}

/* mobile : cadre plus haut, on ne garde que la partie gauche de la photo (où est la plaque) */
@media (max-width: 899px) {
  .viewport {
    aspect-ratio: 4 / 5;
  }

  .frame {
    position: absolute;
    inset: 0 auto 0 0;
    width: auto;
    height: 100%;
    aspect-ratio: 1600 / 836;
  }
}

@media (prefers-reduced-motion: reduce) {
  .night {
    transition: none;
  }

  .switch::after {
    animation: none;
  }
}
</style>
