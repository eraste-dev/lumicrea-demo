# Questions d'entretien probables

Pistes de réponse à reformuler avec vos mots, après les avoir vraiment comprises.

## Three.js / WebGL
- **Comment évitez-vous les fuites mémoire ?** Cycle de vie complet : annuler les animations, retirer les listeners, `dispose()` des géométries, matériaux, textures, render targets et du renderer au démontage.
- **Comment gérez-vous la performance mobile ?** Pixel ratio plafonné, textures réduites, scène simplifiée, boucle de rendu arrêtée hors vue, une seule scène lourde à la fois.
- **Pourquoi Draco et KTX2 ?** Draco réduit la géométrie, KTX2 réduit les textures GPU. À utiliser seulement si le gain de transfert est réel et le transcodeur configuré.
- **Comment rendez-vous un métal brossé crédible ?** Environnement HDR pour les reflets, `MeshPhysicalMaterial`, texture de surface de qualité ; l'anisotropie seulement si la version de Three.js et le chemin de rendu la gèrent.
- **Qu'avez-vous fait dans votre shader et pourquoi ?** Savoir expliquer chaque ligne et la contrainte de perf.

## GSAP / animation
- **ScrollTrigger : comment éviter les conflits avec la 3D ?** Un seul pilote du temps, états partagés via composables, nettoyage des triggers au démontage.
- **Comment gérez-vous `prefers-reduced-motion` ?** Un composable dédié ; mouvement réduit ou supprimé, contenu intact.
- **Comment avez-vous conçu les transitions de pages ?** Hooks Nuxt de transition couplés à des timelines GSAP, avec nettoyage à la fin.

## Vue / Nuxt
- **Comment évitez-vous les erreurs d'hydratation ?** Pas de valeurs aléatoires ni de mesures client pendant le rendu serveur ; WebGL uniquement après montage (`.client.vue`).
- **Pourquoi Nuxt et pas Vue seul ?** Rendu serveur du contenu et des CTA, routage, optimisation d'images, meilleure expérience initiale.

## Architecture
- **Pourquoi cette architecture en couches ?** Voir `adr/0001-architecture-en-couches.md` : isoler les dépendances qui changent (moteur 3D, données, animation), tester sans navigateur.
- **Où est le SOLID concrètement ?** Ports (`SceneRenderer`, `ModelLoader`) implémentés par des adapters, injectés par un conteneur ; fallback = implémentation substituable.
- **N'est-ce pas sur-architecturé pour une démo ?** Ports limités aux frontières qui changent réellement ; l'UI reste du Vue simple.
- **Comment garantissez-vous que la règle de dépendance tient ?** Règle ESLint sur les imports.

## Choix et honnêteté
- **Pourquoi Three.js direct plutôt que TresJS ?** Contrôle du cycle de vie, cohérence avec l'architecture, une scène produit unique.
- **Qu'avez-vous coupé et pourquoi ?** Montrer l'arbitrage de périmètre (voir `PLAN.md`).
- **Qu'est-ce qui a été difficile ?** Préparer un exemple vécu (perf, shader, fuite mémoire).
- **Quelles ressources avez-vous utilisées ?** Être transparent sur les bibliothèques et assets, conformément à la règle du client.
