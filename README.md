# CTRL-TECH — site e-commerce multipage

Frontend en HTML5, CSS3 et JavaScript natifs. Pas de React ni de framework frontend.

## Pages publiques
Accueil, catalogue, catégories et détails, marques et détails, fiche produit, comparateur (3 produits maximum), panier, connexion, inscription, récupération et réinitialisation du mot de passe, validation et confirmation de commande, compte client, commandes et détail, suivi, profil, à propos, contact, livraison, garanties et retours, FAQ, conditions générales, confidentialité, 404 et erreur.

## Administration
Espace séparé sous `/administration/` : tableau de bord, produits, marques, catégories, médias, inventaire, commandes, clients, promotions, rapports, équipe et permissions, paramètres boutique et journal d'activité.

## Architecture
Chaque route possède son propre fichier HTML. Les pages partagent `assets/css/pages.css` et `assets/js/pages.js`. Les routes à slug ou identifiant sont réécrites par Vercel vers des modèles HTML dédiés. Les anciens fichiers Laravel peuvent subsister dans le dépôt, mais ne sont pas utilisés par ces pages.

## Limites
Les pages et leurs interfaces sont structurées. Les comptes, produits réels, stocks, commandes, paiements, formulaires et droits d'administration nécessitent un backend et une base de données. Les actions non connectées sont présentées comme prototypes.
