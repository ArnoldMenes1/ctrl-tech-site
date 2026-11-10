# CTRL-Tech — Boutique e-commerce

Nouvelle application officielle CTRL-Tech construite avec **Laravel 13, PHP, Blade, CSS et JavaScript**. Le projet est conçu pour fonctionner sur un PC Windows avec une base de données locale. Aucun service cloud n'est requis pour le développement local.

## Stack
- PHP 8.3+ et Laravel 13
- Blade, CSS responsive, JavaScript et Vite
- SQLite local par défaut ; MySQL local (XAMPP) également pris en charge
- Authentification administrateur par session Laravel

## Fonctionnalités incluses
- Accueil, catégories, catalogue, recherche, filtres et tri.
- Fiches produits, descriptions et caractéristiques.
- Panier en session.
- Formulaire de demande de commande et confirmation avec référence.
- Enregistrement des commandes et lignes de commande en base locale.
- Devises USD et CDF avec taux de conversion configurable.
- Pages À propos, Contact, Livraison & retours, Confidentialité et Conditions générales.
- Espace administrateur protégé : connexion, tableau de bord, gestion des produits et catégories, suivi et mise à jour des commandes.
- Migrations, catégories initiales, tests fonctionnels et interface responsive.

**Données commerciales :** aucun produit, prix, stock, garantie ou délai fictif n'est préchargé. Les fiches produits sont en brouillon par défaut. Une demande de commande n'est pas un paiement : les disponibilités, frais de livraison et modalités de paiement sont confirmés par CTRL-Tech avant validation finale.

## Prérequis
- PHP 8.3+ avec extensions PDO SQLite (ou PDO MySQL si MySQL est utilisé), OpenSSL, Mbstring, Tokenizer, XML, Ctype, Fileinfo et cURL.
- Composer 2.
- Node.js LTS et npm.

## Installation locale — Windows / PowerShell
Téléchargez le dépôt, ouvrez PowerShell dans le dossier du projet puis exécutez :

    composer install
    Copy-Item .env.example .env
    php artisan key:generate
    New-Item -ItemType File -Force database/database.sqlite
    php artisan migrate --seed
    npm install
    npm run build
    php artisan serve

Ouvrez ensuite http://127.0.0.1:8000.

Pour travailler avec rechargement automatique, ouvrez un deuxième terminal et exécutez npm run dev.

## Base MySQL locale (option XAMPP)
Créez une base vide ctrl_tech dans phpMyAdmin. Dans .env, remplacez la configuration SQLite par :

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=ctrl_tech
    DB_USERNAME=root
    DB_PASSWORD=

Puis lancez php artisan migrate --seed. Les données restent sur votre ordinateur.

## Créer le compte administrateur
Définissez dans .env vos propres identifiants (ne les publiez jamais sur GitHub) :

    ADMIN_NAME="Administrateur CTRL-Tech"
    ADMIN_EMAIL="votre-adresse@example.com"
    ADMIN_PASSWORD="un-mot-de-passe-long-et-unique"

Puis lancez :

    php artisan db:seed --class=AdminUserSeeder

Connectez-vous sur http://127.0.0.1:8000/admin/connexion. Le seeder refuse les mots de passe de moins de 12 caractères. Aucun compte admin par défaut n'est créé.

## Paramètres de la boutique
Configurez dans .env :

    USD_TO_CDF_RATE=2800
    STORE_CONTACT_PHONE=
    STORE_CONTACT_EMAIL=
    STORE_ADDRESS="Lubumbashi, Haut-Katanga, RDC"

Le taux de change est une valeur de configuration à actualiser avant utilisation. Les prix affichés et les stocks doivent être validés par l'équipe.

## Images produits
Les images locales sont prévues dans storage/app/public/products. Après avoir placé les fichiers, lancez php artisan storage:link et renseignez le chemin relatif dans la fiche produit, par exemple products/reference.webp.

## Tests et qualité

    php artisan test
    vendor/bin/pint --test

## Structure principale
- app/Http/Controllers : storefront, panier, commande et administration.
- app/Http/Middleware : protection de l'espace admin.
- app/Models : utilisateurs, catégories, produits, commandes.
- database/migrations : schéma relationnel local.
- database/seeders : catégories et compte administrateur explicite.
- resources/views : pages publiques et back-office Blade.
- resources/css et resources/js : interface et interactions.
- routes/web.php : routes publiques et protégées.

## À finaliser avant ouverture commerciale
- Vérification locale complète sur le PC cible.
- Import du vrai catalogue, prix, photos, disponibilité, garanties et retours.
- Gestion avancée des catégories et inventaire.
- Définition définitive des frais et zones de livraison.
- Choix et intégration d'un prestataire de paiement compatible avec le pays et le statut juridique de l'activité.
- Notifications e-mail, suivi client et politique de confidentialité définitive.
- Audit sécurité, tests de parcours et sauvegardes.

Ne pas publier en production avant la validation de ces éléments, la configuration des secrets et APP_DEBUG=false.
