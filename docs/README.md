# Lumicrea — SDD Demo Pack

Ce dossier constitue le socle de spécification pour une démonstration premium, architecturale et immersive du site Lumicrea.

## Objectif
Créer une démo front-end crédible pour présenter une direction artistique et une expérience produit différenciantes, centrées sur les interrupteurs et prises design de Lumicrea, en particulier la collection Vendôme.

## Pages prévues
1. `/` — Accueil immersive : page principale et démonstration technique.
2. `/collections/vendome` — Présentation de la collection et des produits.
3. `/configurateur` — Démonstrateur simplifié de choix de finition et de composition.

L'accueil concentre la majeure partie de l'effort. Les pages secondaires doivent rester cohérentes et plus simples.

## Stack cible
- Nuxt 3
- Vue 3
- TypeScript
- Three.js
- GSAP + ScrollTrigger
- CSS moderne, responsive
- GLB/GLTF, HDRI, Draco et KTX2 si les ressources et le pipeline le permettent

## Documents
- `01-cadrage/PROJECT_BRIEF.md` : objectifs, contexte, périmètre et hypothèses.
- `01-cadrage/CURRENT_SITE_AUDIT.md` : observations sur le site actuel et points à améliorer.
- `02-design/PAGE_MAP_AND_COPY.md` : pages, sections et propositions de textes.
- `02-design/DESIGN_DIRECTION.md` : direction artistique et règles UI.
- `02-design/ANIMATION_SPEC.md` : scénario de mouvement et interactions.
- `04-technique/TECHNICAL_SPEC.md` : architecture et exigences techniques.
- `adr/` : décisions d'architecture (ADR 0001 architecture, 0002 Three.js direct).
- `06-planning/PLAN.md` : priorités, jalons et risques du site démo.
- `06-planning/CHECKLIST_DEMO.md` : check-list avant envoi.
- `06-planning/QUESTIONS_ENTRETIEN.md` : questions probables et pistes de réponse.
- `04-technique/ACCEPTANCE_CRITERIA.md` : critères de validation.
- `03-references/REFERENCE_SITES.md` : références et ce qu'il faut en tirer.
- `02-design/IMAGE_SPECS.md` : cahier des charges de chaque visuel (formats, poids, cadrage, alt, droits).
- `03-references/INSPIRATION_MINIMALISTE.md` : sites ultra minimalistes et principes à en tirer.
- `05-brief/BRIEF_REALISATION.md` : méthode SDD et règles de réalisation du site (sans consigne de génération de code).

## Décisions ouvertes (bloquantes)
1. Liste exacte des finitions et des produits Vendôme.
2. Modèle GLB et visuels : fournis, achetés ou placeholders ?
3. Langue : français uniquement ou bilingue (le site actuel mélange les deux).
4. Typographies et palette : validation de la marque. Existe-t-il une charte (police du logo, couleurs exactes des finitions) ? Voir `02-design/DESIGN_DIRECTION.md` § 3 et § 4.

## Mode d'emploi SDD recommandé
1. Lire tous les documents avant de modifier le code.
2. Inspecter le dépôt existant et rapporter son état avant toute modification.
3. Identifier les questions bloquantes et les hypothèses.
4. Écrire ou compléter les spécifications détaillées et les critères d'acceptation.
5. Décomposer le travail en tâches courtes et testables.
6. Implémenter par incréments, valider après chaque incrément et documenter les écarts.
7. Ne pas inventer de prix, de disponibilité, de certifications ou de promesses commerciales.
8. Ne pas copier un site de référence : s'en inspirer uniquement pour les principes d'expérience et de composition.
