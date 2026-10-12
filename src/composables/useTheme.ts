export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'lumicrea-theme'

// Clair par défaut. Le choix est mémorisé ; le script de nuxt.config.ts
// l'applique avant le premier rendu pour éviter un flash.
export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light')

  onMounted(() => {
    theme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  })

  function setTheme(next: Theme) {
    theme.value = next
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // stockage indisponible (navigation privée) : le choix vaut pour la session
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme }
}
