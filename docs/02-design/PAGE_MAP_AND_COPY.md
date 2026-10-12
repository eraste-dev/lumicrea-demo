# Page Map & Copy — Lumicrea

## Principe de périmètre
Trois routes. L'accueil est la page phare ; la collection et le configurateur sont des pages secondaires cohérentes, sans dupliquer l'effort WebGL.

---

## Route 1 — `/` : Accueil immersive

### Section 1 — Hero
**Titre :** Le détail qui transforme un intérieur.

**Sous-titre :** Interrupteurs et prises design, pensés pour dialoguer avec l'architecture de chaque espace.

**CTA primaire :** Explorer la collection Vendôme  
**CTA secondaire :** Découvrir les finitions

Visuel : modèle 3D d'un produit représentatif, lumière douce, environnement sobre et texture de mur architecturale.

### Section 2 — Révélation produit
**Titre :** La matière au premier regard.

**Texte :** Des lignes précises, des surfaces travaillées et des finitions qui donnent au détail toute sa place.

Animation : déplacement de caméra ou révélation de détails synchronisés au scroll.

### Section 3 — Finitions
**Titre :** Une finition, une signature.

Présenter les finitions validées, par exemple : Bronze, Canon, Acier, Blanc Mat, Laiton Brossé et Noir Brossé. La liste exacte doit être vérifiée dans le catalogue à jour.

Interaction : sélectionner une finition actualise l'aperçu du produit. Si des textures ou modèles spécifiques ne sont pas disponibles, ne pas simuler une fidélité photoréaliste non vérifiée ; utiliser un aperçu clairement présenté comme démonstratif.

### Section 4 — Mise en situation
**Titre :** Dessiné pour s'intégrer. Pensé pour se distinguer.

**Texte :** Dans un intérieur, chaque détail contribue à l'équilibre de l'ensemble.

Visuel : produit intégré dans un environnement architectural. Prévoir une image de remplacement pour les appareils qui ne supportent pas la 3D.

### Section 5 — Collection Vendôme
**Titre :** La collection Vendôme.

**Texte :** Découvrez les interrupteurs et prises de la collection, puis explorez les finitions et configurations disponibles.

CTA : Découvrir la collection

Ne pas afficher de prix ou de statut de stock dans cette section tant que les données n'ont pas été vérifiées.

### Section 6 — Configuration
**Titre :** Composez votre plaque.

**Texte :** Choisissez une plaque et explorez les possibilités de composition selon vos besoins.

CTA : Essayer le configurateur

Note : le configurateur de démonstration n'est pas un calculateur électrique ni un outil de commande.

### Section 7 — Réalisations
**Titre :** Le design prend place.

**Texte :** Découvrez comment les produits s'intègrent à des projets d'architecture intérieure.

CTA : Voir les réalisations

Réutiliser uniquement des visuels et crédits autorisés.

### Section 8 — Conclusion
**Titre :** Tout commence par un détail.

CTA : Explorer la collection Vendôme  
CTA secondaire : Nous contacter

---

## Route 2 — `/collections/vendome` : Collection

### Hero
**Titre :** Vendôme — le sens du détail.

**Sous-titre :** Une collection d'interrupteurs et de prises design à découvrir selon les formes, les usages et les finitions.

### Contrôles
- Filtre par type : interrupteur, prise, autres catégories confirmées.
- Filtre par finition.
- Tri uniquement si les données de tri sont disponibles.
- État vide clair lorsqu'aucun résultat ne correspond.

### Cartes produit
Chaque carte comprend :
- visuel ;
- nom exact du produit ;
- type ;
- finitions disponibles et vérifiées ;
- CTA « Découvrir le produit ».

Ne pas inventer de prix, de disponibilité ou de caractéristiques. Si les données viennent de Shopify, conserver une source de vérité unique.

### Fin de page
CTA vers le configurateur et retour vers l'accueil.

---

## Route 3 — `/configurateur` : Démonstrateur de configuration

### Hero
**Titre :** Composez votre plaque.

**Sous-titre :** Explorez une configuration et visualisez les finitions avant de poursuivre votre découverte.

### Étapes UX
1. Choisir une base ou une plaque parmi les options disponibles dans les ressources de démonstration.
2. Choisir une finition.
3. Ajouter ou retirer des mécanismes dans les limites des options réellement modélisées.
4. Visualiser l'aperçu.
5. Réinitialiser ou revenir à la collection.

### Règles
- Le résumé de sélection doit être toujours visible sur desktop et accessible sur mobile.
- Les contrôles doivent être utilisables au clavier.
- Afficher un état vide ou une sélection initiale claire.
- Les changements de finition doivent avoir un retour visuel immédiat.
- Ne pas prétendre enregistrer, commander ou vérifier la compatibilité électrique.
- Ajouter une mention discrète : « Démonstrateur visuel — configuration à confirmer avant commande. »

---

## Navigation globale
- Logo Lumicrea.
- Collection.
- Configurateur.
- Réalisations (ancre de la page d'accueil si aucune route dédiée n'est prévue).
- CTA « Explorer la collection ».
- Menu mobile accessible.
- Transitions de navigation discrètes, désactivables si elles nuisent à l'accessibilité ou aux performances.
