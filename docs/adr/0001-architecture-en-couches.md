# ADR 0001 — Architecture en couches (hexagonale légère)

- **Statut** : accepté
- **Date** : 2026-10-12

## Contexte
Front Nuxt/Vue avec scène Three.js et animations GSAP, devant rester maintenable et testable dans le temps. Le moteur 3D, la source de données et la lib d'animation sont les dépendances les plus susceptibles de changer.

## Décision
Quatre couches : Présentation → Application → Domaine ← Infrastructure. Le domaine est en TypeScript pur et définit des ports (interfaces) ; les adapters (Three.js, GSAP, données) les implémentent ; un conteneur unique (`providers/container.ts`) assemble le tout. Application des principes SOLID détaillée dans `04-technique/TECHNICAL_SPEC.md` § 2.

## Conséquences
- (+) Domaine et composables testables sans navigateur ; fallback sans WebGL = simple implémentation substituable.
- (+) Remplacer Three.js, GSAP ou la source de données n'affecte pas l'UI.
- (−) Plus de fichiers et d'indirection ; limité volontairement aux frontières qui changent réellement (YAGNI).
- Règle de dépendance imposée par ESLint, sinon l'architecture se dégrade.

## Points ouverts
- Nuxt 3 ou Nuxt 4 (Nuxt 4 recommandé, support à vérifier).
- Source de données : statique pour la démo, CMS/`@nuxt/content` plus tard.
