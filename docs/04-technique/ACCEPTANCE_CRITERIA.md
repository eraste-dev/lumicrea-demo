# Acceptance Criteria — Lumicrea

## A. Expérience et contenu
- [ ] Le visiteur comprend en quelques secondes que Lumicrea propose des interrupteurs et prises design.
- [ ] Le hero présente une promesse courte, un sous-titre explicite et un CTA principal.
- [ ] La collection Vendôme est clairement identifiable.
- [ ] Les noms des finitions sont cohérents entre toutes les pages.
- [ ] Aucun prix, stock, délai, certification ou avantage commercial non vérifié n'est inventé.
- [ ] Le configurateur est clairement présenté comme une démo si ses résultats ne sont pas reliés au système réel.

## B. Direction artistique
- [ ] La page a une hiérarchie typographique nette.
- [ ] Les espaces et alignements sont cohérents.
- [ ] Le produit reste le point focal.
- [ ] Les sections ne sont ni surchargées ni répétitives.
- [ ] Les transitions soutiennent le contenu plutôt que de détourner l'attention.
- [ ] Les images et modèles sont autorisés et adaptés à la marque.

## C. 3D
- [ ] La scène est initialisée uniquement côté client.
- [ ] Le modèle est pertinent pour la gamme présentée ou clairement identifié comme modèle de démonstration.
- [ ] L'éclairage et les reflets rendent la matière lisible.
- [ ] Le changement de finition fonctionne ou est explicitement présenté comme indisponible.
- [ ] Un fallback visuel existe si WebGL ou le modèle échoue.
- [ ] Le redimensionnement ne déforme pas la scène.
- [ ] Les ressources sont nettoyées à la destruction du composant.

## D. Animations
- [ ] L'animation d'entrée est courte et non bloquante.
- [ ] Les séquences ScrollTrigger fonctionnent dans les deux sens.
- [ ] Aucun contenu essentiel n'est inaccessible sans animation.
- [ ] Le mode mouvement réduit désactive les mouvements non essentiels.
- [ ] Les transitions de route ne laissent pas de triggers ou d'animations actifs.
- [ ] Le scroll mobile reste naturel.

## E. Responsive et accessibilité
- [ ] Les trois routes sont utilisables sur desktop et mobile.
- [ ] Les CTA et contrôles sont accessibles au clavier.
- [ ] Le focus clavier est visible.
- [ ] Les contrôles ont des libellés accessibles.
- [ ] Le contraste des textes est suffisant.
- [ ] La scène ne masque pas les informations essentielles sur mobile.
- [ ] Une solution de repli existe si WebGL est indisponible.

## F. Performance et stabilité
- [ ] Le contenu HTML utile s'affiche avant la fin du chargement 3D.
- [ ] Les ressources 3D ne sont pas téléchargées inutilement sur les routes qui n'en ont pas besoin.
- [ ] La résolution du renderer est limitée sur mobile.
- [ ] Les erreurs de chargement sont gérées.
- [ ] Le build de production réussit.
- [ ] Aucune erreur bloquante n'apparaît dans la console pendant le parcours nominal.
- [ ] La taille des principaux assets est documentée.

## F-bis. Seuils mesurables (Lighthouse mobile, réseau simulé 4G, à ajuster après mesure)
- [ ] LCP ≤ 2,5 s (image HERO-01 servie en AVIF avec `fetchpriority="high"`)
- [ ] CLS ≤ 0,1
- [ ] INP ≤ 200 ms
- [ ] JavaScript initial ≤ 200 Ko gzip hors Three.js (chargé en différé)
- [ ] Images de l'accueil ≤ 600 Ko au chargement initial
- [ ] Modèle GLB ≤ 2 Mo
- [ ] Accessibilité Lighthouse ≥ 95, sans erreur axe critique
- [ ] Chaque image conforme à la checklist de `02-design/IMAGE_SPECS.md` § 12

## G. Navigation
- [ ] `/`, `/collections/vendome` et `/configurateur` s'ouvrent directement.
- [ ] Les liens de navigation fonctionnent.
- [ ] Le menu mobile s'ouvre, se ferme et conserve un état accessible.
- [ ] Les états actifs du configurateur sont visibles.
