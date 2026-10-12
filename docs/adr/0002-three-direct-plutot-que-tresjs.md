# ADR 0002 — Three.js direct plutôt que TresJS

- **Statut** : accepté
- **Date** : 2026-10-12

## Contexte
La scène 3D est une pièce maîtresse du site (un produit, un cycle de vie à contrôler, des shaders maison). L'annonce du client demande une maîtrise réelle du code et exclut le simple assemblage de composants. TresJS (`@tresjs/core`, `@tresjs/nuxt`, `@tresjs/cientos`) permet de décrire une scène Three.js en composants Vue.

## Décision
Utiliser **Three.js directement**, encapsulé dans un adapter `ThreeSceneRenderer` qui implémente le port `SceneRenderer` du domaine (voir ADR 0001). Les loaders (`GLTFLoader`, `DRACOLoader`, `KTX2Loader`, `RGBELoader`) et `OrbitControls` viennent de Three.js. Les composants Vue de la scène restent de fines façades.

## Alternatives écartées
- **TresJS** : développement plus rapide au départ, mais la scène devient un arbre de composants de la couche Présentation, ce qui contredit le port `SceneRenderer`. Le cycle de vie fin (dispose, pause hors vue, repli) et les shaders maison y sont moins directs. Il masque aussi une partie du savoir-faire que le client veut évaluer.
- **Autres surcouches (ex. wrappers déclaratifs)** : même objection.

## Conséquences
- (+) Contrôle complet du cycle de vie, des shaders et des performances ; scène testable derrière une interface ; démonstration claire de la maîtrise de Three.js.
- (+) Moins de dépendances, moins de couplage à une surcouche dont les versions évoluent.
- (−) Plus de code d'infrastructure à écrire (rendu, redimensionnement, libération des ressources).
- Réévaluer si le configurateur devient très complexe (nombreux objets interactifs) : TresJS pourrait alors être envisagé pour cette partie seulement, derrière le même port.
