// Côté serveur on suppose "pas de préférence", la vraie valeur est lue au montage.
export function useReducedMotion() {
  const isReduced = ref(false)

  onMounted(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    isReduced.value = query.matches

    const update = (event: MediaQueryListEvent) => {
      isReduced.value = event.matches
    }
    query.addEventListener('change', update)
    onBeforeUnmount(() => query.removeEventListener('change', update))
  })

  return isReduced
}
