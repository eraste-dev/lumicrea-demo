import type { Ref } from 'vue'

const HERO_STAGGER = 0.08
const REVEAL_OFFSET = 24
const COUNT_DURATION = 1.4

// Animations de la page d'accueil, pilotées par des attributs dans le HTML :
//   data-hero      entrée du hero
//   data-reveal    révélation au scroll
//   data-count     compteur qui monte jusqu'à sa valeur
//   data-parallax  décalage vertical en % de la hauteur de l'élément
// Sans JS (ou en mouvement réduit) le contenu reste visible, dans son état final.
export function usePageMotion(scope: Ref<HTMLElement | null>) {
  let context: { revert: () => void } | undefined

  onMounted(async () => {
    const root = scope.value
    if (!root) return

    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    // le composant a pu être démonté pendant l'import
    if (!scope.value) return

    context = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        playHeroEntry(gsap)
        setupReveals(gsap, ScrollTrigger)
        setupCounters(gsap, ScrollTrigger)
        setupParallax(gsap, ScrollTrigger)
      })
    }, root)
  })

  onBeforeUnmount(() => {
    context?.revert()
  })
}

type Gsap = typeof import('gsap').gsap
type Trigger = typeof import('gsap/ScrollTrigger').ScrollTrigger

function playHeroEntry(gsap: Gsap) {
  gsap.from('[data-hero]', {
    y: REVEAL_OFFSET,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: HERO_STAGGER
  })
}

function setupReveals(gsap: Gsap, ScrollTrigger: Trigger) {
  gsap.set('[data-reveal]', { y: REVEAL_OFFSET, opacity: 0 })

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (elements) => {
      gsap.to(elements, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        overwrite: true
      })
    }
  })
}

function setupCounters(gsap: Gsap, ScrollTrigger: Trigger) {
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count)
    if (Number.isNaN(target)) return

    const state = { value: 0 }
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(state, {
          value: target,
          duration: COUNT_DURATION,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(state.value))
          }
        })
      }
    })
  })
}

function setupParallax(gsap: Gsap, ScrollTrigger: Trigger) {
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const shift = Number(el.dataset.parallax)
    if (Number.isNaN(shift)) return

    gsap.to(el, {
      yPercent: shift,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  })
}
