# CTRL-TECH — Instructions de développement

## Stack frontend obligatoire
- HTML5 sémantique, CSS3 natif et JavaScript vanilla.
- Pas de React, Vue, Angular, Next.js, Tailwind, Bootstrap ou jQuery.
- Pas de serveur Node.js ni de dépendance npm obligatoire pour exécuter le storefront.
- Entrées actives : `index.html`, `assets/css/style.css`, `assets/js/app.js`.

## Design system obligatoire
Suivre la référence du dépôt `ctrl-tech-plateforme` : `docs/design/DESIGN-SYSTEM.md`.
- Palette : graphite #14232B, ivoire #F3F0E8, orange #D96B45, sauge #B9C9B8, blanc #FFFFFF, titane #69777B, champagne #E8C77A.
- Typographies : Space Grotesk, Instrument Sans, IBM Plex Mono.
- Direction : Precision Retail / Editorial Grid / Layered Glass mesuré / Continuous Flow / 3D sélective.
- Espacement base 4px, grille responsive, rayons mesurés, animations courtes.
- Mobile-first, WCAG 2.2 AA comme cible, focus visible et prefers-reduced-motion.

## Règles métier non négociables
- Marché initial : RDC, présence locale à Lubumbashi.
- Ne jamais inventer références, prix, stock, garantie, frais, délais ou moyens de paiement.
- Ne pas prétendre qu'une sélection locale est une commande confirmée.
- Aucun paiement simulé ou présenté comme réel.
- Les coordonnées et conditions commerciales doivent être confirmées.
- Le panier de démonstration peut utiliser localStorage, mais toute vraie commande exige un backend, une base locale et une validation serveur.

## Qualité
- HTML sémantique et accessible.
- CSS organisé par tokens, fondations, composants, sections et responsive.
- JavaScript sans dépendance et sans injection de HTML non fiable.
- Pas de liens morts ni de boutons sans action.
- Tester les vues mobile/tablette/desktop et le clavier.
- Ne jamais déclarer un test exécuté s'il ne l'a pas été.
