-- ============================================
-- Script de création complète de la base de données GProjet
-- Base: saas_dev
-- Date: 3 Décembre 2025
-- ============================================

-- Créer la base de données (si elle n'existe pas)
-- CREATE DATABASE saas_dev;
-- \c saas_dev;

-- Supprimer les tables existantes (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Supprimer les types ENUM s'ils existent
DROP TYPE IF EXISTS enum_users_role CASCADE;
DROP TYPE IF EXISTS enum_issues_type CASCADE;
DROP TYPE IF EXISTS enum_issues_priority CASCADE;
DROP TYPE IF EXISTS enum_issues_status CASCADE;
DROP TYPE IF EXISTS enum_sprints_status CASCADE;
DROP TYPE IF EXISTS enum_notifications_type CASCADE;

-- ============================================
-- TABLE: teams (Équipes - Legacy)
-- ============================================
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Mon Équipe',
    "teamCode" VARCHAR(8) UNIQUE,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE teams IS 'Équipes collaboratives (legacy, remplacé par le système de projets)';
COMMENT ON COLUMN teams."teamCode" IS 'Code unique pour rejoindre l''équipe';

-- Index pour teams
CREATE UNIQUE INDEX teams_team_code_unique ON teams("teamCode") WHERE "teamCode" IS NOT NULL;

-- ============================================
-- TABLE: users (Utilisateurs)
-- ============================================
CREATE TYPE enum_users_role AS ENUM ('admin', 'developer', 'tester');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255),
    role enum_users_role NOT NULL DEFAULT 'developer',
    "teamId" INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Utilisateurs de l''application';
COMMENT ON COLUMN users.email IS 'Email unique pour la connexion';
COMMENT ON COLUMN users."passwordHash" IS 'Hash bcrypt du mot de passe';
COMMENT ON COLUMN users.role IS 'Rôle de l''utilisateur (admin, developer, tester)';
COMMENT ON COLUMN users."teamId" IS 'Équipe de l''utilisateur (legacy)';

-- Index pour users
CREATE UNIQUE INDEX users_email_unique ON users(email);
CREATE INDEX users_team_id ON users("teamId");

-- ============================================
-- TABLE: clients (Clients)
-- ============================================
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "ownerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE clients IS 'Clients pour lesquels les projets sont créés';
COMMENT ON COLUMN clients."ownerId" IS 'Utilisateur propriétaire du client';

-- Index pour clients
CREATE INDEX clients_owner_id ON clients("ownerId");

-- ============================================
-- TABLE: projects (Projets)
-- ============================================
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "projectCode" VARCHAR(8) NOT NULL UNIQUE,
    "joinLocked" BOOLEAN NOT NULL DEFAULT FALSE,
    "clientId" INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    "createdById" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE projects IS 'Projets Scrum';
COMMENT ON COLUMN projects."projectCode" IS 'Code unique pour rejoindre le projet (ex: PROJ-ABC1)';
COMMENT ON COLUMN projects."joinLocked" IS 'Si vrai, les nouvelles inscriptions via code sont désactivées';
COMMENT ON COLUMN projects."clientId" IS 'Client auquel appartient le projet';
COMMENT ON COLUMN projects."createdById" IS 'Utilisateur créateur du projet';

-- Index pour projects
CREATE UNIQUE INDEX projects_project_code_unique ON projects("projectCode");
CREATE INDEX projects_client_id ON projects("clientId");
CREATE INDEX projects_created_by_id ON projects("createdById");

-- ============================================
-- TABLE: sprints (Sprints)
-- ============================================
CREATE TYPE enum_sprints_status AS ENUM ('planned', 'active', 'completed', 'archived');

CREATE TABLE sprints (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Sprint 1',
    description TEXT,
    "startDate" DATE,
    "endDate" DATE,
    status enum_sprints_status NOT NULL DEFAULT 'planned',
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "createdById" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sprints IS 'Sprints des projets Scrum';
COMMENT ON COLUMN sprints.status IS 'Statut du sprint: planned, active, completed, archived';
COMMENT ON COLUMN sprints."projectId" IS 'Projet auquel appartient le sprint';
COMMENT ON COLUMN sprints."createdById" IS 'Utilisateur créateur du sprint';

-- Index pour sprints
CREATE INDEX sprints_project_id ON sprints("projectId");
CREATE INDEX sprints_created_by_id ON sprints("createdById");
CREATE INDEX sprints_status ON sprints(status);

-- ============================================
-- TABLE: issues (Tâches/Issues)
-- ============================================
CREATE TYPE enum_issues_type AS ENUM ('bug', 'feature', 'task');
CREATE TYPE enum_issues_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE enum_issues_status AS ENUM ('todo', 'inprogress', 'inreview', 'done');

CREATE TABLE issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type enum_issues_type NOT NULL DEFAULT 'task',
    priority enum_issues_priority NOT NULL DEFAULT 'low',
    status enum_issues_status NOT NULL DEFAULT 'todo',
    "assigneeId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "createdById" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "teamId" INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    "sprintId" INTEGER REFERENCES sprints(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE issues IS 'Tâches/Issues des sprints';
COMMENT ON COLUMN issues.type IS 'Type: bug, feature, task';
COMMENT ON COLUMN issues.priority IS 'Priorité: low, medium, high, critical';
COMMENT ON COLUMN issues.status IS 'Statut: todo, inprogress, inreview, done';
COMMENT ON COLUMN issues."assigneeId" IS 'Utilisateur assigné à la tâche';
COMMENT ON COLUMN issues."createdById" IS 'Utilisateur créateur de la tâche';
COMMENT ON COLUMN issues."teamId" IS 'Équipe (deprecated, utiliser sprintId)';
COMMENT ON COLUMN issues."sprintId" IS 'Sprint auquel appartient la tâche';

-- Index pour issues
CREATE INDEX issues_assignee_id ON issues("assigneeId");
CREATE INDEX issues_created_by_id ON issues("createdById");
CREATE INDEX issues_sprint_id ON issues("sprintId");
CREATE INDEX issues_status ON issues(status);
CREATE INDEX issues_type ON issues(type);
CREATE INDEX issues_priority ON issues(priority);

-- ============================================
-- TABLE: project_members (Membres des projets)
-- ============================================
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("projectId", "userId")
);

COMMENT ON TABLE project_members IS 'Table de jonction entre projets et utilisateurs (membres)';
COMMENT ON COLUMN project_members."projectId" IS 'Projet';
COMMENT ON COLUMN project_members."userId" IS 'Utilisateur membre';
COMMENT ON COLUMN project_members.role IS 'Rôle dans le projet (ex: member, admin)';

-- Index pour project_members
CREATE UNIQUE INDEX project_members_project_user_unique ON project_members("projectId", "userId");
CREATE INDEX project_members_project_id ON project_members("projectId");
CREATE INDEX project_members_user_id ON project_members("userId");

-- ============================================
-- TABLE: notifications (Notifications)
-- ============================================
CREATE TYPE enum_notifications_type AS ENUM (
    'issue_assigned',
    'issue_status_changed',
    'project_member_joined',
    'issue_created',
    'sprint_created',
    'other'
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    type enum_notifications_type NOT NULL DEFAULT 'other',
    message TEXT NOT NULL,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "relatedProjectId" INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    "relatedIssueId" INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    "relatedUserId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Notifications utilisateur';
COMMENT ON COLUMN notifications.type IS 'Type de notification (issue_assigned, issue_status_changed, etc.)';
COMMENT ON COLUMN notifications.message IS 'Message affiché à l''utilisateur';
COMMENT ON COLUMN notifications."userId" IS 'Utilisateur destinataire de la notification';
COMMENT ON COLUMN notifications."isRead" IS 'Notification lue ou non';
COMMENT ON COLUMN notifications."relatedProjectId" IS 'Projet lié à la notification (optionnel)';
COMMENT ON COLUMN notifications."relatedIssueId" IS 'Issue liée à la notification (optionnel)';
COMMENT ON COLUMN notifications."relatedUserId" IS 'Utilisateur acteur qui a déclenché la notification (optionnel)';

-- Index pour notifications
CREATE INDEX notifications_user_id ON notifications("userId");
CREATE INDEX notifications_is_read ON notifications("isRead");
CREATE INDEX notifications_created_at ON notifications("createdAt");
CREATE INDEX notifications_related_project_id ON notifications("relatedProjectId");
CREATE INDEX notifications_related_issue_id ON notifications("relatedIssueId");

-- ============================================
-- Contrainte de clé étrangère pour teams.createdById
-- (ajoutée après la création de users)
-- ============================================
ALTER TABLE teams 
ADD CONSTRAINT teams_created_by_id_fkey 
FOREIGN KEY ("createdById") REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- Données de test (optionnel)
-- ============================================

-- Créer un utilisateur admin
INSERT INTO users (name, email, "passwordHash", role) 
VALUES ('Admin', 'admin@gprojet.com', '$2a$10$examplehash', 'admin');

-- Message de succès
SELECT 'Base de données créée avec succès!' AS status;
SELECT 'Total tables créées: 8' AS info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
