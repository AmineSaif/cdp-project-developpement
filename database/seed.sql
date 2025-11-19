-- seed.sql
-- Jeux de données minimal pour démarrer (utiliser SEULEMENT en dev)
-- ATTENTION: Les mots de passe doivent être déjà hashés (bcrypt). Hash pour 'password' ci-dessous.
-- Vous pouvez régénérer un hash avec: node -e "console.log(require('bcryptjs').hashSync('password',10))"

INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@example.com', '$2a$10$u1rZf9S8ZQzQJx8GQXKjIe3YB06oQFJmVQpYSMY8Qsv2vQWBiQ0hS', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO issues (title, description, type, priority, status, assignee_id, created_by_id)
VALUES
('Premier bug', 'Exemple de bug initial', 'bug', 'medium', 'todo', NULL, 1),
('Nouvelle fonctionnalité', 'Feature de démonstration', 'feature', 'low', 'inprogress', NULL, 1)
ON CONFLICT DO NOTHING;
