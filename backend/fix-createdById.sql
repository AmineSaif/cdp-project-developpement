-- Permettre NULL pour createdById dans teams
ALTER TABLE teams ALTER COLUMN "createdById" DROP NOT NULL;
