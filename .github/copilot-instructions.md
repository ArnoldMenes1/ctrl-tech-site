# CTRL-TECH — Instructions de développement

## Architecture de référence
Respecter le rapport général CTRL-TECH :
- Frontend : React + TypeScript strict + Vite.
- UI : Tailwind CSS 3 et composants accessibles.
- Navigation : React Router.
- Données serveur : TanStack Query.
- Formulaires : React Hook Form + Zod.
- Backend : Vercel Functions / Node.js / TypeScript.
- Base : Neon PostgreSQL.
- ORM : Drizzle ORM.
- Authentification : Neon Managed Better Auth.
- Hébergement : Vercel.
- Tests : Vitest, React Testing Library et Playwright.

Ne pas réintroduire Laravel, Blade, PHP, Eloquent, SQLite ou un serveur Apache.

## Design system
- Palette : Graphite #14232B, Ivoire #F3F0E8, Orange #D96B45, Sauge #B9C9B8, Blanc #FFFFFF, Titane #69777B, Champagne #E8C77A.
- Typographies : Space Grotesk, Instrument Sans, IBM Plex Mono.
- Direction : Precision Retail.
- Mobile-first, WCAG 2.2 AA comme cible, focus visible et prefers-reduced-motion.
- Utiliser les tokens et composants partagés ; conserver des rayons généreux et cohérents.

## Règles métier
- Marché initial : RDC, Lubumbashi.
- Ne jamais inventer prix, stock, garantie, frais, délais ou moyens de paiement.
- Les références du catalogue de démonstration ne valent pas validation commerciale.
- Ne jamais présenter une sélection locale comme une commande confirmée.
- Toute vraie commande exige API, base de données et vérification serveur des prix et stocks.
- Aucun paiement réel sans intégration et confirmation serveur fiable.
- Ne jamais exposer les secrets Neon dans le navigateur.

## Qualité
- TypeScript strict ; valider les entrées avec Zod.
- Tests unitaires, intégration et E2E pour les parcours critiques.
- Pas de liens morts ni de boutons sans action.
- Tester mobile, tablette, desktop et navigation clavier.
- Ne jamais déclarer un test exécuté s'il ne l'a pas été.
