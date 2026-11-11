# Architecture fonctionnelle et technique — CTRL-TECH

## 1. Référence
Ce document suit le rapport général CTRL-TECH (novembre 2026). Il distingue l'architecture cible des fonctions déjà visibles dans le Preview.

## 2. Stack de référence
- Frontend : React, TypeScript strict et Vite.
- UI : Tailwind CSS 3 et composants accessibles.
- Routage : React Router.
- Données serveur : TanStack Query.
- Formulaires : React Hook Form et Zod.
- Backend : Vercel Functions / Node.js / TypeScript.
- Base de données : Neon PostgreSQL.
- ORM : Drizzle ORM.
- Authentification : Neon Managed Better Auth.
- Stockage média : stockage objet retenu pour les médias.
- Tests : Vitest, React Testing Library et Playwright.
- Hébergement : Vercel.

## 3. Modules fonctionnels prévus
### Boutique publique
Accueil, catalogue, catégories, marques, fiches produits, recherche, filtres, comparateur limité à trois références d'une même famille, panier, authentification client, checkout, confirmation et suivi de commande.

### Espace client
Profil, adresses, historique des commandes, détail et suivi.

### Back-office
Dashboard, produits, marques, catégories, médias, inventaire, mouvements de stock, commandes, clients, promotions, rapports, équipe, permissions, paramètres et journal d'activité.

## 4. Architecture logique cible
Navigateur React → API Vercel Functions → validation Zod et autorisations serveur → services métier → Drizzle ORM → Neon PostgreSQL.
Les images passent par un stockage objet et un mécanisme d'upload sécurisé. Les secrets restent exclusivement côté serveur.

## 5. Modèle de données cible
Catalogue : brands, categories, products, product_variants, product_images, product_attributes, attribute_values.
Inventaire : inventory_items, inventory_movements.
Clients et commandes : customer_profiles, customer_addresses, carts, cart_items, orders, order_items, order_status_history, payments, deliveries.
Administration : promotions, promotion_redemptions, rôles et permissions, audit_logs, store_settings, webhook_events.

Les tables doivent être créées et versionnées par migrations Drizzle. Les commandes conservent un instantané du prix, du nom et du SKU au moment de l'achat. Les montants utilisent un type monétaire exact.

## 6. Environnements
- Local : développement et données de test.
- Development : intégration technique et base de développement Neon.
- Preview : environnement isolé par déploiement.
- Production : données commerciales réelles après validation.

Aucun secret de production ne doit être exposé dans le navigateur ou réutilisé dans Preview.

## 7. État du Preview
La branche `fix/report-aligned-react-vite` rétablit le socle frontend React/TypeScript/Vite et la direction artistique Precision Retail. Le catalogue visible est une démonstration et la sélection du panier reste locale.

L'API métier, les migrations Neon/Drizzle, Neon Managed Better Auth, le stockage objet, le checkout, les commandes persistées, les rôles du back-office et les tests E2E restent à implémenter et valider avant de considérer le MVP comme complet.

## 8. Règles commerciales
Les prix, stocks, variantes, images officielles, garanties, frais et zones de livraison, retours et modes de paiement doivent être confirmés par CTRL-TECH. Les prix et disponibilités ne peuvent jamais être supposés par le frontend.
