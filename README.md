# urbanflow
Project T6 

- Application PWA (Progressive Web Application)
- Application mobile Android & IOS

## Architecture du Projet
- **Front-end** : React (Vite)
- **Back-end** : Node.js (Express)
- **Database** : PostgreSQL + PostGIS (requêtes géographiques)
- **Conteneurisation** : Docker & Docker Compose
- **Hébergement** : Vercel

## Prérequis
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js v18+](https://nodejs.org/) (optionnel si utilisation de Docker)

## Démarrage Rapide (avec Docker)
Pour lancer l'intégralité de la stack de développement (PostGIS, Backend Node.js, Frontend React) :
```bash
docker compose up --build
```

Une fois démarré, vous pouvez accéder à :
- 🌐 **Frontend React (Vite)** : [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend API** : [http://localhost:5000](http://localhost:5000) (ou [http://localhost:5000/api/health](http://localhost:5000/api/health) pour tester la liaison PostGIS)
- 🗄️ **Base de données** : `localhost:5432` (User: `postgres`, Password: `postgres`, DB: `urbanflow`)

## Endpoints de l'API
- `GET /api/health` : Statut du backend et de la base de données PostGIS
- `GET /api/parkings` : Proxy direct vers l'API Nantes Métropole pour récupérer les disponibilités en temps réel.

## Intégrations futures
- **API Nantes Métropole** : [Parkings publics Nantes disponibilités](https://data.nantesmetropole.fr/explore/dataset/244400404_parkings-publics-nantes-disponibilites/api/?disjunctive.grp_nom&disjunctive.grp_statut)
- **Calculs IA** : Modèles pour les calculs de distance, de temps et d'itinéraires.
