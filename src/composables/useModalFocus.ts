import type { Ref } from 'vue'

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled)'

// Comportement commun des fenêtres modales (tiroir, visualiseur) :
// scroll de la page bloqué, focus placé dedans puis restitué, Échap pour fermer,
// Tab qui reste dans la fenêtre.
export function useModalFocus(
  isOpen: Ref<boolean>,
  panel: Ref<HTMLElement | null>,
  initialFocus: Ref<HTMLElement | null>,
  close: () => void
) {
  let previouslyFocused: HTMLElement | null = null

  watch(isOpen, async (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null
      await nextTick()
      initialFocus.value?.focus()
    } else {
      previouslyFocused?.focus()
    }
  })

  function onKeydown(event: KeyboardEvent) {
    if (!isOpen.value) return
    if (event.key === 'Escape') return close()
    if (event.key !== 'Tab' || !panel.value) return

    const focusable = panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  })
}
