import type { Directive } from 'vue'

// Effets au pointeur : uniquement sur appareils à souris, jamais en mouvement réduit.
function canUsePointerEffects(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type Cleanup = () => void
const cleanups = new WeakMap<HTMLElement, Cleanup>()

// zone d'attraction autour du bouton (px) et décalage maximal (px)
const MAGNETIC_REACH = 36
const MAGNETIC_MAX_SHIFT = 8

// v-magnetic : l'élément est légèrement attiré par le pointeur.
// Le centre est calculé sans le décalage courant et on écoute la fenêtre (zone fixe),
// sinon le bouton se poursuit lui-même et vibre.
const magnetic: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (!canUsePointerEffects()) return
    const strength = binding.value ?? 0.2
    let shiftX = 0
    let shiftY = 0

    const reset = () => {
      if (!shiftX && !shiftY) return
      shiftX = 0
      shiftY = 0
      el.style.translate = ''
    }

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2 - shiftX
      const centerY = rect.top + rect.height / 2 - shiftY
      const dx = event.clientX - centerX
      const dy = event.clientY - centerY

      const reachX = rect.width / 2 + MAGNETIC_REACH
      const reachY = rect.height / 2 + MAGNETIC_REACH
      if (Math.abs(dx) > reachX || Math.abs(dy) > reachY) {
        reset()
        return
      }

      shiftX = clamp(dx * strength, -MAGNETIC_MAX_SHIFT, MAGNETIC_MAX_SHIFT)
      shiftY = clamp(dy * strength, -MAGNETIC_MAX_SHIFT, MAGNETIC_MAX_SHIFT)
      el.style.translate = `${shiftX}px ${shiftY}px`
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', reset)
    cleanups.set(el, () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', reset)
    })
  },
  unmounted(el) {
    cleanups.get(el)?.()
    cleanups.delete(el)
  }
}

// v-spotlight : expose la position du pointeur en variables CSS (--mx / --my)
// pour dessiner un halo qui suit la souris.
const spotlight: Directive<HTMLElement> = {
  mounted(el) {
    if (!canUsePointerEffects()) return

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      el.style.setProperty('--my', `${event.clientY - rect.top}px`)
    }

    el.addEventListener('pointermove', onMove)
    cleanups.set(el, () => el.removeEventListener('pointermove', onMove))
  },
  unmounted(el) {
    cleanups.get(el)?.()
    cleanups.delete(el)
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('magnetic', magnetic)
  nuxtApp.vueApp.directive('spotlight', spotlight)
})
