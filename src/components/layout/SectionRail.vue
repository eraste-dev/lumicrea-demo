<script setup lang="ts">
const props = defineProps<{
  chapters: { id: string; label: string }[]
}>()

const activeIndex = ref(0)
// 0 → 1 : remplissage du filet, aligné sur les points (pas sur le scroll brut)
const fill = ref(0)
let frame = 0

function update() {
  frame = 0
  const line = window.innerHeight * 0.5
  let index = 0
  let local = 0

  props.chapters.forEach((chapter, i) => {
    const el = document.getElementById(chapter.id)
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.top > line) return
    index = i
    local = Math.min(1, Math.max(0, (line - rect.top) / rect.height))
  })

  const last = props.chapters.length - 1
  activeIndex.value = index
  fill.value = last > 0 && index < last ? (index + local) / last : index > 0 ? 1 : 0
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(update)
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <nav class="rail" aria-label="Sections de la page">
    <div class="track" aria-hidden="true">
      <div class="fill" :style="{ transform: `scaleY(${fill})` }" />
    </div>

    <ol class="list">
      <li v-for="(chapter, index) in chapters" :key="chapter.id">
        <a
          class="item"
          :class="{ 'is-active': index === activeIndex }"
          :href="`#${chapter.id}`"
          :aria-current="index === activeIndex ? 'location' : undefined"
        >
          <span class="label">{{ chapter.label }}</span>
          <span class="dot" />
        </a>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
/* uniquement sur grands écrans : en dessous, c'est le bouton retour en haut qui prend le relais */
.rail {
  display: none;
}

@media (min-width: 1100px) {
  .rail {
    position: fixed;
    top: 50%;
    right: 20px;
    z-index: 15;
    display: block;
    padding: 14px 10px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-alt) 88%, transparent);
    backdrop-filter: blur(10px);
    transform: translateY(-50%);
  }
}

.list {
  position: relative;
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* filet qui relie les points ; il se remplit d'un point au suivant */
.track {
  position: absolute;
  inset: 26px auto 26px 50%;
  width: 1px;
  background: var(--line);
  transform: translateX(-50%);
}

.fill {
  height: 100%;
  background: var(--c-gold);
  transform-origin: top;
}

.item {
  position: relative;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
}

.dot {
  width: 7px;
  height: 7px;
  border: 1px solid var(--fg-muted);
  border-radius: 50%;
  background: var(--bg-alt);
  transition: transform 0.25s var(--ease), background 0.25s ease-out, border-color 0.25s ease-out;
}

.item:hover .dot {
  border-color: var(--fg);
}

.item.is-active .dot {
  border-color: var(--c-gold);
  background: var(--c-gold);
  transform: scale(1.5);
}

/* étiquette : visible pour la section active, et pour toutes au survol du rail */
.label {
  position: absolute;
  right: calc(100% + 14px);
  padding: 4px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-alt);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--fg-muted);
  opacity: 0;
  transform: translateX(6px);
  transition: opacity 0.25s ease-out, transform 0.25s var(--ease);
  pointer-events: none;
}

.item.is-active .label {
  opacity: 1;
  transform: none;
  color: var(--fg);
}

.rail:hover .label,
.item:focus-visible .label {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .label,
  .dot {
    transition: none;
  }
}
</style>
