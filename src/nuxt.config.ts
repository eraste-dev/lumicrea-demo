export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  srcDir: '.',
  modules: ['@nuxt/fonts'],
  // les sous-dossiers servent à ranger, pas à préfixer les noms
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/tokens.css', '~/assets/css/base.css'],
  typescript: { strict: true },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      // applique le thème mémorisé avant le premier rendu (pas de flash)
      script: [
        {
          innerHTML: "try{if(localStorage.getItem('lumicrea-theme')==='dark')document.documentElement.dataset.theme='dark';if(sessionStorage.getItem('lumicrea-loaded'))document.documentElement.dataset.loaded='1'}catch(e){}",
          tagPosition: 'head'
        }
      ],
      title: 'Lumicrea — Interrupteurs et prises design',
      meta: [
        {
          name: 'description',
          content: "Interrupteurs et prises design, pensés pour dialoguer avec l'architecture de chaque espace."
        }
      ]
    }
  }
})
