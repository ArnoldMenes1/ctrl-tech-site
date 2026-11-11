# CTRL-Tech — plateforme e-commerce

Application e-commerce Laravel 13 / PHP classique pour CTRL-Tech, avec catalogue public, comparateur, panier, checkout, suivi de commande et back-office.

## Stack
- Laravel 13 / PHP 8.3+
- Blade, Vite, JavaScript et CSS
- SQLite ou MySQL pour le développement local ; PostgreSQL / Neon pour l'hébergement
- Vercel Container Runtime avec FrankenPHP
- Neon PostgreSQL en région Frankfurt (eu-central-1)

## Installation locale
1. Installer PHP 8.3+, Composer, Node.js et les extensions PHP nécessaires (PDO SQLite ou PDO MySQL).
2. Copier .env.example vers .env.
3. Exécuter composer install puis npm install.
4. Exécuter php artisan key:generate.
5. Créer database/database.sqlite (ou configurer MySQL local).
6. Exécuter php artisan migrate --seed.
7. Définir ADMIN_EMAIL et ADMIN_PASSWORD dans .env, puis exécuter php artisan db:seed --class=AdminUserSeeder.
8. Exécuter npm run build, puis php artisan serve.

## Catalogue local
Le catalogue de démonstration contient 31 références issues de catalogues publics de vendeurs présents à Lubumbashi : Matik Business, Telephone Lubumbashi, BCS-IT, PS STORE PRO et Forum Electronics. Les tarifs affichés sont des prix repères publics relevés chez des vendeurs tiers, pas des prix de vente CTRL-Tech. Les stocks sont volontairement à zéro et les prix non confirmés : un administrateur doit vérifier le prix, la disponibilité et les conditions avant d'activer l'achat en ligne.

Les visuels sont chargés depuis les sites éditeurs ou vendeurs. Les liens externes et les droits d'utilisation commerciale doivent être vérifiés avant la mise en production commerciale.

## Administration
- Connexion : /admin/connexion
- Produits, catégories, marques, inventaire, mouvements de stock, commandes, clients, promotions, rapports et gestion des rôles.
- Rôles : administrateur, gestionnaire, gestionnaire catalogue, opérateur commandes et analyste.
- Profil administrateur : changement d'adresse e-mail et de mot de passe.
- Sur Vercel, ouvrir une seule fois /admin/initialisation avec le jeton ADMIN_SETUP_TOKEN, puis choisir votre propre e-mail et mot de passe administrateur. Le formulaire se désactive automatiquement après la création du premier admin.
- En local, vous pouvez toujours utiliser ADMIN_EMAIL et ADMIN_PASSWORD puis lancer le seeder dédié.

## Déploiement Vercel + Neon
- Le déploiement Vercel utilise Dockerfile.vercel et FrankenPHP PHP 8.3.
- Neon PostgreSQL est provisionné dans la région Frankfurt (eu-central-1), avec une branche main pour la production et une branche preview pour les prévisualisations.
- Variables Vercel requises : APP_KEY, APP_ENV, APP_DEBUG, APP_URL, DB_CONNECTION=pgsql, DB_URL, DB_SSLMODE=require, SESSION_DRIVER=database, SESSION_ENCRYPT=true, CACHE_STORE=array, LOG_CHANNEL=stderr.
- Les migrations et le catalogue initial ont été provisionnés dans les deux branches Neon.
- Le stockage local de fichiers n'est pas persistant entre les redémarrages de conteneur. Un bucket Neon Object Storage a été créé ; l'intégration des téléversements du back-office vers ce bucket reste à finaliser avant d'autoriser les uploads en production.

## Sécurité et exploitation
- Ne jamais committer .env ou les secrets.
- APP_DEBUG=false en production.
- Le checkout vérifie côté serveur le prix confirmé et le stock avant d'enregistrer une commande.
- Les commandes sont enregistrées comme non payées : aucun paiement en ligne n'est activé. La confirmation du paiement, de la livraison et du retrait reste manuelle.
