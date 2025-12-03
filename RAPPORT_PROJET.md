# Rapport de Projet - GProjet (Gestion de Projets Agile)

**Date:** 3 Décembre 2025  
**Projet:** GProjet - Application de Gestion de Projets Scrum  
**Repository:** cdp-project-developpement  
**Auteurs:** Amine Saif & contributeurs  

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Fonctionnalités implémentées](#3-fonctionnalités-implémentées)
4. [Base de données](#4-base-de-données)
5. [API REST](#5-api-rest)
6. [Interface utilisateur](#6-interface-utilisateur)
7. [Système de notifications](#7-système-de-notifications)
8. [Génération de rapports PDF](#8-génération-de-rapports-pdf)
9. [Sécurité et authentification](#9-sécurité-et-authentification)
10. [Tests et qualité](#10-tests-et-qualité)
11. [Guide d'installation](#11-guide-dinstallation)
12. [Guide d'utilisation](#12-guide-dutilisation)
13. [Difficultés rencontrées](#13-difficultés-rencontrées)
14. [Améliorations futures](#14-améliorations-futures)
15. [Conclusion](#15-conclusion)

---

## 1. Présentation du projet

### 1.1 Objectif
GProjet est une application web complète de gestion de projets selon la méthodologie Agile/Scrum. Elle permet aux équipes de collaborer efficacement en gérant des projets, sprints, tâches (issues), et membres d'équipe.

### 1.2 Contexte
Ce projet a été développé dans le cadre d'un cours de développement logiciel avec pour objectif de mettre en pratique :
- Architecture full-stack moderne (Node.js + React)
- Gestion de base de données relationnelle (PostgreSQL)
- API RESTful et authentification JWT
- Méthodologie Agile/Scrum
- Collaboration en équipe avec Git

### 1.3 Technologies utilisées

#### Backend
- **Node.js** (v18+) - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données relationnelle
- **JWT (jsonwebtoken)** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **dotenv** - Gestion des variables d'environnement

#### Frontend
- **React** (v18+) - Bibliothèque UI
- **Vite** - Build tool et dev server
- **React Router** - Navigation
- **Axios** - Client HTTP
- **Recharts** - Graphiques et visualisations
- **jsPDF** - Génération de PDF
- **jspdf-autotable** - Tableaux dans les PDF

#### DevOps
- **Git/GitHub** - Contrôle de version
- **npm** - Gestionnaire de paquets
- **PowerShell** - Scripts d'initialisation (Windows)

---

## 2. Architecture technique

### 2.1 Architecture globale
```
┌─────────────────┐         HTTP/REST API          ┌─────────────────┐
│                 │  ←─────────────────────────→   │                 │
│  Frontend       │                                 │   Backend       │
│  (React/Vite)   │         JSON/JWT                │  (Node/Express) │
│  Port 5173      │                                 │   Port 5000     │
│                 │                                 │                 │
└─────────────────┘                                 └────────┬────────┘
                                                             │
                                                             │ Sequelize ORM
                                                             ↓
                                                    ┌─────────────────┐
                                                    │   PostgreSQL    │
                                                    │   Port 5432     │
                                                    └─────────────────┘
```

### 2.2 Structure des dossiers

#### Backend
```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuration Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Authentification (register/login)
│   │   ├── projectController.js # Gestion projets
│   │   ├── sprintController.js  # Gestion sprints
│   │   ├── issueController.js   # Gestion issues/tâches
│   │   ├── notificationController.js # Notifications
│   │   ├── statsController.js   # Statistiques
│   │   └── ...
│   ├── models/
│   │   ├── user.js
│   │   ├── project.js
│   │   ├── sprint.js
│   │   ├── issue.js
│   │   ├── notification.js
│   │   └── index.js             # Relations Sequelize
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── sprints.js
│   │   ├── issues.js
│   │   └── notifications.js
│   ├── middlewares/
│   │   └── auth.js              # Middleware JWT
│   ├── utils/
│   │   ├── notificationHelper.js
│   │   └── projectCodeGenerator.js
│   └── index.js                 # Point d'entrée
├── tests/
│   ├── auth.test.js
│   └── issues.test.js
├── .env.example
└── package.json
```

#### Frontend
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Board.jsx            # Kanban board
│   │   ├── ProjectStats.jsx     # Statistiques projet
│   │   ├── Profile.jsx
│   │   └── Notifications.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ...
│   ├── context/
│   │   └── ProjectContext.jsx   # Context API React
│   ├── services/
│   │   └── api.js               # Configuration Axios
│   ├── styles/
│   │   └── *.css
│   └── main.jsx                 # Point d'entrée
├── .env.example
└── package.json
```

### 2.3 Modèle de données (Relations Sequelize)

```
User ─────┐
          │
          ├──< ProjectMember >──┬─── Project ───┬─── Sprint ───┬─── Issue
          │                     │               │              │
          │                     └─── Client     │              └─── assigneeId
          │                                     │
          └─────────────────────────────────────┴───────────── createdById

Notification
├── userId (destinataire)
├── relatedUserId (acteur)
├── relatedProjectId
└── relatedIssueId
```

**Relations principales :**
- Un **User** peut créer plusieurs **Projets** (via Client)
- Un **User** peut être membre de plusieurs **Projets** (via ProjectMember)
- Un **Project** contient plusieurs **Sprints**
- Un **Sprint** contient plusieurs **Issues**
- Une **Issue** est assignée à un **User**
- Les **Notifications** lient utilisateurs, projets et issues

---

## 3. Fonctionnalités implémentées

### 3.1 Authentification et gestion des utilisateurs
✅ **Inscription** avec création automatique de projet initial  
✅ **Connexion** avec JWT (validité 7 jours)  
✅ **Rejoindre un projet existant** via code projet  
✅ **Profil utilisateur** avec modification nom/email/mot de passe  
✅ **Statistiques personnelles** (issues créées, répartition par statut)  

### 3.2 Gestion des projets
✅ **Création de projets** avec génération de code unique  
✅ **Liste des projets** (propriétaire + membre)  
✅ **Modification** nom et description  
✅ **Suppression** (propriétaire uniquement)  
✅ **Gestion des membres** (ajout/retrait)  
✅ **Verrouillage des inscriptions** (activer/désactiver)  
✅ **Régénération du code projet**  

### 3.3 Gestion des sprints
✅ **Création de sprints** dans un projet  
✅ **Liste des sprints** d'un projet  
✅ **Modification** nom, dates, statut  
✅ **Suppression de sprints**  
✅ **Statuts** : planned, active, completed  

### 3.4 Gestion des issues (tâches)
✅ **Création d'issues** avec :
   - Titre, description
   - Type : bug, feature, task
   - Priorité : low, medium, high, critical
   - Assignation à un membre
   - Rattachement à un sprint
   
✅ **Tableau Kanban** avec drag & drop :
   - Colonnes : To Do, In Progress, In Review, Done
   - Mise à jour optimiste du statut
   - Barre de couleur selon priorité
   
✅ **Filtres** : mes issues / toutes les issues  
✅ **Modification** de tous les champs  
✅ **Suppression d'issues**  

### 3.5 Statistiques et tableaux de bord
✅ **Dashboard global** :
   - Liste des projets
   - Sprints actifs
   - Issues récentes
   
✅ **Statistiques projet** :
   - Nombre total d'issues
   - Répartition par statut (graphique en barres)
   - Répartition par type (graphique circulaire)
   - Répartition par priorité
   - Liste des membres
   - Liste des sprints
   
✅ **Statistiques sprint** :
   - Progression des issues
   - Breakdown par type et priorité
   - Dates et durée

### 3.6 Système de notifications
✅ **Notifications en temps réel** pour :
   - Assignation d'une issue
   - Changement de statut d'une issue
   - Nouveau membre dans un projet
   
✅ **Interface notifications** :
   - Liste des notifications non lues
   - Compteur dans le header
   - Formatage du temps relatif
   - Navigation vers le contexte (projet/issue)
   - Marquer comme lu (individuel ou tout)
   
✅ **Notifications enrichies** avec :
   - Nom de l'utilisateur acteur (correction du bug "undefined")
   - Projet associé
   - Issue associée

### 3.7 Génération de rapports PDF
✅ **Rapport de projet complet** :
   - Métadonnées (nom, description, dates)
   - Statistiques globales
   - Répartition des issues par statut, type, priorité
   - Liste des membres
   - Liste des sprints avec détails
   - Fichier : `rapport-projet-[nom].pdf`
   
✅ **Rapport de sprint détaillé** :
   - Métadonnées du sprint (nom, dates, statut)
   - Statistiques du sprint
   - Breakdown par statut, type, priorité
   - Liste complète des issues avec détails
   - Fichier : `rapport-sprint-[nom].pdf`
   
✅ **Format professionnel** :
   - En-tête avec logo/titre
   - Tables formatées avec jspdf-autotable
   - Mise en page claire et lisible

---

## 4. Base de données

### 4.1 Schéma détaillé de la base de données

La base de données `saas_dev` contient **8 tables** avec leurs relations et contraintes.

#### Table 1: `users` (Utilisateurs)
| Colonne       | Type                                    | Contraintes           | Description                              |
|---------------|-----------------------------------------|-----------------------|------------------------------------------|
| id            | SERIAL                                  | PRIMARY KEY           | Identifiant unique auto-incrémenté       |
| name          | VARCHAR(255)                            | NULL                  | Nom complet de l'utilisateur             |
| email         | VARCHAR(255)                            | NOT NULL, UNIQUE      | Email de connexion (unique)              |
| passwordHash  | VARCHAR(255)                            | NULL                  | Hash bcrypt du mot de passe (10 rounds)  |
| role          | ENUM('admin','developer','tester')      | NOT NULL, DEFAULT 'developer' | Rôle de l'utilisateur           |
| teamId        | INTEGER                                 | FK → teams(id)        | Équipe de l'utilisateur (legacy)         |
| createdAt     | TIMESTAMP WITH TIME ZONE                | NOT NULL, DEFAULT NOW | Date de création du compte               |
| updatedAt     | TIMESTAMP WITH TIME ZONE                | NOT NULL, DEFAULT NOW | Date de dernière modification            |

**Index :**
- UNIQUE sur `email`
- INDEX sur `teamId`

**Relations :**
- Appartient à une `Team` (optionnel, legacy)
- Crée des `Projects`, `Sprints`, `Issues`
- Reçoit des `Notifications`
- Membre de `Projects` via `ProjectMembers`

---

#### Table 2: `teams` (Équipes - Legacy)
| Colonne       | Type                     | Contraintes           | Description                              |
|---------------|--------------------------|-----------------------|------------------------------------------|
| id            | SERIAL                   | PRIMARY KEY           | Identifiant unique                       |
| name          | VARCHAR(255)             | NOT NULL, DEFAULT 'Mon Équipe' | Nom de l'équipe                |
| teamCode      | VARCHAR(8)               | UNIQUE                | Code unique pour rejoindre l'équipe      |
| createdById   | INTEGER                  | FK → users(id)        | Utilisateur créateur de l'équipe         |
| createdAt     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW | Date de création                         |
| updatedAt     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW | Date de modification                     |

**Index :**
- UNIQUE sur `teamCode`

**Relations :**
- Créée par un `User`
- Contient plusieurs `Users`
- **Note :** Système legacy, remplacé par le système de projets

---

#### Table 3: `clients` (Clients)
| Colonne       | Type                     | Contraintes           | Description                              |
|---------------|--------------------------|-----------------------|------------------------------------------|
| id            | SERIAL                   | PRIMARY KEY           | Identifiant unique                       |
| name          | VARCHAR(255)             | NOT NULL              | Nom du client                            |
| ownerId       | INTEGER                  | NOT NULL, FK → users(id) | Utilisateur propriétaire du client    |
| createdAt     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW | Date de création                         |
| updatedAt     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW | Date de modification                     |

**Index :**
- INDEX sur `ownerId`

**Relations :**
- Appartient à un `User` (owner)
- Possède plusieurs `Projects`

---

#### Table 4: `projects` (Projets)
| Colonne       | Type                     | Contraintes           | Description                              |
|---------------|--------------------------|-----------------------|------------------------------------------|
| id            | SERIAL                   | PRIMARY KEY           | Identifiant unique                       |
| name          | VARCHAR(255)             | NOT NULL              | Nom du projet                            |
| description   | TEXT                     | NULL                  | Description détaillée du projet          |
| projectCode   | VARCHAR(8)               | NOT NULL, UNIQUE      | Code unique (ex: PROJ-ABC1)              |
| joinLocked    | BOOLEAN                  | NOT NULL, DEFAULT FALSE | Inscriptions verrouillées (true/false) |
| clientId      | INTEGER                  | NOT NULL, FK → clients(id) | Client propriétaire du projet       |
| createdById   | INTEGER                  | NOT NULL, FK → users(id) | Utilisateur créateur du projet        |
| createdAt     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW | Date de création                         |
| updatedAt     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW | Date de modification                     |

**Index :**
- UNIQUE sur `projectCode`
- INDEX sur `clientId`
- INDEX sur `createdById`

**Relations :**
- Appartient à un `Client`
- Créé par un `User`
- Contient plusieurs `Sprints`
- Possède plusieurs `ProjectMembers` (utilisateurs membres)
- Lié à des `Notifications`

---

#### Table 5: `sprints` (Sprints)
| Colonne       | Type                                              | Contraintes           | Description                              |
|---------------|---------------------------------------------------|-----------------------|------------------------------------------|
| id            | SERIAL                                            | PRIMARY KEY           | Identifiant unique                       |
| name          | VARCHAR(255)                                      | NOT NULL, DEFAULT 'Sprint 1' | Nom du sprint                  |
| description   | TEXT                                              | NULL                  | Description du sprint                    |
| startDate     | DATE                                              | NULL                  | Date de début (optionnel)                |
| endDate       | DATE                                              | NULL                  | Date de fin (optionnel)                  |
| status        | ENUM('planned','active','completed','archived')   | NOT NULL, DEFAULT 'planned' | Statut actuel du sprint        |
| projectId     | INTEGER                                           | NOT NULL, FK → projects(id) | Projet parent                      |
| createdById   | INTEGER                                           | NOT NULL, FK → users(id) | Utilisateur créateur                  |
| createdAt     | TIMESTAMP WITH TIME ZONE                          | NOT NULL, DEFAULT NOW | Date de création                         |
| updatedAt     | TIMESTAMP WITH TIME ZONE                          | NOT NULL, DEFAULT NOW | Date de modification                     |

**Index :**
- INDEX sur `projectId`
- INDEX sur `createdById`
- INDEX sur `status`

**Relations :**
- Appartient à un `Project`
- Créé par un `User`
- Contient plusieurs `Issues`

---

#### Table 6: `issues` (Tâches/Issues)
| Colonne       | Type                                    | Contraintes           | Description                              |
|---------------|-----------------------------------------|-----------------------|------------------------------------------|
| id            | SERIAL                                  | PRIMARY KEY           | Identifiant unique                       |
| title         | VARCHAR(500)                            | NOT NULL              | Titre de l'issue                         |
| description   | TEXT                                    | NULL                  | Description détaillée                    |
| type          | ENUM('bug','feature','task')            | NOT NULL, DEFAULT 'task' | Type de tâche                         |
| priority      | ENUM('low','medium','high','critical')  | NOT NULL, DEFAULT 'low' | Niveau de priorité                    |
| status        | ENUM('todo','inprogress','inreview','done') | NOT NULL, DEFAULT 'todo' | Statut d'avancement               |
| assigneeId    | INTEGER                                 | NULL, FK → users(id)  | Utilisateur assigné (peut être NULL)     |
| createdById   | INTEGER                                 | NOT NULL, FK → users(id) | Utilisateur créateur                  |
| teamId        | INTEGER                                 | NULL, FK → teams(id)  | Équipe (deprecated)                      |
| sprintId      | INTEGER                                 | NULL, FK → sprints(id) | Sprint parent                           |
| createdAt     | TIMESTAMP WITH TIME ZONE                | NOT NULL, DEFAULT NOW | Date de création                         |
| updatedAt     | TIMESTAMP WITH TIME ZONE                | NOT NULL, DEFAULT NOW | Date de modification                     |

**Index :**
- INDEX sur `assigneeId`
- INDEX sur `createdById`
- INDEX sur `sprintId`
- INDEX sur `status`
- INDEX sur `type`
- INDEX sur `priority`

**Relations :**
- Appartient à un `Sprint`
- Créée par un `User`
- Assignée à un `User` (optionnel)
- Liée à des `Notifications`

---

#### Table 7: `project_members` (Membres des projets)
| Colonne       | Type                     | Contraintes           | Description                              |
|---------------|--------------------------|-----------------------|------------------------------------------|
| id            | SERIAL                   | PRIMARY KEY           | Identifiant unique                       |
| projectId     | INTEGER                  | NOT NULL, FK → projects(id) | Projet concerné                    |
| userId        | INTEGER                  | NOT NULL, FK → users(id) | Utilisateur membre                    |
| role          | VARCHAR(32)              | NULL                  | Rôle dans le projet (member, admin)      |
| createdAt     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW | Date d'ajout au projet                   |
| updatedAt     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW | Date de modification                     |

**Contraintes :**
- UNIQUE sur (`projectId`, `userId`) - un utilisateur ne peut être membre qu'une seule fois par projet

**Index :**
- UNIQUE sur (`projectId`, `userId`)
- INDEX sur `projectId`
- INDEX sur `userId`

**Relations :**
- Table de jonction Many-to-Many entre `Projects` et `Users`
- Un `User` peut être membre de plusieurs `Projects`
- Un `Project` peut avoir plusieurs `Users` membres

---

#### Table 8: `notifications` (Notifications)
| Colonne          | Type                                                                        | Contraintes           | Description                              |
|------------------|-----------------------------------------------------------------------------|-----------------------|------------------------------------------|
| id               | SERIAL                                                                      | PRIMARY KEY           | Identifiant unique                       |
| type             | ENUM('issue_assigned','issue_status_changed','project_member_joined',...) | NOT NULL, DEFAULT 'other' | Type de notification               |
| message          | TEXT                                                                        | NOT NULL              | Message affiché à l'utilisateur          |
| userId           | INTEGER                                                                     | NOT NULL, FK → users(id) | Utilisateur destinataire              |
| isRead           | BOOLEAN                                                                     | NOT NULL, DEFAULT FALSE | Notification lue ou non                |
| relatedProjectId | INTEGER                                                                     | NULL, FK → projects(id) | Projet lié (optionnel)                |
| relatedIssueId   | INTEGER                                                                     | NULL, FK → issues(id) | Issue liée (optionnel)                  |
| relatedUserId    | INTEGER                                                                     | NULL, FK → users(id)  | Utilisateur acteur (optionnel)           |
| createdAt        | TIMESTAMP WITH TIME ZONE                                                    | NOT NULL, DEFAULT NOW | Date de création de la notification      |
| updatedAt        | TIMESTAMP WITH TIME ZONE                                                    | NOT NULL, DEFAULT NOW | Date de modification                     |

**Types de notifications supportés :**
- `issue_assigned` : Assignation d'une issue
- `issue_status_changed` : Changement de statut d'une issue
- `project_member_joined` : Nouveau membre dans le projet
- `issue_created` : Nouvelle issue créée
- `sprint_created` : Nouveau sprint créé
- `other` : Autres types

**Index :**
- INDEX sur `userId`
- INDEX sur `isRead`
- INDEX sur `createdAt`
- INDEX sur `relatedProjectId`
- INDEX sur `relatedIssueId`

**Relations :**
- Appartient à un `User` (destinataire)
- Peut être liée à un `Project`
- Peut être liée à une `Issue`
- Peut référencer un `User` acteur (qui a déclenché la notification)

### 4.2 Diagramme de relations (ERD)

```
┌─────────────┐
│   teams     │ (legacy)
│─────────────│
│ id (PK)     │
│ name        │
│ teamCode    │◀────────┐
│ createdById │         │
└─────────────┘         │
                        │
                        │
┌─────────────┐         │
│   users     │         │
│─────────────│         │
│ id (PK)     │─────────┘
│ name        │
│ email       │
│ passwordHash│
│ role        │
│ teamId (FK) │
└──────┬──────┘
       │
       │ creates
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│  clients    │       │  projects   │
│─────────────│       │─────────────│
│ id (PK)     │◀──────│ id (PK)     │
│ name        │       │ name        │
│ ownerId(FK) │       │ description │
└─────────────┘       │ projectCode │
                      │ joinLocked  │
                      │ clientId(FK)│
                      │createdById  │
                      └──────┬──────┘
                             │
                             │ contains
                             │
                      ┌──────┴──────┐
                      │             │
                      ▼             ▼
              ┌─────────────┐ ┌──────────────┐
              │  sprints    │ │project_members│
              │─────────────│ │──────────────│
              │ id (PK)     │ │ id (PK)      │
              │ name        │ │ projectId(FK)│
              │ description │ │ userId (FK)  │
              │ startDate   │ │ role         │
              │ endDate     │ └──────────────┘
              │ status      │
              │ projectId   │
              │createdById  │
              └──────┬──────┘
                     │
                     │ contains
                     │
                     ▼
              ┌─────────────┐
              │   issues    │
              │─────────────│
              │ id (PK)     │
              │ title       │
              │ description │
              │ type        │
              │ priority    │
              │ status      │
              │ assigneeId  │◀─── assigned to user
              │ createdById │
              │ sprintId(FK)│
              │ teamId (FK) │
              └──────┬──────┘
                     │
                     │ triggers
                     │
                     ▼
              ┌──────────────┐
              │notifications │
              │──────────────│
              │ id (PK)      │
              │ type         │
              │ message      │
              │ userId (FK)  │──── received by user
              │ isRead       │
              │relatedProjectId│
              │relatedIssueId │
              │relatedUserId │──── triggered by user
              └──────────────┘
```

### 4.3 Scripts d'initialisation

**Script SQL complet :**
Le fichier `database/create-full-schema.sql` contient la création complète de la base de données avec :
- Suppression sécurisée des tables existantes
- Création des types ENUM
- Création des 8 tables dans l'ordre des dépendances
- Définition de toutes les clés étrangères
- Création de tous les index
- Commentaires sur les tables et colonnes
- Données de test optionnelles

**Exécution du script :**
```bash
# Depuis PowerShell
psql -U postgres -d saas_dev -f database/create-full-schema.sql

# Ou création + exécution
createdb -U postgres saas_dev
psql -U postgres -d saas_dev -f database/create-full-schema.sql
```

**Migration Sequelize (alternative) :**
- Utilisation de `sequelize.sync()` pour la création automatique des tables
- Relations définies dans `models/index.js`
- Commande : `node backend/force-sync.js`

---

## 5. API REST

### 5.1 Endpoints d'authentification

| Méthode | Route                  | Description                | Auth |
|---------|------------------------|----------------------------|------|
| POST    | `/api/auth/register`   | Inscription utilisateur    | Non  |
| POST    | `/api/auth/login`      | Connexion                  | Non  |
| GET     | `/api/auth/me`         | Profil utilisateur         | Oui  |
| PATCH   | `/api/auth/profile`    | Modifier profil            | Oui  |
| PATCH   | `/api/auth/password`   | Changer mot de passe       | Oui  |

### 5.2 Endpoints projets

| Méthode | Route                           | Description                     | Auth |
|---------|---------------------------------|---------------------------------|------|
| GET     | `/api/projects`                 | Liste des projets               | Oui  |
| GET     | `/api/projects/:id`             | Détails d'un projet             | Oui  |
| POST    | `/api/projects`                 | Créer un projet                 | Oui  |
| PATCH   | `/api/projects/:id`             | Modifier un projet              | Oui  |
| DELETE  | `/api/projects/:id`             | Supprimer un projet             | Oui  |
| POST    | `/api/projects/:id/join`        | Rejoindre un projet             | Oui  |
| GET     | `/api/projects/:id/members`     | Liste des membres               | Oui  |
| GET     | `/api/projects/:id/sprints`     | Liste des sprints               | Oui  |
| GET     | `/api/projects/:id/stats`       | Statistiques du projet          | Oui  |

### 5.3 Endpoints sprints

| Méthode | Route                      | Description                | Auth |
|---------|----------------------------|----------------------------|------|
| GET     | `/api/sprints/:id`         | Détails d'un sprint        | Oui  |
| POST    | `/api/sprints`             | Créer un sprint            | Oui  |
| PATCH   | `/api/sprints/:id`         | Modifier un sprint         | Oui  |
| DELETE  | `/api/sprints/:id`         | Supprimer un sprint        | Oui  |
| GET     | `/api/sprints/:id/issues`  | Liste des issues du sprint | Oui  |

### 5.4 Endpoints issues

| Méthode | Route                | Description           | Auth |
|---------|----------------------|-----------------------|------|
| GET     | `/api/issues`        | Liste des issues      | Oui  |
| GET     | `/api/issues/:id`    | Détails d'une issue   | Oui  |
| POST    | `/api/issues`        | Créer une issue       | Oui  |
| PATCH   | `/api/issues/:id`    | Modifier une issue    | Oui  |
| DELETE  | `/api/issues/:id`    | Supprimer une issue   | Oui  |

### 5.5 Endpoints notifications

| Méthode | Route                           | Description                    | Auth |
|---------|---------------------------------|--------------------------------|------|
| GET     | `/api/notifications`            | Liste des notifications        | Oui  |
| GET     | `/api/notifications/unread-count` | Nombre de non lues           | Oui  |
| PATCH   | `/api/notifications/:id/read`   | Marquer comme lue              | Oui  |
| PATCH   | `/api/notifications/read-all`   | Tout marquer comme lu          | Oui  |
| DELETE  | `/api/notifications/:id`        | Supprimer une notification     | Oui  |

---

## 6. Interface utilisateur

### 6.1 Pages principales

#### Login / Register
- Formulaires de connexion et inscription
- Validation des champs
- Option de rejoindre un projet existant via code

#### Dashboard
- Vue d'ensemble des projets de l'utilisateur
- Accès rapide aux sprints actifs
- Navigation vers les différents modules

#### Board (Kanban)
- 4 colonnes : To Do, In Progress, In Review, Done
- Drag & drop pour changer le statut
- Filtrage par assignation
- Création rapide d'issues
- Barre de priorité colorée

#### Project Stats
- Graphiques de répartition (Recharts)
- Liste des membres et sprints
- Bouton de génération de rapport PDF

#### Notifications
- Liste chronologique
- Badge de compteur non lus
- Navigation contextuelle
- Actions (marquer lu, supprimer)

#### Profile
- Informations personnelles
- Modification nom/email/mot de passe
- Statistiques personnelles

### 6.2 Composants réutilisables
- **Header** : Navigation avec compteur de notifications
- **ProtectedRoute** : Vérification authentification
- **ProjectContext** : Gestion de l'état global (projet/sprint actifs)

### 6.3 Styles
- CSS modulaire par page
- Design responsive
- Palette de couleurs cohérente
- Animations et transitions fluides

---

## 7. Système de notifications

### 7.1 Types de notifications implémentés
- `issue_assigned` : Assignation d'une issue
- `issue_status_changed` : Changement de statut
- `project_member_joined` : Nouveau membre dans le projet

### 7.2 Architecture des notifications

**Backend :**
- Helper `notificationHelper.js` pour création uniforme
- `createNotification()` : notification simple
- `createNotifications()` : notifications multiples
- Vérification pour éviter auto-notification
- Inclusion du `relatedUserId` pour traçabilité

**Frontend :**
- Polling ou fetch manuel
- Affichage dans header (compteur badge)
- Page dédiée avec liste complète
- Formatage du temps relatif ("Il y a 5 min")

### 7.3 Correction du bug "undefined"

**Problème identifié :**
- Le token JWT ne contenait pas le nom de l'utilisateur
- `req.user.name` était undefined dans les controllers
- Les notifications affichaient "undefined a fait..."

**Solution implémentée :**
1. Ajout du `name` dans le payload JWT (register + login)
2. Modification du middleware `auth.js` pour récupérer le nom depuis la DB si absent (compatibilité anciens tokens)
3. Garantie que `req.user.name` est toujours disponible

---

## 8. Génération de rapports PDF

### 8.1 Librairies utilisées
- **jsPDF** : Génération de documents PDF
- **jspdf-autotable** : Création de tableaux formatés

### 8.2 Rapport de projet

**Localisation :** Page `ProjectStats.jsx`, bouton "📄 Générer rapport PDF"

**Contenu :**
- En-tête avec nom du projet
- Section métadonnées (description, dates, code projet)
- Statistiques générales (total issues, par statut, type, priorité)
- Table des membres du projet
- Table des sprints avec statut et dates
- Breakdown détaillé

**Nom de fichier :** `rapport-projet-[nom-slugifié].pdf`

### 8.3 Rapport de sprint

**Localisation :** Page `Board.jsx`, bouton "📄 Rapport PDF"

**Contenu :**
- En-tête avec nom du sprint (complet, pas l'ID)
- Section métadonnées (projet parent, dates, statut)
- Statistiques du sprint
- Breakdown par statut, type, priorité
- Table détaillée de toutes les issues du sprint

**Nom de fichier :** `rapport-sprint-[nom-slugifié].pdf`

### 8.4 Fonctions helpers

```javascript
// Slugification pour noms de fichiers
function slug(str) {
  return str.toLowerCase()
    .replace(/[àáâä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50);
}

// Formatage de dates
function fmtDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('fr-FR');
}

// Troncature de texte
function truncate(str, max = 60) {
  if (!str || str.length <= max) return str || '';
  return str.substring(0, max) + '...';
}
```

---

## 9. Sécurité et authentification

### 9.1 Hashage des mots de passe
- Utilisation de **bcryptjs** avec salt rounds (10)
- Stockage du hash uniquement (jamais le mot de passe en clair)
- Validation lors de la connexion avec `bcrypt.compare()`

### 9.2 JWT (JSON Web Tokens)
- Génération à l'inscription et connexion
- Validité : 7 jours
- Payload : `{ id, email, role, name }`
- Secret stocké dans variable d'environnement

### 9.3 Middleware d'authentification
- Vérification du header `Authorization: Bearer <token>`
- Validation et décodage du token
- Récupération automatique du nom si absent (fallback DB)
- Injection de `req.user` pour les routes protégées

### 9.4 Contrôle d'accès
- Vérification de propriété pour modification/suppression de projets
- Vérification de membership pour accès aux sprints/issues
- Règles métier (ex: seul le propriétaire peut verrouiller les inscriptions)

### 9.5 Variables d'environnement
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=********
DB_NAME=gprojet_db
JWT_SECRET=********
PORT=5000
```

**Bonnes pratiques :**
- Fichier `.env` dans `.gitignore`
- Fichier `.env.example` pour la documentation
- Rotation des secrets en production

---

## 10. Tests et qualité

### 10.1 Tests backend
**Framework :** Jest + Supertest

**Fichiers de tests :**
- `tests/auth.test.js` : Tests d'authentification
- `tests/issues.test.js` : Tests CRUD issues

**Couverture :**
- Inscription et validation des champs
- Connexion avec credentials valides/invalides
- Création/lecture/modification/suppression d'issues
- Gestion des erreurs et codes HTTP

**Exécution :**
```bash
cd backend
npm test
```

### 10.2 Validation des données
- Validation côté backend (controllers)
- Validation côté frontend (formulaires)
- Messages d'erreur explicites

### 10.3 Gestion des erreurs
- Try/catch dans tous les controllers
- Codes HTTP appropriés (200, 201, 400, 401, 403, 404, 500)
- Logs console pour debugging
- Messages d'erreur utilisateur-friendly

### 10.4 Code quality
- Structure modulaire (séparation concerns)
- Nommage cohérent et explicite
- Commentaires pour logique complexe
- Réutilisation de code (helpers, utils)

---

## 11. Guide d'installation

### 11.1 Prérequis
- Node.js v18+
- npm v9+
- PostgreSQL v14+
- Git

### 11.2 Installation étape par étape

#### 1. Cloner le repository
```bash
git clone https://github.com/AmineSaif/cdp-project-developpement.git
cd cdp-project-developpement
```

#### 2. Configuration PostgreSQL
```sql
-- Créer la base de données
CREATE DATABASE gprojet_db;

-- Créer un utilisateur (optionnel)
CREATE USER gprojet_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE gprojet_db TO gprojet_user;
```

#### 3. Configuration backend
```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos paramètres DB
```

**Fichier `.env` :**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=VotreMotDePasse
DB_NAME=gprojet_db
JWT_SECRET=VotreSecretJWT
PORT=5000
```

#### 4. Démarrage backend
```bash
npm run dev
# Serveur écoute sur http://localhost:5000
```

#### 5. Configuration frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# Éditer .env si nécessaire
```

**Fichier `.env` :**
```env
VITE_API_URL=http://localhost:5000/api
```

#### 6. Démarrage frontend
```bash
npm run dev
# Application accessible sur http://localhost:5173
```

### 11.3 Vérification
- Backend : `curl http://localhost:5000/api/auth/me` (devrait retourner 401)
- Frontend : ouvrir `http://localhost:5173` dans le navigateur

---

## 12. Guide d'utilisation

### 12.1 Première utilisation

#### Inscription
1. Accéder à la page Register
2. Renseigner nom, email, mot de passe
3. (Optionnel) Entrer un code projet pour rejoindre un projet existant
4. Cliquer "S'inscrire"
5. Connexion automatique après inscription

**Si pas de code projet :**
- Création automatique d'un client
- Création d'un projet initial avec code unique
- Création d'un sprint par défaut

#### Connexion
1. Accéder à la page Login
2. Entrer email et mot de passe
3. Cliquer "Se connecter"
4. Redirection vers le Dashboard

### 12.2 Gestion des projets

#### Créer un projet
1. Dashboard → "Nouveau projet"
2. Renseigner nom et description
3. Un code projet unique est généré automatiquement
4. Partager le code avec les membres de l'équipe

#### Inviter des membres
1. Partager le code projet
2. Les utilisateurs s'inscrivent avec ce code
3. Ils apparaissent dans la liste des membres

#### Verrouiller les inscriptions
1. Projet → Paramètres
2. Activer "Verrouiller les inscriptions"
3. Les nouvelles inscriptions via code sont bloquées

### 12.3 Gestion des sprints

#### Créer un sprint
1. Sélectionner un projet
2. "Nouveau sprint"
3. Renseigner nom, dates (optionnel), statut
4. Le sprint est créé et accessible dans le board

#### Modifier un sprint
1. Sélectionner le sprint
2. Cliquer sur "Modifier"
3. Changer nom, dates, statut
4. Sauvegarder

### 12.4 Gestion des issues

#### Créer une issue
1. Board → "Nouvelle issue"
2. Renseigner :
   - Titre (obligatoire)
   - Description
   - Type : bug, feature, task
   - Priorité : low, medium, high, critical
   - Assignation (membre du projet)
3. L'issue apparaît dans la colonne "To Do"

#### Changer le statut (Kanban)
1. Glisser-déposer l'issue vers une autre colonne
2. Le statut est mis à jour automatiquement

#### Modifier une issue
1. Cliquer sur une issue
2. Modifier les champs
3. Sauvegarder

### 12.5 Notifications

#### Consulter les notifications
1. Header → Icône cloche (badge si non lues)
2. Cliquer pour accéder à la page notifications
3. Lire les notifications
4. Cliquer sur une notification pour naviguer vers le contexte

#### Marquer comme lu
- Individuellement : clic sur la notification
- Toutes : bouton "Marquer toutes comme lues"

### 12.6 Statistiques et rapports

#### Consulter les statistiques
1. Sélectionner un projet
2. Onglet "Statistiques"
3. Visualiser les graphiques et métriques

#### Générer un rapport PDF
**Rapport projet :**
1. Page Statistiques → "📄 Générer rapport PDF"
2. Le PDF est téléchargé automatiquement

**Rapport sprint :**
1. Board (sprint sélectionné) → "📄 Rapport PDF"
2. Le PDF est téléchargé avec le nom du sprint

---

## 13. Difficultés rencontrées

### 13.1 Bug des notifications "undefined"

**Problème :**
Les notifications affichaient "undefined a fait..." au lieu du nom de l'utilisateur.

**Cause :**
Le token JWT ne contenait pas le champ `name`, seulement `id`, `email`, et `role`. Les controllers utilisaient `req.user.name` qui était undefined.

**Solution :**
1. Ajout du `name` dans le payload JWT (authController)
2. Modification du middleware auth pour fallback DB si nom absent
3. Garantie de compatibilité avec les anciens tokens

**Leçon :**
Toujours inclure dans le token JWT les informations fréquemment utilisées pour éviter des requêtes DB inutiles.

### 13.2 Placement des boutons PDF

**Problème :**
Confusion initiale sur l'emplacement des boutons de génération de rapports.

**Solution :**
- Bouton "Rapport projet" : page Statistiques du projet
- Bouton "Rapport sprint" : page Board du sprint concerné
- Logique métier claire : chaque rapport est accessible depuis son contexte

### 13.3 Nom du sprint dans le PDF

**Problème :**
Le rapport PDF du sprint affichait l'ID du sprint au lieu de son nom complet.

**Cause :**
Utilisation de `sprint.id` au lieu de `sprint.name` dans la génération du titre et du nom de fichier.

**Solution :**
Correction de l'extraction des données backend et utilisation systématique de `sprint.name`.

### 13.4 Relations Sequelize

**Problème :**
Complexité de la gestion des relations Many-to-Many et des associations multiples.

**Solution :**
- Documentation approfondie de Sequelize
- Utilisation d'alias (`as: 'relatedUser'`, `as: 'creator'`, etc.)
- Tests unitaires pour vérifier les relations

### 13.5 Gestion du state React

**Problème :**
Partage du contexte projet/sprint entre composants.

**Solution :**
Utilisation de React Context API (`ProjectContext`) pour centraliser l'état global et éviter le prop drilling.

---

## 14. Améliorations futures

### 14.1 Fonctionnalités

#### Court terme
- **Commentaires sur les issues** : discussion et collaboration
- **Attachments** : upload de fichiers sur les issues
- **Mentions** : notifier un utilisateur spécifique (@username)
- **Burndown chart** : graphique d'avancement du sprint en temps réel
- **Historique des modifications** : audit trail pour les issues

#### Moyen terme
- **Tableau de bord avancé** : métriques et KPIs
- **Templates d'issues** : modèles prédéfinis
- **Estimation** : story points, temps estimé
- **Planning poker** : estimation collaborative
- **Calendrier** : vue calendrier des sprints et deadlines

#### Long terme
- **Intégrations** : GitHub, GitLab, Slack, Jira
- **API publique** : webhook et REST API documentée
- **Mobile app** : application React Native
- **Notifications push** : WebSocket pour notifications en temps réel
- **Rôles et permissions** : RBAC avancé

### 14.2 Technique

#### Performance
- **Pagination** : liste paginée pour grandes quantités de données
- **Cache** : Redis pour sessions et données fréquentes
- **Indexation DB** : amélioration des requêtes
- **Lazy loading** : chargement différé des composants React

#### Sécurité
- **Rate limiting** : protection contre attaques DDoS
- **HTTPS** : chiffrement des communications
- **CORS** : configuration stricte
- **Sanitization** : protection XSS et injection SQL
- **2FA** : authentification à deux facteurs

#### DevOps
- **Docker** : conteneurisation complète
- **CI/CD** : GitHub Actions pour tests et déploiement automatique
- **Monitoring** : Sentry, LogRocket
- **Migrations** : Sequelize CLI pour gestion du schéma DB

#### Tests
- **Tests frontend** : React Testing Library, Cypress
- **Couverture** : objectif 80%+ de code coverage
- **Tests E2E** : Playwright pour parcours utilisateur complets

### 14.3 UX/UI
- **Dark mode** : thème sombre
- **Accessibilité** : WCAG 2.1 AA compliance
- **Internationalisation** : support multi-langues (i18n)
- **Responsive design** : optimisation mobile/tablette
- **Animations** : micro-interactions pour meilleure UX

---

## 15. Conclusion

### 15.1 Objectifs atteints

✅ **Application full-stack fonctionnelle** avec backend Node.js et frontend React  
✅ **Architecture RESTful** propre et maintenable  
✅ **Base de données relationnelle** PostgreSQL avec Sequelize ORM  
✅ **Authentification JWT** sécurisée  
✅ **Gestion complète** des projets, sprints, et issues  
✅ **Tableau Kanban** avec drag & drop  
✅ **Système de notifications** fonctionnel  
✅ **Génération de rapports PDF** détaillés  
✅ **Statistiques et visualisations** (graphiques)  
✅ **Tests unitaires** backend  
✅ **Documentation complète** (README + RAPPORT)  

### 15.2 Compétences acquises

**Techniques :**
- Développement full-stack (Node.js + React)
- Architecture API REST
- ORM et base de données relationnelle
- Authentification et sécurité web
- Gestion d'état React (Context API)
- Génération de documents PDF
- Tests unitaires et intégration

**Méthodologiques :**
- Méthodologie Agile/Scrum (appliquée au projet lui-même)
- Git et collaboration
- Debugging et résolution de problèmes
- Documentation technique

### 15.3 Bilan personnel

Ce projet a permis de mettre en pratique l'ensemble des concepts du développement web moderne. La résolution de problèmes concrets (bug "undefined", placement des boutons PDF, gestion des relations DB) a renforcé la compréhension des technologies utilisées.

L'aspect le plus enrichissant a été la conception d'une architecture cohérente et extensible, permettant d'ajouter facilement de nouvelles fonctionnalités.

### 15.4 Perspectives

GProjet pose des fondations solides pour une application de gestion de projets complète. Les améliorations futures identifiées (burndown chart, commentaires, intégrations) permettraient de rivaliser avec des solutions professionnelles.

Le projet est prêt pour un déploiement en production après ajout de fonctionnalités de sécurité renforcées (rate limiting, HTTPS, monitoring).

---

## Annexes

### A. Commandes utiles

**Backend :**
```bash
npm run dev          # Démarrer le serveur de développement
npm test             # Lancer les tests
npm run force-sync   # Resynchroniser les modèles Sequelize
```

**Frontend :**
```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
```

**Base de données :**
```bash
psql -U postgres -d gprojet_db  # Se connecter à la base
\dt                              # Lister les tables
\d users                         # Décrire la table users
```

### B. Ressources

**Documentation officielle :**
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Sequelize](https://sequelize.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [jsPDF](https://github.com/parallax/jsPDF)

**Outils utilisés :**
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) (tests API)
- [pgAdmin](https://www.pgadmin.org/) (gestion PostgreSQL)

### C. Contacts et support

**Repository GitHub :** https://github.com/AmineSaif/cdp-project-developpement  
**Auteur principal :** Amine Saif  
**Contributeurs :** Voir fichier `CONTRIBUTORS.md`  

---

**Fin du rapport**

*Document généré le 3 Décembre 2025*  
*Version 1.0*
