# Instructions GitHub Copilot — CTRL-Tech

## Identité du projet
CTRL-Tech est une boutique e-commerce mono-vendeur destinée au marché de la RDC, avec une première exploitation locale à Lubumbashi et une possibilité d'évolution internationale.

## Contraintes non négociables
- Utiliser Laravel 13, PHP 8.3+, Blade, CSS et JavaScript classique.
- Ne pas introduire React, Vue, Next.js, Node comme serveur applicatif, Neon, Supabase ou une base distante.
- La base de données reste locale : SQLite par défaut ou MySQL local via XAMPP.
- Toute interface doit rester responsive (mobile, tablette, desktop).
- Ne jamais inventer de produits, prix, références, niveaux de stock, délais, garanties ou politiques commerciales.
- Ne pas activer un produit sans validation de ses informations commerciales.
- Ne pas intégrer un paiement réel tant que le prestataire et la capacité juridique de l'activité ne sont pas confirmés.
- Une demande de commande n'est pas une preuve de paiement ni une commande confirmée.
- Garder USD et CDF. Le taux de conversion est une configuration locale modifiable, pas une valeur de marché garantie.

## Architecture
- Routes web dans routes/web.php.
- Contrôleurs publics dans app/Http/Controllers.
- Contrôleurs d'administration dans app/Http/Controllers/Admin.
- Protection back-office via auth + middleware admin.
- Modèles Eloquent dans app/Models.
- Migrations dans database/migrations.
- Vues Blade dans resources/views.
- Styles globaux dans resources/css/app.css.
- Scripts dans resources/js.
- Paramètres de boutique dans config/storefront.php et .env.

## Règles de développement
- Valider toutes les données côté serveur.
- Utiliser les protections CSRF Laravel pour les formulaires.
- Ne jamais exposer de secret dans le dépôt.
- Préférer les migrations réversibles et les relations Eloquent explicites.
- Utiliser des transactions pour les opérations multi-tables.
- Vérifier les autorisations sur chaque route d'administration.
- Préserver les données de commande même si un produit est ensuite modifié ou désactivé.
- Ne pas faire confiance aux montants envoyés par le navigateur : recalculer les totaux depuis la base.
- Ne pas supprimer physiquement un produit référencé par une commande ; le désactiver.
- Ajouter ou mettre à jour les tests pour toute fonctionnalité métier.
- Garder les messages et libellés visibles en français.

## Parcours métier
1. Le visiteur consulte le catalogue.
2. Il ajoute un produit tarifé et actif au panier.
3. Il saisit ses coordonnées et son adresse de livraison.
4. L'application enregistre une demande avec une référence unique.
5. L'équipe confirme manuellement disponibilité, livraison et paiement.
6. L'administrateur met à jour le statut de la commande.

## Avant de conclure une modification
- Vérifier les routes et noms de routes.
- Vérifier les migrations SQLite et MySQL.
- Exécuter php artisan test.
- Exécuter npm run build.
- Ne pas prétendre qu'un test a réussi sans l'avoir exécuté.
