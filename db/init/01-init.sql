-- NOTE: This file has been replaced by 01-init.sh which uses environment variables from .env
-- The shell script version (01-init.sh) handles user creation and privilege assignment
-- using DB_NAME, DB_USER, and DB_PASSWORD from the .env file

-- Legacy code (commented out - use 01-init.sh instead):
-- CREATE USER herbal WITH PASSWORD 'herbal@1234';
-- CREATE DATABASE herbal_db;
-- GRANT ALL PRIVILEGES ON DATABASE herbal_db TO herbal;

-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'herbal') THEN
--     CREATE USER herbal WITH PASSWORD 'herbal@1234';
--   END IF;
-- END $$;
-- GRANT ALL PRIVILEGES ON DATABASE herbal_db TO herbal;