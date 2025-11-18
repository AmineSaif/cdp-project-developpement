# Projet SaaS - Release 1 (Sprint 1)

Objectif : fondations & authentification (Express + React + PostgreSQL + Sequelize + JWT)

Prérequis
- Node.js 16+
- Docker (pour Postgres)

Démarrage rapide
1. Copier le fichier d'exemple d'environnement et remplir les valeurs :
   - backend/.env.example -> backend/.env

2. Lancer PostgreSQL via Docker Compose :

   docker-compose up -d

3. Backend :
   cd backend
   npm install
   npm run dev

4. Frontend :
   cd frontend
   npm install
   npm run dev

API
- Backend écoute par défaut sur : http://localhost:4000
- Routes principales :
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/issues
  - GET /api/issues/:id
  - POST /api/issues (auth requis)

Tests
- Backend : npm test (dans le dossier backend) — tests Jest + Supertest

Notes
- Ceci est une base minimale pour Sprint 1. Voir la todo list dans l'issue tracker pour les améliorations.
