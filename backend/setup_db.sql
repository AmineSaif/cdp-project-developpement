-- Script SQL pour créer la base de données et l'utilisateur
-- Exécutez ce script en tant que superutilisateur PostgreSQL

-- Créer l'utilisateur s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'saas_user') THEN
        CREATE USER saas_user WITH PASSWORD 'saas_password';
    END IF;
END
$$;

-- Créer la base de données s'il n'existe pas
SELECT 'CREATE DATABASE saas_dev OWNER saas_user' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'saas_dev')\gexec

-- Donner les privilèges
GRANT ALL PRIVILEGES ON DATABASE saas_dev TO saas_user;

-- Se connecter à la nouvelle base de données
\c saas_dev;

-- Donner tous les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO saas_user;