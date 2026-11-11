# CTRL-Tech — plateforme e-commerce

Application e-commerce Laravel 13 / PHP classique pour CTRL-Tech, avec catalogue public, comparateur, panier, checkout, suivi de commande et back-office.

## Stack
- Laravel 13 / PHP 8.3+
- Blade, Vite, JavaScript et CSS
- SQLite pour le développement local ; PostgreSQL / Neon pour les environnements hébergés
- Déploiement Vercel via le runtime communautaire vercel-php

## Installation locale
1. Installer PHP 8.3+, Composer, Node.js et les extensions PHP nécessaires (PDO SQLite ou PDO MySQL).
2. Copier .env.example vers .env.
3. Exécuter composer install puis npm install.
4. Exécuter php artisan key:generate.
5. Créer database/database.sqlite (ou configurer MySQL local).
6. Exécuter php artisan migrate --seed.
7. Définir ADMIN_EMAIL et ADMIN_PASSWORD dans .env, puis exécuter php artisan db:seed --class=AdminUserSeeder.
8. Exécuter npm run build, puis php artisan serve.

## Catalogue de démonstration
Le seeder importe des références électroniques repérées dans le catalogue public de Matik Business à Lubumbashi. Les prix sont des repères publics provenant d'un vendeur tiers ; ils ne sont pas les tarifs CTRL-Tech. Les stocks restent à zéro et les prix non confirmés : un administrateur doit vérifier et valider chaque prix et disponibilité avant d'activer l'achat en ligne.

Les images distantes sont utilisées comme visuels de référence. Elles restent hébergées par leurs éditeurs respectifs ; leur disponibilité et leurs droits doivent être vérifiés avant un usage commercial durable.

## Administration
- Connexion : /admin/connexion
- Produits, catégories, commandes et inventaire depuis le tableau de bord.
- Créer le compte admin via ADMIN_EMAIL et ADMIN_PASSWORD (12 caractères minimum), puis lancer le seeder dédié.

## Neon / Vercel
- Créer un environnement Neon PostgreSQL et configurer DB_CONNECTION=pgsql, DB_URL, DB_SSLMODE=require.
- Pour Vercel, configurer APP_KEY, APP_ENV=production, APP_DEBUG=false, APP_URL, DB_CONNECTION=pgsql, DB_URL, SESSION_DRIVER=database, CACHE_STORE=array, LOG_CHANNEL=stderr.
- Exécuter les migrations sur la base Neon avant d'ouvrir le site.
- vercel.json utilise vercel-php@0.5.2, un runtime PHP communautaire et non un runtime Vercel officiellement maintenu. Valider le build et les fonctions dans un environnement de préproduction avant mise en production.
- Le stockage de fichiers local n'est pas persistant dans les fonctions serverless. Pour les images téléversées depuis l'administration, configurer un stockage objet durable avant l'exploitation réelle.

## Sécurité et exploitation
- Ne jamais committer .env ou les secrets.
- Définir APP_DEBUG=false en production.
- Les commandes ne sont créées qu'après vérification serveur du prix confirmé et du stock.
- Le paiement en ligne n'est pas activé : les commandes sont enregistrées comme demandes non payées, avec confirmation manuelle.
