# UrbanFlow

Plateforme de mobilité urbaine intelligente pour la métropole de Nantes (PWA). 

## Architecture du projet

- **Front-end + back-end** : Next.js 16 (App Router, Server Actions)
- **Base de données + Auth** : Supabase (PostgreSQL + PostGIS + Auth + Realtime)
- **Carte** : Leaflet.js
- **PWA** : next-pwa
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
```

Lancer le serveur de développement :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Schéma de base de données requis

`auth.users` (géré par Supabase), 
la table `profiles` (préférences de mobilité) doit être créée manuellement.

## Fonctionnalités

- `/signup` : inscription par email + mot de passe, consentement RGPD, email de confirmation Supabase
- `/login` : connexion, session persistante (JWT + refresh token géré par Supabase)
- `/preferences` : configuration des préférences de mobilité (modes de transport, critère d'optimisation, accessibilité PMR), route protégée

## Endpoints API (prévus, Sprint 3 — non encore implémentés)

### Intégrations futures 

- API Nantes Métropole (parkings publics, disponibilités)
- GTFS Naolib (horaires temps réel transports en commun)
- Calculs IA : distance, temps, itinéraires multimodaux 
- Empreinte carbone
