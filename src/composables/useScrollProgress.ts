import type { Ref } from 'vue'

// Progression (0 → 1) du défilement à travers une section.
// Reste à 0 en mouvement réduit : rien ne bouge au scroll dans ce cas.
export function useScrollProgress(target: Ref<HTMLElement | null>) {
  const progress = ref(0)
  let trigger: { kill: () => void } | undefined

  onMounted(async () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)
    if (!target.value) return

    trigger = ScrollTrigger.create({
      trigger: target.value,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.value = self.progress
      }
    })
  })

  onBeforeUnmount(() => trigger?.kill())

  return progress
}
