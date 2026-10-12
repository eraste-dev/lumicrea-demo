# Brief de réalisation — Site démo Lumicrea

Document de travail pour le développeur. Il décrit la méthode et les règles ; il ne contient aucune consigne de génération de code. Le code du site est écrit à la main, conformément à l'annonce du client (voir `README.md`, section « Contrainte importante »).

## Contexte
Démonstration premium et immersive pour Lumicrea, marque d'appareillage électrique design. Stack : Nuxt, Vue 3, TypeScript, Three.js, GSAP/ScrollTrigger. Architecture : voir `04-technique/TECHNICAL_SPEC.md` § 2 et `adr/0001-architecture-en-couches.md`. Priorités et jalons : `06-planning/PLAN.md`.

## Méthode : Spec-Driven Development
Ne pas commencer par construire toute l'application. Avancer par incréments, chacun relié à un critère d'acceptation.

### Phase 0 — Inspection
1. Inspecter le dépôt : framework, scripts, dépendances, structure, conventions, état Git.
2. Ne pas remplacer de fichiers existants sans comprendre leur rôle.
3. Noter contraintes, risques et inconnues.
4. Ne rien déclarer testé sans l'avoir exécuté.

### Phase 1 — Spécification
Lire, dans cet ordre :
1. `01-cadrage/PROJECT_BRIEF.md`, `01-cadrage/CURRENT_SITE_AUDIT.md`
2. `02-design/PAGE_MAP_AND_COPY.md`, `02-design/DESIGN_DIRECTION.md`, `02-design/ANIMATION_SPEC.md`, `02-design/IMAGE_SPECS.md`
3. `03-references/REFERENCE_SITES.md`, `03-references/INSPIRATION_MINIMALISTE.md`
4. `04-technique/TECHNICAL_SPEC.md`, `04-technique/ACCEPTANCE_CRITERIA.md`

Puis : découper en petites specs fonctionnelles, définir composants, états, événements, données et critères d'acceptation, identifier les assets manquants (GLB, textures, HDR, images) et signaler les décisions bloquantes avant de les trancher.

### Phase 2 — Ordre des tâches
1. Socle Nuxt, navigation, tokens de design
2. Structure responsive et contenu HTML de l'accueil
3. Chargement 3D isolé et repli
4. Animations du hero
5. Narration au scroll
6. Interactions de finitions
7. Page collection
8. Configurateur de démonstration
9. Accessibilité, responsive, optimisation
10. Tests et documentation

### Phase 3 — Réalisation incrémentale
Pour chaque tâche :
- relier le travail à un critère d'acceptation ;
- modifier le moins de fichiers possible ;
- garder le contenu essentiel disponible sans WebGL ;
- ne pas ajouter de dépendance sans justification ;
- ne pas inventer de faits commerciaux ni copier les références ;
- libérer les ressources Three.js, listeners et animations ;
- vérifier build et comportements avant de la déclarer terminée.

### Phase 4 — Vérification
Appliquer `06-planning/CHECKLIST_DEMO.md` : build de production, trois routes en accès direct et en navigation, console, desktop et mobile, `prefers-reduced-motion`, repli WebGL/modèle, ScrollTrigger dans les deux sens, nettoyage au changement de route, poids des assets.

## Règles de conception
- L'accueil est la pièce maîtresse.
- Produit : un interrupteur ou une prise pertinent pour Lumicrea, idéalement de la collection Vendôme.
- Direction artistique : showroom architectural, luxe discret, matériaux crédibles, typographie éditoriale, espaces généreux.
- Les animations révèlent le produit et guident le parcours ; elles ne ralentissent pas l'utilisateur.
- Les finitions viennent de données centralisées.
- Sans modèle 3D exact : placeholder clairement identifié, jamais présenté comme reproduction fidèle ; interface prête à recevoir l'asset.
- Aucun prix, stock ou promesse non vérifiés.
- Accessibilité et responsive obligatoires.
