# Dossier `database`

Scripts et documentation pour créer et initialiser la base PostgreSQL utilisée par le backend.

## Fichiers
| Fichier | Rôle |
|---------|------|
| create-database.sql | Création base + utilisateur (simple, ignorer erreurs "exists") |
| schema.sql | Schéma des tables (équivalent aux modèles Sequelize) |
| seed.sql | Données de départ (admin + exemples d'issues) |
| init-database.ps1 | Script PowerShell d'automatisation locale |

## Prérequis
- PostgreSQL installé (ou via Docker)  
- Utilisateur ayant droits de création (`postgres`)
- Outil `psql` dans le PATH (sinon utiliser un container)

## Option 1 : Docker Compose
Dans la racine du projet :
```
docker-compose up -d
```
Le service Postgres démarre sur `localhost:5432` (vérifier `docker-compose.yml`).

## Option 2 : Installation locale
1. Installer PostgreSQL
2. S'assurer que `psql` fonctionne:
```
psql -U postgres -c "SELECT version();"
```

## Création base
Depuis la racine du projet :
```
psql -U postgres -f database/create-database.sql
```
(Si l'utilisateur existe déjà, ignorer l'erreur.)

## Application du schéma
```
psql -U saas_user -d saas_dev -f database/schema.sql
```

## Données de seed (DEV uniquement)
```
psql -U saas_user -d saas_dev -f database/seed.sql
```

## Script PowerShell
Pour automatiser (depuis la racine) :
```
powershell -ExecutionPolicy Bypass -File .\database\init-database.ps1 -DbUser postgres -DbPassword postgres -DbName saas_dev
```

## Synchronisation Sequelize
Le backend peut créer les tables automatiquement si un script de sync est exécuté (ex: `force-sync.js`). Pour éviter de perdre des données en production, privilégier migrations/outils dédiés. Ici sprint initial -> création simple.

## Variables d'environnement backend
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=saas_user
DB_PASSWORD=saas_password
DB_NAME=saas_dev
JWT_SECRET=changeme-secret
PORT=4000
```
Adapter si vous gardez l'utilisateur `postgres`.

## Sécurité
- Ne jamais committer un vrai mot de passe production.
- Changer `JWT_SECRET` avant déploiement.
- Limiter les droits si production (utilisateur sans CREATEDB).
