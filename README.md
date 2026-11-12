# CTRL-TECH — site e-commerce multipage

Frontend en HTML5, CSS3 et JavaScript natifs. Pas de React ni de framework frontend.

## Hébergement et aperçu

Le storefront est publié avec **GitHub Pages** via GitHub Actions. Une fois GitHub Pages activé avec la source **GitHub Actions**, l'adresse du site est :

`https://arnoldmenes1.github.io/ctrl-tech-site/`

Le workflow `.github/workflows/pages.yml` prépare les chemins d'assets et les routes de détail pour l'hébergement statique avant publication.

## Catalogue actuel

Export des produits actifs servis par l'API publique de la boutique au 12 novembre 2026.

- **Fichier CSV :** [`docs/catalogue-produits-actuel.csv`](docs/catalogue-produits-actuel.csv)
- **Produits actifs au moment de l'export :** 71
- **Champs :** identifiant, nom, marque, catégorie, slug, prix USD, mise en avant, badge, description, image et caractéristiques.
- **Source :** `https://ctrl-tech-store.vercel.app/api/catalog`
- **Note :** cet export est un instantané ; il faut le régénérer après une modification du catalogue en ligne.

## Pages publiques

Accueil, catalogue, catégories et détails, marques et détails, fiche produit, comparateur (3 produits maximum), panier, connexion, inscription, récupération et réinitialisation du mot de passe, validation et confirmation de commande, compte client, commandes et détail, suivi, profil, à propos, contact, livraison, garanties et retours, FAQ, conditions générales, confidentialité, 404 et erreur.

## Administration

Espace séparé sous `/administration/` : tableau de bord, produits, marques, catégories, médias, inventaire, commandes, clients, promotions, rapports, équipe et permissions, paramètres boutique et journal d'activité.

## Architecture

Chaque route possède son propre fichier HTML. Les pages partagent `assets/css/pages.css` et `assets/js/pages.js`. Les routes de détail utilisent des paramètres d'URL compatibles avec l'hébergement statique. Les anciens fichiers Laravel peuvent subsister dans le dépôt, mais ne sont pas utilisés par le storefront statique.

## Limites

Les pages et leurs interfaces sont structurées. Les comptes, produits réels, stocks, commandes, paiements, formulaires et droits d'administration nécessitent un backend et une base de données. Les actions non connectées sont présentées comme prototypes.
