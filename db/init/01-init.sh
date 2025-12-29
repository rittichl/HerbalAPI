#!/bin/bash
set -e

# This script uses environment variables from .env file via docker-compose.yml
# Connection flow:
# 1. .env file contains: DB_NAME=herbal_db_new (or your database name)
# 2. docker-compose.yml maps DB_NAME to POSTGRES_DB: ${DB_NAME:-herbal_db}
# 3. PostgreSQL Docker image automatically creates database $POSTGRES_DB
# 4. This script grants privileges using $POSTGRES_DB (which contains the value from .env)
#
# The database name comes from your .env file (DB_NAME), not hardcoded!

# Use PostgreSQL environment variables (set by docker-entrypoint from docker-compose.yml)
# These are populated from .env: DB_NAME -> POSTGRES_DB, DB_USER -> POSTGRES_USER, etc.

# Execute SQL using psql
# Note: The database and user already exist (created by PostgreSQL Docker image)
# We're granting privileges using the database name from .env ($POSTGRES_DB)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Grant all privileges on the database to the user
    -- Database name ($POSTGRES_DB) comes from DB_NAME in .env file via docker-compose.yml
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

