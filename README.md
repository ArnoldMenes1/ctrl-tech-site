# CTRL-TECH — Precision Technology Retail

Site vitrine e-commerce CTRL-TECH construit en **HTML5, CSS3 et JavaScript natifs**. Cette version est un frontend statique : aucun framework, serveur Node.js ou base de données distante n'est nécessaire pour l'ouvrir.

## Référence design

Le système visuel suit la source officielle [Design System Precision Retail](https://github.com/ArnoldMenes1/ctrl-tech-plateforme/blob/main/docs/design/DESIGN-SYSTEM.md).

- Palette : Graphite `#14232B`, Ivoire `#F3F0E8`, Orange signal `#D96B45`, Sauge `#B9C9B8`, Blanc `#FFFFFF`, Titane `#69777B`, Champagne `#E8C77A`.
- Typographies : Space Grotesk, Instrument Sans et IBM Plex Mono.
- Direction : Precision Retail, Editorial Grid, Layered Glass mesuré, Continuous Flow et 3D sélective.
- Responsive mobile-first, focus visible et prise en charge de `prefers-reduced-motion`.

## Démarrage

1. Télécharger le dépôt.
2. Ouvrir `index.html` dans un navigateur moderne.
3. Facultatif : ouvrir le dossier avec VS Code et lancer Live Server.

Aucune installation npm ou Composer n'est nécessaire pour cette version statique.

## Structure active

- `index.html` — accueil, collections, sélection, présentation et contact.
- `assets/css/style.css` — tokens, fondations, composants et responsive.
- `assets/js/app.js` — navigation mobile, recherche, filtres, panier local et notifications.
- `assets/media/ctrl-tech-mark.svg` — icône CTRL-TECH.

## Interactions disponibles

- Navigation desktop et mobile.
- Recherche et filtrage des familles de produits.
- Sélection de gammes dans un panier local via `localStorage`.
- Suppression d'éléments de la sélection.
- Raccourci de recherche `Ctrl/Cmd + K`.

Le panier est une **sélection locale de démonstration**. Il ne transmet aucune commande au magasin et ne réalise aucun paiement.

## Données commerciales

Les familles de produits et marques sont issues du cadrage du projet. Les références précises, prix, stocks, garanties, frais et délais de livraison, coordonnées opérationnelles et moyens de paiement ne sont pas inventés. Ils devront être confirmés par CTRL-TECH avant la publication de fiches produit et l'activation d'un vrai parcours de commande.

## Architecture cible

Cette version est volontairement frontend-only. La prochaine étape sera de connecter les interfaces à un backend local et à une base de données locale après validation du catalogue et des règles opérationnelles. Le navigateur ne doit jamais décider seul des prix, stocks, paiements ou autorisations.
