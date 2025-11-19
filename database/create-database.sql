-- NOTE: Ce script naïf échouera si la base ou l'utilisateur existent déjà.
-- Vous pouvez ignorer les erreurs "already exists".

CREATE DATABASE saas_dev;
CREATE USER saas_user WITH PASSWORD 'saas_password';
ALTER DATABASE saas_dev OWNER TO saas_user;
GRANT ALL PRIVILEGES ON DATABASE saas_dev TO saas_user;

-- Pour vérifier ensuite :
-- \l saas_dev
-- \du saas_user
