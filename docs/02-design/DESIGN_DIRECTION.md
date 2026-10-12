# Design Direction — Lumicrea

## 1. Intention
Créer une esthétique de showroom architectural : calme, matérielle, précise et haut de gamme. Le produit doit rester le protagoniste ; l'interface et les animations l'accompagnent sans lui faire concurrence.

## 2. Principes
- Minimalisme chaleureux, pas de minimalisme vide.
- Typographie éditoriale avec hiérarchie claire.
- Espaces généreux et alignements cohérents.
- Contraste maîtrisé, lisibilité prioritaire.
- Photographie d'intérieur et rendu produit cohérents.
- Une seule interaction dominante à la fois.
- Éviter les cartes répétitives, les gradients décoratifs gratuits, les effets glassmorphism génériques et les animations constantes.

## 3. Palette (issue du site actuel du client)
Relevé le 2026-10-12 sur `https://1w51c1-tt.myshopify.com/` (CSS du thème et variables des schémas de couleurs). À valider avec la marque : la boutique est un thème Shopify et ces valeurs ne sont pas une charte officielle.

| Rôle | Valeur | Source |
|---|---|---|
| Graphite (texte, scènes produit) | `#1C1C1C` | `--text-color`, `--background` du schéma sombre |
| Gris clair (fond éditorial) | `#EFEFEF` | `--background` du schéma clair |
| Blanc | `#FFFFFF` | schémas clairs, boutons |
| Bordure | `#CFCFCF` / `#DDDDDD` | `--border-color` |
| Bordure sombre | `#3E3E3E` | `--border-color` du schéma sombre |
| Or (accent) | `#9B7A1F` | fonds d'accent du site |
| Or doux (accent secondaire) | `#8F7B50` | texte d'accent du site |

Le site actuel est neutre (noir, gris, blanc) avec un accent or discret ; la démo prolonge cette identité. Utiliser le gris clair pour les sections éditoriales et le graphite pour les scènes produit. L'accent or reste rare.

À ne pas reprendre : les couleurs de réseaux sociaux (`--branding-*`), d'erreur et de succès du thème, qui n'appartiennent pas à l'identité de marque.

### Observations sur le rendu réel du site (captures de la page Vendôme et de l'accueil)
- **Noir profond** : le hero de la page Vendôme est en noir quasi pur, plus sombre que le graphite `#1C1C1C` des bandes sombres de l'accueil. Les zones produit utilisent le gris clair `#EFEFEF`.
- **Les finitions portent l'identité colorée** : acier bleu-gris, anthracite, champagne/or, cuivre/bronze brossés. L'or du CSS (`#9B7A1F`) est plus terne que le champagne des photos : les couleurs des finitions se prennent sur les photos produit ou le modèle 3D, pas sur le CSS.
- **Photographie d'intérieur chaude** (jaune, orange, bois) en contraste avec les fonds froids.

### Deux familles de couleurs
| Famille | Rôle | Valeurs |
|---|---|---|
| Neutres | Fonds, texte, filets | Noir scène `#0A0A0A` (proposition), graphite `#1C1C1C`, gris clair `#EFEFEF`, blanc `#FFFFFF`, bordures ci-dessus |
| Finitions | Pastilles de choix, accents liés au produit | Acier, anthracite, champagne, cuivre/bronze : **valeurs à échantillonner** sur les photos ou le modèle 3D validés (`app/data/finishes.ts`), pas inventées ici |

- Le noir scène `#0A0A0A` est une proposition : légèrement relevé par rapport au `#000` du site pour que les reflets du métal brossé restent lisibles. À valider visuellement avec le modèle.
- L'accent de l'interface reste l'or discret ; les couleurs de finitions n'apparaissent que sur le produit et ses sélecteurs, pour ne pas concurrencer le visuel.
- Contrastes à mesurer pour tout texte gris sur noir : les petits libellés gris du site actuel semblent peu lisibles.

### Contraste (calculé selon WCAG)
| Texte / fond | Ratio | Verdict |
|---|---|---|
| Graphite `#1C1C1C` sur gris clair `#EFEFEF` | 14,8:1 | Corps et titres |
| Graphite sur blanc | 17,0:1 | Corps et titres |
| Gris `#5E5E5E` sur gris clair | 5,6:1 | OK pour texte secondaire |
| Or `#9B7A1F` sur graphite | 4,2:1 | Texte ≥ 24 px (ou 19 px gras) uniquement |
| Or sur blanc | 4,0:1 | Idem : grands textes et éléments graphiques |
| Or sur gris clair | 3,5:1 | **Insuffisant pour du texte** : filets et décoration |
| Or doux `#8F7B50` sur graphite | 4,2:1 | Idem or |
| Bordure `#CFCFCF` sur gris clair | 1,4:1 | Décoration uniquement, pas d'information portée seule |

Aucun texte courant en or. Pour un lien ou un libellé en accent sur fond clair, utiliser le graphite avec un soulignement or. Si un accent doit porter du texte courant, éclaircir l'or sur fond sombre (valeur à définir et à mesurer ≥ 4,5:1 avec la marque).

### Tokens de design
- Espacement : échelle de 4 px (4, 8, 16, 24, 40, 64, 104, 168).
- Rayons : 0 ou 2 px (angles nets, cohérents avec l'appareillage).
- Filets : 1 px, graphite à 15 % (cohérent avec `--border-color` du site actuel).
- Échelle typographique : 14 / 16 / 20 / 32 / 56–96 px (titre fluide via `clamp()`).
- Interligne : 1,6 corps, 1,05–1,15 titres. Largeur de lecture 60–70 caractères.
- Container : max-width unique (1280 px), marges 24 px mobile, 64 px desktop.
- Z-index : 10 contenu, 20 header, 30 menu mobile, 50 modale.
- Cibles tactiles ≥ 44×44 px, focus visible (outline 2 px or sur graphite, graphite sur gris clair).

Voir `02-design/IMAGE_SPECS.md` pour les visuels et `03-references/INSPIRATION_MINIMALISTE.md` pour les références.

## 4. Typographie
- Police actuelle du site : **Urbanist** (titres et corps), sans-serif géométrique, fournie par Shopify. À confirmer avec la marque.
- Proposition : conserver Urbanist pour garder la continuité d'identité, en jouant sur le contraste d'échelle et de graisse (grands titres légers, micro-libellés en capitales espacées) pour obtenir le caractère éditorial.
- Le logo et les grands titres du site (« La Collection **Vendôme** ») utilisent une police d'affichage fine, large et très aérée, distincte d'Urbanist, avec un détail tricolore minuscule sous le V. Police du logo : **inconnue**, à demander au client (charte). Ne pas imiter le logo avec une police approchante sans accord.
- Option à valider : une serif ou display fine pour les très grands titres uniquement, dans l'esprit de ces titres. Ne pas l'introduire sans accord.
- Micro-libellés en capitales espacées (comme la navigation du site actuel), taille ≥ 12 px et contraste mesuré.
- Charger la police en auto-hébergement via `@nuxt/fonts` ; vérifier la licence (Urbanist est sous SIL Open Font License sur Google Fonts) avant de la servir.
- Utiliser une échelle typographique limitée et deux graisses principales.
- Les grands titres peuvent être expressifs, mais ne doivent pas casser les lignes de lecture sur mobile.
- Éviter les textes entièrement en capitales sauf pour les micro-libellés.

## 5. Composition
- Largeur de lecture contrôlée.
- Grille cohérente, marges généreuses.
- Hero : produit dominant, texte court, CTA lisible.
- Éviter de superposer trop d'éléments sur la scène 3D.
- Les détails techniques sont secondaires et doivent apparaître au moment pertinent.

## 6. Direction de la scène 3D
- Présenter un produit réellement pertinent pour Lumicrea.
- Éclairage studio avec grande source lumineuse et remplissage doux.
- Reflets crédibles et contrôlés ; éviter l'aspect plastique ou chrome irréaliste.
- Utiliser un environnement HDR cohérent avec la direction artistique.
- Fond de scène noir profond (`#0A0A0A`) comme sur le hero Vendôme du site actuel, avec un éclairage rasant qui fait ressortir le brossé du métal.
- Le métal brossé doit avoir une réponse de matière subtile, pas un bruit excessif.
- Prévoir un cadrage qui conserve l'objet sur desktop et mobile.
- Ne pas utiliser un modèle générique présenté comme un produit exact de Lumicrea.

## 7. Mouvement
- Entrée initiale courte et intentionnelle.
- Mouvement de caméra fluide et limité.
- Scroll storytelling avec des pauses clairement composées.
- Micro-interactions rapides et sobres.
- Pas d'animation qui retarde artificiellement l'accès au contenu.
- Respecter `prefers-reduced-motion`.

## 8. Responsive
- Desktop : composition ample et scène 3D détaillée.
- Tablette : réduire les distances de caméra, les éléments superposés et la densité des animations.
- Mobile : raccourcir les séquences épinglées, réduire la résolution du renderer et privilégier une interaction simple.
- En cas de performance insuffisante ou de WebGL indisponible, utiliser une image de haute qualité avec une transition propre.

## 9. À éviter
- Une page noire générique avec un objet flottant sans rapport avec l'activité.
- Un curseur custom qui gêne l'accessibilité.
- Des animations qui bloquent le scroll.
- Du texte marketing non vérifié.
- Des visuels sans droits.
- Des sections trop denses ou des CTA concurrents.
