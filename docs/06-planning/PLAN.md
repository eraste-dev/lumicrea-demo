# Plan de travail — Site démo Lumicrea

Objectif : un site démo qui sert de pièce de portfolio pour la sélection. Priorité à l'accueil, à la fluidité et à un moment signature maîtrisé. Code écrit à la main (voir contrainte dans `README.md`).

**Date limite de candidature** : à renseigner.
**Modèle GLB et visuels** : à confirmer (fournis, achetés ou placeholders). Sans modèle, le hero est le risque n°1.

## Priorités
| Niveau | Contenu |
|---|---|
| Indispensable | Accueil : chargement, hero 3D, révélation produit au scroll, finitions interactives, transitions de sections, typographie et espaces soignés |
| Fort apport | Un shader maison (transition ou matériau) ; une transition de page accueil → collection |
| Si le temps le permet | Page collection simple ; configurateur minimal |
| À couper si tendu | Page configurateur, bilingue, effets secondaires |

## Jalons
| # | Jalon | Critère « terminé » |
|---|---|---|
| 1 | Socle | Projet initialisé, lint + règle de dépendance (`domain/` pur), tokens CSS, polices, build OK |
| 2 | Hero statique | Contenu HTML + image de repli rendus immédiatement ; typographie validée visuellement |
| 3 | Scène 3D | Modèle affiché, éclairage, cycle de vie complet (montage/démontage sans fuite), pixel ratio limité |
| 4 | Scroll et mouvement | Révélation produit, transitions de sections ; `prefers-reduced-motion` respecté |
| 5 | Moment signature | Shader ou transition de page abouti, 60 fps sur laptop moyen |
| 6 | Finitions interactives | Changement de finition fluide, IDs stables, données typées |
| 7 | Pages secondaires | Collection (puis configurateur si le temps le permet) |
| 8 | Finition et perf | Checklist démo complète, déploiement, vidéo de démonstration |

Règle : si une date glisse, couper en bas du tableau des priorités, jamais l'accueil.

## Risques
| Risque | Mitigation |
|---|---|
| Poids GLB/HDR/textures trop élevé | Pipeline `gltf-transform`, budget de poids fixé au jalon 3, chargement différé |
| Perf mobile | Pixel ratio plafonné, textures réduites, scène simplifiée, test sur appareil réel |
| Erreurs d'hydratation SSR | Aucun accès `window`/WebGL côté serveur, composants `.client.vue` |
| Fuite mémoire Three.js | Dispose systématique au démontage, test de navigation répétée |
| Shader trop ambitieux | Version simple d'abord, itérer ensuite ; repli sans shader |
| Périmètre qui gonfle | Respecter le tableau des priorités |
