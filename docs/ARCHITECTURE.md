# Architecture fonctionnelle et technique — CTRL-Tech

## 1. Périmètre
Boutique e-commerce mono-vendeur pour équipements informatiques, téléphones, accessoires, périphériques et connectivité. Le premier marché est la RDC ; USD et CDF sont prévus. La base de données reste locale au PC qui héberge l'application pendant la phase de test.

## 2. Architecture applicative
Application Laravel 13 monolithique, rendue côté serveur avec Blade. Le navigateur reçoit HTML, CSS et JavaScript ; les traitements métier et l'accès aux données restent dans Laravel.

- Présentation : Blade + CSS responsive + JavaScript.
- Métier : contrôleurs Laravel.
- Persistance : Eloquent ORM.
- Stockage : SQLite local par défaut, MySQL local facultatif.
- Assets : Vite.
- Back-office : authentification Laravel, rôle admin et middleware dédié.

## 3. Modules
### Boutique publique
- Accueil et navigation.
- Catégories et catalogue.
- Recherche par nom, marque et référence.
- Filtrage par catégorie et tri par prix.
- Fiche produit, description, caractéristiques et photo locale.
- Panier en session.
- Formulaire de demande de commande.
- Confirmation et référence de commande.
- Pages de présentation, contact, livraison/retours, confidentialité et conditions générales.

### Administration
- Connexion administrateur.
- Tableau de bord avec indicateurs.
- Gestion des catégories.
- Création et modification des produits.
- Publication ou désactivation des produits.
- Consultation des commandes.
- Mise à jour du statut de commande et du statut de paiement (suivi manuel uniquement).

## 4. Modèle de données
- users : comptes et rôles.
- categories : catégories de produits.
- products : références, prix, images, disponibilité et caractéristiques.
- orders : coordonnées client, livraison, devise, montants et statuts.
- order_items : instantané du nom, SKU, quantité et prix de chaque ligne au moment de la commande.

## 5. Relations
- Une catégorie possède plusieurs produits.
- Un produit appartient éventuellement à une catégorie.
- Une commande possède plusieurs lignes.
- Une ligne de commande référence éventuellement un produit ; son nom, son SKU et son prix sont copiés afin de conserver l'historique commercial.

## 6. Flux de commande
Le client ajoute au panier uniquement les produits actifs dont le prix USD est renseigné. Au checkout, le serveur relit les prix depuis la base, calcule les totaux et enregistre la demande. Aucun montant transmis par le navigateur n'est considéré comme fiable. Les frais de livraison restent à confirmer. Aucun paiement en ligne n'est exécuté à ce stade.

## 7. Base locale
Configuration par défaut : SQLite dans database/database.sqlite. Option : MySQL local dans XAMPP, base ctrl_tech. Aucune donnée n'est envoyée vers un fournisseur cloud.

## 8. Données commerciales et conformité
Aucun produit ou stock fictif n'est fourni. Les produits nouvellement créés sont non publiés par défaut. Les garanties, retours, prix, taux USD/CDF, frais de livraison et moyens de paiement doivent être validés avant l'ouverture commerciale.

## 9. Vérifications
- Tests : php artisan test.
- Assets : npm run build.
- Style PHP : vendor/bin/pint --test.
- CI : GitHub Actions sur main et pull requests.
