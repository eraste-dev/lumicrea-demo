# Check-list avant envoi de la démo

## Expérience
- [ ] Contenu principal et CTA visibles immédiatement, avant le chargement de la 3D
- [ ] Premier mouvement marquant dans les premières secondes
- [ ] Un seul moment signature, cohérent avec la direction artistique
- [ ] Pas d'animation gratuite ; chaque mouvement a une fonction

## Performance
- [ ] Poids des assets documenté (modèle, textures, HDR) avec budget respecté
- [ ] Image LCP jamais en lazy-loading
- [ ] Three.js et ScrollTrigger chargés en import dynamique
- [ ] Fluidité mesurée (DevTools Performance) sur laptop moyen
- [ ] Lighthouse exécuté ; scores réels notés, aucune promesse avant mesure
- [ ] Une seule scène lourde chargée à la fois

## Robustesse
- [ ] Repli image + contenu fonctionnel sans WebGL
- [ ] État d'erreur de chargement géré
- [ ] `prefers-reduced-motion` respecté
- [ ] Aucune fuite mémoire après navigations répétées (geometries/textures/renderer libérés)
- [ ] Console navigateur propre
- [ ] 3 routes testées en accès direct et en navigation interne

## Compatibilité et accessibilité
- [ ] Viewport desktop et mobile testés (appareil réel pour le mobile)
- [ ] Navigation clavier, états actifs, focus visibles
- [ ] Textes alternatifs des images
- [ ] Contraste suffisant

## Livrable
- [ ] URL déployée, accessible sans friction
- [ ] Dépôt lisible : architecture, README, ADR
- [ ] Vidéo ou GIF de démonstration jointe (preuve de fluidité)
- [ ] Aucun prix, stock ou certification inventé
- [ ] Licences des assets vérifiées et créditées
- [ ] Je sais expliquer chaque choix technique (voir `QUESTIONS_ENTRETIEN.md`)
