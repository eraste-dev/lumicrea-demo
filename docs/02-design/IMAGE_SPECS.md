# Image Specs — Lumicrea

Cahier des charges de **chaque visuel** nécessaire à la démo. Aucune image n'est encore présente dans le dépôt : ce document sert de commande aux photographes, rendeurs 3D ou à la recherche de visuels autorisés.

Les `ID` sont stables et réutilisables dans le code (`public/images/<id>.*`) et dans les tickets.

## 1. Règles communes

### Direction artistique
- Showroom architectural : lumière douce et directionnelle (grande source latérale, jamais de flash frontal), ombres longues et nuancées, aucun reflet brûlé.
- Palette dominante : graphite `#1C1C1C`, gris clair `#EFEFEF`, blanc `#FFFFFF`. Le bronze n'apparaît que par la finition du produit.
- Produit net, fond sobre, **un seul point focal par image**. Pas de personnes visibles, pas de texte incrusté, pas de logo tiers.
- Étalonnage homogène sur tout le set : température ~4500–5200 K, contraste modéré, noirs relevés (pas de noir écrasé), grain nul ou très léger.
- Les finitions doivent être **colorimétriquement fidèles** (référence : échantillon physique ou photo validée par la marque). Sinon, marquer l'image `DEMO` (voir § 6).

### Format et poids
| Règle | Valeur |
|---|---|
| Formats servis | AVIF (principal), WebP (repli), JPEG (repli final) |
| Profil couleur | sRGB, métadonnées EXIF retirées |
| Variantes responsive | 480 / 768 / 1280 / 1920 px de large (`srcset` + `sizes`) |
| Densité | Source 2× de la plus grande taille affichée |
| Chargement | `loading="lazy"` sauf image LCP (`fetchpriority="high"`, sans lazy) |
| Anti-saut de mise en page | `width`/`height` ou `aspect-ratio` toujours définis |
| Placeholder | Couleur dominante en CSS ou LQIP flou ≤ 1 Ko |
| Nommage | `kebab-case`, `<id>-<sujet>-<largeur>.avif` |

### Alt text
- Décrire ce qui compte pour l'utilisateur : produit, finition, contexte. Pas de « image de… ».
- Images purement décoratives : `alt=""`.
- Texte en français, noms de finitions exacts issus de `data/finishes.ts`.

### Droits
Chaque image doit avoir : auteur, licence ou cession, date, usage autorisé. Tenir un tableau `docs/IMAGE_CREDITS.md` (à créer). Aucune image sans droits confirmés.

---

## 2. Hero et fallback 3D

### HERO-01 — Poster de repli du hero
| Champ | Spécification |
|---|---|
| Usage | Visuel LCP de l'accueil ; fallback si WebGL, modèle ou réseau échoue ; image avant chargement 3D |
| Ratios | Desktop 16:9 (2560×1440) ; mobile 4:5 (1440×1800) — deux recadrages distincts, pas un crop automatique |
| Poids cible | ≤ 120 Ko (AVIF 1280 px), ≤ 60 Ko mobile |
| Contenu | Interrupteur Vendôme (ou placeholder identifié) en 3/4 légèrement plongeant, mur architectural texturé (enduit/béton ciré) |
| Composition | Produit centré-droit sur desktop, tiers inférieur libre pour le texte ; sur mobile produit en haut, 40 % bas dégagé |
| Zone de sécurité | 12 % de marge sur chaque bord ; aucune information clé dans la zone du titre |
| Lumière | Source douce haut-gauche, ombre portée courte et nette sur le mur |
| Cohérence 3D | Même cadrage, même lumière et même HDRI que la scène Three.js, pour une transition sans saut |
| Alt | « Interrupteur de la collection Vendôme en finition [nom exact] sur un mur texturé » |

### HERO-02 — Séquence de révélation (optionnelle)
Deux à trois stills du produit sous angles différents (face, 3/4, rasant) pour la section A2 en repli sans WebGL. Même ratio 4:5, ≤ 80 Ko chacun.

---

## 3. Révélation produit

### DETAIL-01 à DETAIL-03 — Macros de matière
| ID | Sujet | Ratio | Notes |
|---|---|---|---|
| DETAIL-01 | Arête et chanfrein du cadre | 3:2 | Lumière rasante qui révèle le profil |
| DETAIL-02 | Grain de la finition brossée (gros plan) | 1:1 | Direction du brossage lisible, pas de bruit excessif |
| DETAIL-03 | Touche de l'interrupteur / jeu entre pièces | 3:2 | Montre la précision d'ajustement |

Taille source 2400 px, poids ≤ 90 Ko servi. Alt : décrit la matière et le détail visible.

---

## 4. Finitions (un jeu complet par finition)

Finitions à confirmer par la marque : Bronze, Canon, Acier, Blanc Mat, Laiton Brossé, Noir Brossé. Un jeu = 3 visuels ; ne produire que les finitions validées.

| ID | Usage | Ratio | Taille source | Poids servi |
|---|---|---|---|---|
| `FIN-<slug>-swatch` | Pastille du sélecteur | 1:1 | 256×256 | ≤ 4 Ko (ou SVG/CSS si l'aplat suffit) |
| `FIN-<slug>-product` | Aperçu produit si WebGL indisponible | 4:5 | 1600×2000 | ≤ 70 Ko |
| `FIN-<slug>-macro` | Texture/matière en gros plan | 1:1 | 1600×1600 | ≤ 60 Ko |

Règles :
- Même angle, même lumière, même fond pour les six finitions : seule la matière change.
- Pastille : cercle sur fond neutre, zone de focus visible ≥ 44×44 px à l'affichage.
- Ne jamais exprimer la finition par la couleur seule : toujours le nom en texte à côté.
- Alt : « Finition [nom exact] — [description matière] ».

### Textures PBR (assets 3D, non affichés tels quels)
| Carte | Format | Taille | Notes |
|---|---|---|---|
| Base color | KTX2 (repli JPEG) | 1024² desktop, 512² mobile | sRGB |
| Normal | KTX2 | 1024² | Brossage fin, intensité faible |
| Roughness / Metalness | KTX2 | 1024² | Canaux packés (ORM) |
| Tuilage | — | — | Sans raccord visible |

---

## 5. Mise en situation

### SCENE-01 à SCENE-03 — Intérieurs architecturaux
| Champ | Spécification |
|---|---|
| Usage | Section « Dessiné pour s'intégrer » ; fallback sans 3D |
| Ratios | 16:9 (2560×1440) desktop ; 4:5 (1440×1800) mobile — recadrages dédiés |
| Poids cible | ≤ 140 Ko desktop, ≤ 70 Ko mobile |
| Variantes | SCENE-01 salon sobre (enduit clair), SCENE-02 couloir ou entrée (lumière rasante), SCENE-03 cuisine/pièce d'eau (matière dense) |
| Cadrage | Le produit lisible à 100 % mais jamais centré-dominant : il vit dans l'espace. Lignes verticales parfaitement droites |
| Lumière | Naturelle, fenêtre latérale ; pas de spots chauds saturés |
| Hauteur de pose | Interrupteur à ~105 cm, prise à ~30 cm, conforme à une pose réaliste |
| Mobile | Recadrage serré sur le produit et son mur, pas une réduction de la vue large |
| Alt | « [Pièce] avec un interrupteur Vendôme en finition [nom] posé sur [mur] » |

Si ces rendus sont de l'imagerie de synthèse, l'indiquer dans les crédits.

---

## 6. Collection

### COLL-<produit> — Packshots produit
| Champ | Spécification |
|---|---|
| Usage | Cartes de `/collections/vendome` |
| Ratio | 4:5, fond gris clair `#EFEFEF` uni |
| Taille | 1200×1500 source ; servi 480–768 px |
| Poids | ≤ 45 Ko |
| Cadrage | Produit centré, 70 % de la hauteur, ombre douce au sol |
| Variantes | Une image par produit **et** par finition validée (pas de recoloration automatique) |
| Alt | « [Nom exact du produit], finition [nom] » |

### COLL-HERO — Bandeau de la page collection
Ratio 21:9 desktop / 4:5 mobile, ≤ 110 Ko. Composition proche de HERO-01, plus sobre.

### Mention `DEMO`
Toute image non issue d'un shooting ou d'un modèle validé (rendu approximatif, placeholder) reçoit, dans le code, un badge discret « Visuel de démonstration » et une entrée dans `IMAGE_CREDITS.md`. Ne jamais présenter un modèle générique comme le produit exact.

---

## 7. Configurateur

### CFG-<plaque> — Aperçus de plaque
| Champ | Spécification |
|---|---|
| Usage | Aperçu si la 3D est indisponible ; vignettes de choix de plaque |
| Ratio | 1:1, fond gris clair |
| Taille | 1200×1200 source ; vignettes 160×160 |
| Poids | ≤ 40 Ko (aperçu), ≤ 6 Ko (vignette) |
| Contenu | Plaque 1 à 3 postes, avec ou sans mécanismes dans les seules configurations modélisées |
| Nombre | Nombre de combinaisons plaque × finition réellement supportées ; sinon aperçu unique + mention |
| Mention | « Démonstrateur visuel — configuration à confirmer avant commande. » |

---

## 8. Réalisations

### REAL-01 à REAL-06 — Projets
| Champ | Spécification |
|---|---|
| Usage | Section « Le design prend place » |
| Ratio | Mélange assumé : 3:2 horizontal, 4:5 vertical (maximum 2 formats) |
| Taille | 2000 px côté long, poids servi ≤ 110 Ko |
| Crédits | Photographe, architecte, projet, accord écrit — obligatoires |
| Alt | Pièce + produit + finition quand identifiables |
| Tri | Ne conserver que les images où le produit est lisible ; supprimer les doublons déjà présents sur le site actuel |

---

## 9. Marque et partage

| ID | Usage | Format | Spécification |
|---|---|---|---|
| `LOGO` | En-tête, pied de page | SVG | Version graphite et gris clair ; zone de protection = hauteur de la lettre « L » ; hauteur affichée 20–28 px |
| `OG-DEFAULT` | Partage social | JPEG 1200×630 | Produit + nom, texte ≤ 6 mots, zone de sécurité 80 px, ≤ 150 Ko |
| `OG-VENDOME` | Partage page collection | JPEG 1200×630 | Idem, titre « Vendôme » |
| `OG-CONFIG` | Partage configurateur | JPEG 1200×630 | Idem |
| `FAVICON` | Onglet | SVG + PNG 32/180/512 | Monogramme lisible à 16 px |

---

## 10. Assets 3D associés (pour mémoire)

| Asset | Spécification |
|---|---|
| Modèle GLB | ≤ 2 Mo après Draco, ≤ 50 k triangles, origine centrée, échelle en mètres, nœuds nommés (`frame`, `rocker`, `plate`) |
| HDRI | 1k–2k, studio doux, ≤ 800 Ko (`.hdr`/`.exr`/KTX2) |
| Source | Modèle fourni/validé par la marque ; sinon placeholder explicitement identifié |

---

## 11. Inventaire récapitulatif

| Famille | Nombre minimal | Priorité |
|---|---|---|
| HERO-01 (×2 recadrages) | 2 | P0 |
| SCENE-01 | 1 (×2 recadrages) | P0 |
| FIN swatch + product | 2 × nb de finitions | P0 |
| FIN macro | nb de finitions | P1 |
| DETAIL-01..03 | 3 | P1 |
| COLL packshots | nb produits (×finitions) | P0 |
| CFG | selon combinaisons | P1 |
| REAL | 3 à 6 | P1 |
| SCENE-02, 03 | 2 | P2 |
| OG, favicon, logo | 5 | P0 |

**Budget total d'images chargées sur l'accueil (hors 3D) : ≤ 600 Ko** en parcours initial, le reste en lazy-loading.

## 12. Checklist de validation d'une image
- [ ] Droits et crédit enregistrés
- [ ] Ratios desktop et mobile fournis, avec recadrage dédié
- [ ] AVIF + WebP + JPEG, poids sous le budget
- [ ] `width`/`height` ou `aspect-ratio` définis
- [ ] Alt rédigé (ou `alt=""` justifié)
- [ ] Finition fidèle et nommée exactement
- [ ] Mention `DEMO` si non validée
- [ ] Cohérence colorimétrique avec le reste du set
