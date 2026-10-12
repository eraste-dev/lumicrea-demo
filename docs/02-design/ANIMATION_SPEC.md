# Animation Spec — Lumicrea

## Objectif
Le mouvement doit rendre la matière et la forme plus compréhensibles. Chaque animation doit avoir une fonction : attirer l'attention, expliquer une caractéristique, révéler une finition ou guider vers l'action suivante.

## Séquence de l'accueil

### A0 — Initialisation
- Afficher immédiatement la structure HTML, la navigation et le contenu principal.
- Montrer un état de chargement non bloquant pour la scène 3D.
- Prévoir une durée maximale raisonnable pour l'état de chargement ; en cas d'échec, basculer vers l'image de repli.
- Ne pas cacher toute la page derrière un écran de chargement obligatoire.

### A1 — Hero
- Opacité et déplacement subtils du titre et des CTA.
- Révélation progressive du modèle 3D.
- Animation initiale courte, puis scène stable.
- Ne pas forcer l'utilisateur à attendre la fin d'une animation pour interagir.

### A2 — Révélation produit au scroll
- La section peut être épinglée sur desktop si le bénéfice est clair.
- Synchroniser la caméra avec une progression de scroll bornée.
- Révéler un détail de forme ou de finition.
- Le texte doit rester lisible pendant tout le mouvement.
- Sur mobile, préférer une séquence raccourcie ou non épinglée.

### A3 — Choix de finition
- Le changement de finition doit être déclenché par un contrôle explicite.
- Transition visuelle courte, sans recharger toute la scène.
- Indiquer clairement la finition active.
- Respecter les couleurs et textures réellement disponibles.

### A4 — Mise en situation
- Transition douce entre rendu studio et visuel architectural.
- Utiliser une image ou une scène séparée si le changement d'environnement en 3D est trop coûteux.
- Éviter les transitions qui masquent le contenu ou provoquent une sensation de désorientation.

### A5 — Collection et configurateur
- Révélation légère des éléments au scroll.
- Les cartes produits ne doivent pas toutes bouger simultanément.
- Les interactions de sélection doivent être immédiates et accessibles.

## Valeurs de référence
| Usage | Durée | Easing |
|---|---|---|
| Micro-interaction (hover, focus, bouton) | 150–250 ms | `ease-out` |
| Révélation de texte | 500–700 ms, décalage 60–80 ms | `power3.out` |
| Changement de finition | 300–450 ms | `power2.inOut` |
| Entrée du modèle 3D | ≤ 1,2 s | `power3.out` |
| Chargement 3D (délai max avant fallback) | 6–8 s | — |
| Pin desktop | ≤ 2 écrans de hauteur | — |
| Transition de page | ≤ 900 ms | `power2.inOut` |

- Translation maximale 24 px ; pas d'effet de zoom plus grand que 1,05 sur les images.
- Hover sans décalage de mise en page (pas de `scale` qui déplace le contenu voisin).
- Lenis ou scroll lissé : à n'ajouter que s'il est justifié, jamais sur mobile par défaut.
- Reduced motion : durées ramenées à 0 pour les translations, fondu ≤ 150 ms conservé.

## Transitions de pages

Objectif : donner une continuité entre l'accueil, la collection et le configurateur, sans masquer le contenu ni bloquer la navigation.

### Principes
- Une seule signature de transition pour tout le site (cohérence), déclinée plutôt que multipliée.
- Durée totale ≤ 900 ms, l'utilisateur n'attend jamais la fin pour lire le contenu entrant.
- Le contenu de la page entrante est rendu (SSR) ; la transition est une couche d'habillage, jamais une condition d'accès au contenu.
- Navigation par URL directe ou rechargement : pas de transition, affichage immédiat.

### Mise en oeuvre
- Utiliser `pageTransition` de Nuxt (`mode: 'out-in'`) et ses hooks JavaScript (`onLeave`, `onEnter`) pour piloter une timeline GSAP nommée.
- Sortie : décalage ou fondu court des éléments clés de la page sortante ; entrée : révélation décalée de la page entrante (titres, image, produit).
- Transition accueil → collection : privilégier la continuité d'un élément partagé (produit ou image) plutôt qu'un simple fondu.
- Nettoyer les timelines et les ScrollTriggers de la page sortante avant d'initialiser ceux de la page entrante ; réinitialiser la position de scroll.
- Gérer le cas d'un changement de route déclenché pendant une transition (annuler ou terminer proprement la timeline en cours).
- La scène 3D n'est pas recréée à chaque navigation si elle peut être réutilisée ; sinon, libérer entièrement ses ressources avant de monter la suivante.

### Mouvement réduit et robustesse
- `prefers-reduced-motion` : remplacer la transition par un fondu ≤ 150 ms ou aucune transition.
- Le focus et l'annonce du changement de page restent gérés pour le clavier et les lecteurs d'écran.
- Repli : si une transition échoue ou dépasse sa durée, afficher la page entrante immédiatement.

## Shaders

Objectif : un ou deux shaders maison, visibles et maîtrisés, qui servent l'identité du produit. Ils ne sont pas un effet gratuit et restent optionnels : l'expérience doit fonctionner sans eux.

### Cas d'usage retenus (à choisir selon le temps)
| Cas | Description | Priorité |
|---|---|---|
| Transition de page ou de section | Masque ou déformation plein cadre piloté par une valeur de progression (`uProgress`), synchronisée à la timeline GSAP | Fort apport |
| Matériau de surface | Variation subtile d'un matériau (brossage, reflet) en complément de `MeshPhysicalMaterial` | Si le temps le permet |
| Révélation du produit | Effet de dissolution ou de balayage lors de l'entrée du modèle | Optionnel |

### Règles
- Écrire les shaders GLSL à la main et pouvoir expliquer chaque ligne (uniformes, varyings, espace de coordonnées).
- Exposer un petit jeu d'uniformes documentés (`uTime`, `uProgress`, `uResolution`), pilotés par l'adapter Three.js ; aucune logique métier dans le shader.
- Isoler les shaders dans `app/adapters/three/shaders/` (fichiers `.vert` / `.frag` ou chaînes typées).
- Commencer par une version simple qui fonctionne, itérer ensuite ; garder un repli sans shader.
- Budget de performance : coût mesuré sur un laptop moyen et sur un mobile réel ; réduire la résolution du rendu (pixel ratio) avant de réduire la qualité de l'effet.
- Éviter les boucles dynamiques coûteuses, les branchements inutiles et les lectures de texture en excès dans le fragment shader.
- Précision explicite (`precision`) et vérification sur mobile ; ne pas se reposer sur une extension non garantie.
- Reduced motion : l'effet est supprimé ou ramené à un fondu, la valeur de progression est appliquée sans animation.

### Validation
- Rendu identique sur au moins deux navigateurs et un appareil mobile réel.
- 60 fps maintenus sur le laptop de référence pendant l'effet.
- Aucun artefact lors d'un redimensionnement ou d'un changement de route pendant l'effet.
- Programmes, géométries et textures libérés au démontage.

## Règles GSAP
- Utiliser des timelines nommées et des fonctions de création/destruction explicites.
- Utiliser `ScrollTrigger` uniquement pour les séquences qui le justifient.
- Nettoyer les timelines et les ScrollTriggers lors de la destruction du composant.
- Éviter les animations CSS et GSAP qui se disputent les mêmes propriétés.
- Préférer les propriétés transform et opacity pour les animations d'interface.
- Ne pas animer de manière continue des propriétés coûteuses si le résultat peut être obtenu autrement.

## Accessibilité
- Détecter `prefers-reduced-motion`.
- En mode mouvement réduit : désactiver le pinning et les mouvements de caméra non essentiels, afficher les sections dans leur état final lisible.
- Tous les contrôles doivent avoir un libellé accessible.
- L'information ne doit jamais dépendre uniquement de l'animation.

## Validation
- Tester le scroll vers le haut et vers le bas.
- Tester un chargement tardif de la scène.
- Tester un changement de route en cours d'animation.
- Tester le redimensionnement de fenêtre et l'orientation mobile.
- Vérifier l'absence de saut de mise en page, de scroll bloqué et de fuite de ressources.
