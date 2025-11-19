-- schema.sql
-- Schéma manuel équivalent aux modèles Sequelize (users, issues, teams)
-- Si vous utilisez Sequelize avec sync(), ce fichier est uniquement informatif.

-- Table teams (doit être créée avant users à cause de la FK)
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Mon Équipe',
  team_code VARCHAR(8) NOT NULL UNIQUE,
  created_by_id INTEGER NULL, -- Sera mis à jour après création du premier user
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'developer' CHECK (role IN ('admin','developer','tester')),
  team_id INTEGER NULL REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter la contrainte FK pour created_by_id maintenant que users existe
ALTER TABLE teams ADD CONSTRAINT fk_teams_created_by 
  FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NULL,
  type TEXT NOT NULL DEFAULT 'task' CHECK (type IN ('bug','feature','task')),
  priority TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','inprogress','inreview','done')),
  assignee_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(type);
CREATE INDEX IF NOT EXISTS idx_issues_team ON issues(team_id);
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(team_code);
