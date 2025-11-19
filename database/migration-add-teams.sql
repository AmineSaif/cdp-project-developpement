-- migration-add-teams.sql
-- Script de migration pour ajouter les fonctionnalités d'équipe à une base existante
-- Exécuter ce script SI vous avez déjà une base avec users et issues

-- 1. Créer la table teams
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Mon Équipe',
  team_code VARCHAR(8) NOT NULL UNIQUE,
  created_by_id INTEGER NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ajouter la colonne teamId à la table users (si elle n'existe pas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE users ADD COLUMN team_id INTEGER NULL REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Ajouter la colonne teamId à la table issues (si elle n'existe pas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'issues' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE issues ADD COLUMN team_id INTEGER NULL REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Ajouter la contrainte FK pour created_by_id dans teams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_teams_created_by'
  ) THEN
    ALTER TABLE teams ADD CONSTRAINT fk_teams_created_by 
      FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_issues_team ON issues(team_id);
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(team_code);

-- Fin de la migration
-- Note: Les utilisateurs existants n'auront pas d'équipe (team_id = NULL)
-- Les issues existantes n'auront pas d'équipe (team_id = NULL)
