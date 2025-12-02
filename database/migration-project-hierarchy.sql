-- migration-project-hierarchy.sql
-- Ajoute les nouvelles tables clients, projects, sprints et la colonne sprint_id sur issues

BEGIN;

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NULL,
  project_code VARCHAR(8) NOT NULL UNIQUE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  team_id INTEGER NULL REFERENCES teams(id) ON DELETE SET NULL,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(project_code);

CREATE TABLE IF NOT EXISTS sprints (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Sprint 1',
  description TEXT NULL,
  start_date TIMESTAMPTZ NULL,
  end_date TIMESTAMPTZ NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','active','completed','archived')),
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);

-- Ajouter sprint_id à issues si absent
ALTER TABLE issues ADD COLUMN IF NOT EXISTS sprint_id INTEGER NULL REFERENCES sprints(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_issues_sprint ON issues(sprint_id);

COMMIT;
