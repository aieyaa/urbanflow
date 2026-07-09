# UrbanFlow

Plateforme de mobilité urbaine intelligente pour la métropole de Nantes (PWA). 

## Architecture du projet

- **Front-end + back-end** : Next.js 16 (App Router, Server Actions)
- **Base de données + Auth** : Supabase (PostgreSQL + PostGIS + Auth + Realtime)
- **Carte** : Leaflet.js
- **PWA** : service worker statique (`public/sw.js`) + manifest — `next-pwa` a été essayé mais son plugin webpack est incompatible avec Turbopack (défaut de Next.js 16 en build)
- **Styles** : Tailwind CSS
- **Hébergement** : Vercel + Supabase

## Prérequis

- Node.js v18+
- Un projet Supabase (URL + clé anon/publishable)

## Démarrage rapide

```bash
npm install
```

Créer un fichier `.env` à la racine avec les clés de ton projet Supabase (Project Settings → API) :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
...
```
Lancer le serveur de développement :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Schéma de base de données requis

`auth.users` (géré par Supabase), les tables suivantes doivent être créées manuellement dans l'éditeur SQL Supabase :

`profiles` (préférences de mobilité).

`trips` (historique des trajets choisis, pour le bilan carbone).

`favorite_stops`, `push_subscriptions`, `sent_alert_notifications` (arrêts favoris et alertes push de perturbation, voir US9).

## Fonctionnalités

- `/signup` : inscription par email + mot de passe, consentement RGPD, email de confirmation Supabase
- `/login` : connexion, session persistante (JWT + refresh token géré par Supabase)
- `/preferences` : configuration des préférences de mobilité (modes de transport, critère d'optimisation, accessibilité PMR), gestion des arrêts favoris et des notifications push de perturbation, route protégée
- `/itineraire` : planificateur multimodal (marche, vélo, trottinette, transports en commun, voiture) via OpenRouteService, avec CO2 estimé par mode
- `/parkings` : disponibilité en temps réel des parkings publics Naolib (Open Data Nantes Métropole)
- `/bilan-carbone` : historique des trajets choisis, CO2 émis/économisé (semaine/mois) et graphique d'évolution, route protégée
- `/horaires` : recherche d'arrêt Naolib (données GTFS statiques) puis prochains passages en temps réel (retards, perturbations réseau)
