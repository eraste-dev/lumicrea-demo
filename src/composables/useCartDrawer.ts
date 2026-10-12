// État d'ouverture du tiroir panier, partagé entre le header, les toasts et le tiroir.
export function useCartDrawer() {
  const isOpen = useState('cart-drawer-open', () => false)

  return {
    isOpen,
    open: () => { isOpen.value = true },
    close: () => { isOpen.value = false }
  }
}
