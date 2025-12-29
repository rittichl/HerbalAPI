# Creating Database for Local Development

When running `npm run dev`, you need to create the database manually if it doesn't exist.

## Option 1: Using Docker (if database is in Docker)

If your database is running in Docker, connect to it and create the database:

```bash
# Connect to PostgreSQL container
docker-compose exec db psql -U postgres -c "CREATE DATABASE herbal_db_new;"

# Or if using the 'herbal' user
docker-compose exec db psql -U herbal -d postgres -c "CREATE DATABASE herbal_db_new;"

# Grant privileges
docker-compose exec db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE herbal_db_new TO herbal;"
```

## Option 2: Using Local PostgreSQL

If PostgreSQL is running locally:

```bash
# Connect as postgres superuser
psql -U postgres -c "CREATE DATABASE herbal_db_new;"

# Or connect interactively
psql -U postgres
CREATE DATABASE herbal_db_new;
GRANT ALL PRIVILEGES ON DATABASE herbal_db_new TO herbal;
\q
```

## Option 3: Using the Script

Run the provided script (make sure .env file exists with DB_NAME, DB_USER, etc.):

```bash
./db/init/create-database.sh
```

## Note

The database name comes from your `.env` file (`DB_NAME=herbal_db_new`). Make sure this matches what's in your `.env` file.

