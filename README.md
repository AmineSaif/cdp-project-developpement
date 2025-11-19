<div align="center">

# Projet SaaS (Sprint 1)

Stack : **Node.js (Express + Sequelize + JWT) + PostgreSQL + React**

</div>

## 🎯 Objectif
Mettre en place les fondations : authentification, gestion d'utilisateurs et issues (type, priorité, statut), board Kanban, profil avec statistiques, **système d'équipes collaboratives**.

## 📁 Structure
```
frontend/        # Application React
backend/         # API Express + Sequelize
database/        # Scripts SQL (création, schéma, seed, init PowerShell)
docker-compose.yml
README.md
```

## ✅ Prérequis
- Node.js 16+
- npm
- PostgreSQL (local OU Docker)
- PowerShell (Windows) ou bash (Linux/macOS)

## ⚙️ Configuration environnement
Copier puis adapter :
```
cp backend/.env.example backend/.env   # (ou manuellement sous Windows)
```
Variables clés (exemple) :
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=saas_user
DB_PASSWORD=saas_password
DB_NAME=saas_dev
JWT_SECRET=changeme-secret
PORT=4000
```

## 🗄️ Mise en place base de données
### Option 1 : Docker (recommandé en dev)
```
docker-compose up -d
```
Le service Postgres écoute sur `localhost:5432`.

### Option 2 : Local
Installer PostgreSQL puis :
```
psql -U postgres -c "SELECT version();"
psql -U postgres -f database/create-database.sql   # ignorer si 'already exists'
psql -U saas_user -d saas_dev -f database/schema.sql
psql -U saas_user -d saas_dev -f database/seed.sql  # optionnel
```

### Script PowerShell (Windows)
```
powershell -ExecutionPolicy Bypass -File .\database\init-database.ps1 -DbUser postgres -DbPassword postgres -DbName saas_dev
```

## 🚀 Démarrage rapide
Dans deux terminaux séparés :

Backend :
```
cd backend
npm install
npm run dev
```

Frontend :
```
cd frontend
npm install
npm run dev
```

Backend écoute par défaut sur `http://localhost:4000`, frontend sur `http://localhost:3000` (selon config Vite ou équivalent).

## 🔐 Authentification
- `POST /api/auth/register` (email, password, name, **teamCode optionnel**)
- `POST /api/auth/login` → JWT
- `GET /api/auth/me` (retourne user + team)
- `PATCH /api/auth/profile` (mise à jour profil)
- `PATCH /api/auth/password` (changement mot de passe)

## 👥 Équipes (Nouveau !)
- `GET /api/teams/members` - Liste des membres de mon équipe
- `GET /api/teams/my-team` - Informations complètes de l'équipe
- **Inscription avec code d'équipe** : rejoindre une équipe existante
- **Sans code** : création automatique d'une nouvelle équipe avec code unique
- **Assignation** : assigner des issues aux membres de l'équipe
- **Filtres** : voir toutes les issues de l'équipe ou seulement les siennes
- Voir [TEAMS.md](./TEAMS.md) pour la documentation complète

## 🐞 Issues API (exemples)
| Méthode | Route              | Description |
|---------|--------------------|-------------|
| GET     | /api/issues        | Liste paginée (selon implémentation) |
| GET     | /api/issues/:id    | Détail d'une issue |
| POST    | /api/issues        | Créer (auth requis) |
| PATCH   | /api/issues/:id    | Modifier statut/attributs |

Champs principaux : `type (bug|feature|task)`, `priority (low|medium|high|critical)`, `status (todo|inprogress|inreview|done)`.

## 🧩 Kanban Board
Glisser-déposer pour changer le statut d'une issue (optimistic update + PATCH). Les cartes affichent une barre colorée selon la priorité.

## 📊 Profil utilisateur
Affiche : total d'issues créées, répartitions par statut et type, **code d'équipe pour inviter des membres**, toggle pour filtrer stats (équipe vs mes issues).

## 🧪 Tests backend
```
cd backend
npm test
```
Utilise Jest + Supertest (tests basiques d'auth / endpoints à enrichir dans futurs sprints).

## 🔧 Scripts utiles (backend)
| Script | Rôle |
|--------|------|
| `force-sync.js` | Synchronisation Sequelize (déstructif si force=true) |
| `init-db.js` | Initialisation simple tables |
| `reset-schema.js` | Réinitialisation schéma (attention perte données) |

## 🛠️ Troubleshooting
| Problème | Solution |
|----------|----------|
| Connexion DB échoue | Vérifier `backend/.env` & que Postgres écoute sur 5432 |
| JWT invalide | Regénérer `JWT_SECRET` & relancer serveur |
| Tables absentes | Lancer script sync ou appliquer `database/schema.sql` |
| Ports occupés | Changer `PORT` dans `.env` ou stopper autre service |

## 🔐 Sécurité (à prévoir production)
- Ne pas exposer `.env` réel (utiliser `.env.example`).
- Utiliser mots de passe forts + rotation.
- Ajouter rate limiting / validation renforcée.
- Mettre en place migrations pour évolutions schéma.

## 📄 Licence
MIT (voir `backend/package.json`).

## ✅ Prochaines améliorations (roadmap courte)
- Système de commentaires sur issues
- Filtres avancés + pagination côté backend
- Migrations formelles (Umzug / Sequelize CLI)
- Tests front (React Testing Library)

---
Si vous clonez ce projet : suivez la section "Démarrage rapide" puis ouvrez `http://localhost:3000`.
