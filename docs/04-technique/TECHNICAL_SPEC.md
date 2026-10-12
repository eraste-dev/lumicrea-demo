# Technical Specification — Lumicrea

## 1. Stack
Versions vérifiées sur npm le 2026-10-12 ; à figer dans le lockfile à l'initialisation.

| Besoin | Choix | Version | Remarque |
|---|---|---|---|
| Framework | `nuxt` (structure `app/`) | 4.6.1 | Vue 3 Composition API, TypeScript strict si le dépôt le permet |
| 3D | `three` + `@types/three` | 0.186.x | Loaders et `OrbitControls` fournis par Three.js (ADR 0002) |
| Animation | `gsap` (+ ScrollTrigger) | 3.15.0 | Licence « no charge » de GSAP, non MIT : à vérifier pour l'usage |
| Défilement lissé | `lenis` | 1.3.x | Optionnel, seulement si justifié |
| Images | `@nuxt/image` | 2.1.0 | AVIF/WebP, `srcset` |
| Polices | `@nuxt/fonts` | 1.0.1 | Auto-hébergement |
| i18n | `@nuxtjs/i18n` | 10.6.0 | Seulement si le site est bilingue |
| Utilitaires | `@vueuse/nuxt` | 15.0.0 | Observers, `prefers-reduced-motion` |
| Validation | `zod` | 4.6.x | Schémas de données dans l'adapter |
| Assets 3D | `@gltf-transform/cli` | 4.5.x | Draco, KTX2, rapport de tailles |
| Tests | `vitest` + `@nuxt/test-utils` | 5.0.x / 4.3.x | Domaine et composables |
| Lint | `@nuxt/eslint` + `eslint-plugin-boundaries` | 1.17.x / 7.2.x | Impose la règle de dépendance |

- CSS moderne avec variables de design (tokens), sans framework utilitaire.
- GLB/GLTF pour les modèles ; HDR/EXR selon le pipeline et les licences.
- Draco et KTX2/Basis seulement si le gain de transfert est réel et le pipeline disponible.

Écartés volontairement : TresJS (ADR 0002), `@nuxt/ui` ou tout kit de composants complet, Tailwind, Pinia. Le client attend un code maîtrisé, pas un assemblage de composants.

Ne pas ajouter une dépendance sans besoin précis. Inspecter le dépôt et réutiliser les conventions existantes.

## 2. Architecture et structure

### 2.1 Principes
Architecture en couches (hexagonale légère), dépendances dirigées vers le domaine. Décision tracée dans `docs/adr/0001-architecture-en-couches.md`.

```text
Présentation (pages, components) → Application (composables) → Domaine ← Infrastructure (adapters)
```

- **Domaine** (`app/domain/`) : TypeScript pur. Interdit d'importer `vue`, `nuxt`, `three`, `gsap`. Contient les entités (`Product`, `Finish`) et les ports (interfaces).
- **Infrastructure** (`app/adapters/`) : implémentations des ports (Three.js, GSAP, source de données).
- **Application** (`app/composables/`) : orchestre les cas d'usage en dépendant des ports, jamais des adapters.
- **Présentation** : composants fins, sans logique métier.
- **Composition** (`app/providers/container.ts`) : seul endroit qui connaît les implémentations concrètes (injection via plugin Nuxt ou `provide/inject`).

| SOLID | Application |
|---|---|
| S | Un module = une raison de changer (rendu, chargement GLB, matériaux, animation séparés). |
| O | Finitions et presets de matériaux sont des données ; en ajouter ne modifie aucun composant. |
| L | Tout `SceneRenderer` est substituable (Three.js, image statique de repli). |
| I | Ports petits et ciblés (`ModelLoader`, `SceneRenderer`, `MotionController`). |
| D | Les composables dépendent des interfaces du domaine ; le conteneur injecte les implémentations. |

Ne pas sur-architecturer : les ports ne sont introduits que pour les frontières qui peuvent réellement changer (moteur 3D, source de données, animation). L'UI reste du Vue simple.

### 2.2 Arborescence
```text
nuxt.config.ts
public/                        # servi tel quel : modèles optimisés, textures, images
  models/  textures/  images/
assets-src/                    # sources lourdes, hors build (Git LFS recommandé)
scripts/optimize-assets.mjs    # gltf-transform : Draco/KTX2, rapport de tailles
tests/  unit/  e2e/
docs/adr/
app/
  domain/
    product/  Product.ts  Finish.ts  ProductRepository.ts
    scene/    SceneRenderer.ts  ModelLoader.ts
    motion/   MotionController.ts
  adapters/
    three/    ThreeSceneRenderer.ts  GltfModelLoader.ts  materialPresets.ts
    gsap/     GsapMotionController.ts
    data/     StaticProductRepository.ts  schema.ts   # validation (zod), IDs stables
  composables/
    useProductScene.ts  useFinishSelection.ts  useScrollAnimation.ts  useReducedMotion.ts
  components/
    ui/  layout/  sections/
    scene/  SceneCanvas.client.vue  SceneFallback.vue
  providers/  container.ts
  constants/  motion.ts  limits.ts
  assets/css/  tokens.css  base.css
  pages/  index.vue  collections/vendome.vue  configurateur.vue
i18n/locales/  fr.json            # en.json si bilingue
```
`public/` reste à la racine du projet. Adapter après inspection du dépôt existant ; ne pas déplacer massivement les fichiers sans justification.

### 2.3 Garde-fous
- Règle ESLint (`eslint-plugin-boundaries` ou `import/no-restricted-paths`) : `domain/` n'importe ni `vue`, ni `nuxt`, ni `three`, ni `gsap` ; `composables/` et `components/` n'importent pas `adapters/`.
- Tout code WebGL est dans des composants `.client.vue` ou initialisé après montage.
- Domaine et composables testés en unitaire sans DOM ; adapters Three.js en test d'intégration.

## 3. Règles Nuxt / SSR
- Ne pas accéder à `window`, `document` ou au contexte WebGL pendant le rendu serveur.
- Initialiser Three.js uniquement côté client, par exemple après montage du composant.
- Utiliser un composant client uniquement si nécessaire.
- S'assurer que le contenu principal et les CTA restent disponibles même si le WebGL n'est pas chargé.
- Éviter les différences d'hydratation dues aux valeurs aléatoires ou aux mesures côté client.

## 4. Cycle de vie Three.js
- Créer le renderer, la scène, la caméra et les contrôles au montage client.
- Utiliser `ResizeObserver` ou une stratégie équivalente pour adapter le renderer à son conteneur.
- Limiter `devicePixelRatio` sur les appareils denses.
- Arrêter la boucle de rendu lorsque la scène n'est plus visible si l'architecture le permet.
- Lors du démontage : annuler les animations, retirer les listeners, libérer les géométries, matériaux, textures, render targets et renderer.
- Éviter de recréer la scène à chaque mise à jour réactive.
- Prévoir un état d'erreur et une image de repli.

## 5. Matériaux
- Utiliser `MeshPhysicalMaterial` lorsque ses propriétés servent le résultat.
- Pour le métal brossé, combiner une texture de surface de qualité et une réponse de matière crédible ; ne pas confondre l'anisotropie avec un simple bruit visuel.
- L'anisotropie doit être utilisée uniquement si la version de Three.js et le chemin de rendu choisi la prennent correctement en charge.
- Prévoir un environnement HDR pour les reflets.
- Tester le rendu sur plusieurs expositions et environnements.
- Les finitions simulées doivent être présentées comme des aperçus si elles ne sont pas validées par le client.

## 6. Chargement et optimisation
- Charger le modèle principal de façon différée lorsque cela ne nuit pas à l'expérience initiale.
- Afficher un fallback image et le contenu HTML immédiatement.
- Utiliser Draco uniquement si la compression/décompression est correctement configurée.
- Utiliser KTX2 avec le transcoder et le pipeline adaptés.
- Précharger uniquement les ressources nécessaires à court terme.
- Contrôler la taille des modèles, textures et fichiers HDR.
- Sur mobile, réduire le pixel ratio, la résolution des textures et la complexité de la scène.
- Ne pas charger plusieurs scènes lourdes en parallèle.
- Documenter les tailles d'assets et les compromis.

## 6-bis. Images
- Utiliser `@nuxt/image` (AVIF/WebP, `srcset`) ou un pipeline équivalent, selon les conventions du dépôt.
- Spécifications visuelles complètes dans `02-design/IMAGE_SPECS.md` ; l'image LCP n'est jamais en lazy-loading.
- Politique de sécurité : n'accepter que des images locales ou d'un domaine déclaré ; aucun contenu tiers non listé.
- Pas de bibliothèque d'animation chargée avant l'interaction si elle n'est pas nécessaire (import dynamique de Three.js et ScrollTrigger).

## 7. Données de démonstration
- Centraliser les produits et finitions dans des fichiers typés.
- Séparer les données de présentation de la logique de composants.
- Ne pas dupliquer les noms de finitions dans plusieurs fichiers.
- Les prix et stocks ne doivent pas être inclus s'ils ne sont pas validés.
- Prévoir des identifiants stables pour les produits et finitions.

## 8. Qualité
- `npm run build` ou commande équivalente doit réussir.
- Corriger les erreurs TypeScript liées au code ajouté.
- Vérifier la console du navigateur.
- Tester les trois routes directement et via navigation interne.
- Vérifier le clavier, les états actifs, les erreurs de chargement et le mode mouvement réduit.
- Contrôler au minimum un viewport desktop et un viewport mobile.
- Utiliser Lighthouse ou les outils DevTools pour détecter les problèmes majeurs ; ne pas promettre un score spécifique avant mesure.
