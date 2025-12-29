#!/bin/bash
# Script to create the database manually when running npm run dev
# This connects to PostgreSQL and creates the database from .env file

# Load environment variables from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

DB_NAME=${DB_NAME:-herbal_db_new}
DB_USER=${DB_USER:-herbal}
DB_PASSWORD=${DB_PASSWORD:-herbal@1234}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "Creating database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# Try to create database using postgres superuser (most reliable)
# First, try with provided DB_USER password, then try with postgres user
echo "Attempting to create database..."

# Check if we're using Docker
if command -v docker-compose &> /dev/null; then
    if docker-compose ps db 2>/dev/null | grep -q "Up"; then
        echo "Detected Docker PostgreSQL container. Creating database via Docker..."
        docker-compose exec -T db psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "Database $DB_NAME created successfully!"
            docker-compose exec -T db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
            echo "Privileges granted to $DB_USER!"
            exit 0
        else
            # Check if database already exists
            docker-compose exec -T db psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME
            if [ $? -eq 0 ]; then
                echo "Database $DB_NAME already exists!"
                exit 0
            fi
        fi
    fi
fi

# If not Docker, try direct PostgreSQL connection
echo "Attempting direct PostgreSQL connection..."

# Try with postgres user (default)
PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Database $DB_NAME created successfully!"
    PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
    echo "Privileges granted!"
    exit 0
fi

# Try with provided DB_USER
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Database $DB_NAME created successfully!"
    exit 0
fi

# If all else fails, provide manual instructions
echo ""
echo "Could not create database automatically. Please create it manually:"
echo ""
echo "If using Docker:"
echo "  docker-compose exec db psql -U postgres -c \"CREATE DATABASE $DB_NAME;\""
echo "  docker-compose exec db psql -U postgres -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\""
echo ""
echo "If using local PostgreSQL:"
echo "  psql -U postgres -c \"CREATE DATABASE $DB_NAME;\""
echo "  psql -U postgres -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\""
exit 1

