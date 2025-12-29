#!/bin/bash

echo "=== Herbal Management Setup ==="

# 1. Create directories
mkdir -p ssl

# 2. Get SSL certificates from Docker volume (already exist)
echo "Copying SSL certificates..."
if [ -f "/var/lib/docker/volumes/certbot-certs/_data/live/herbal-management.duckdns.org/fullchain.pem" ]; then
    sudo cp /var/lib/docker/volumes/certbot-certs/_data/live/herbal-management.duckdns.org/fullchain.pem ssl/
    sudo cp /var/lib/docker/volumes/certbot-certs/_data/live/herbal-management.duckdns.org/privkey.pem ssl/
    sudo chown ec2-user:ec2-user ssl/*.pem
    echo "✅ Real SSL certificates copied"
else
    echo "⚠️  Using self-signed certificate"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/privkey.pem \
        -out ssl/fullchain.pem \
        -subj "/CN=herbal-management.duckdns.org" 2>/dev/null
fi

# 3. Set permissions
chmod 644 ssl/*.pem

# 4. Start services
echo "Starting services..."
docker-compose down 2>/dev/null
docker-compose up -d --build

# 5. Wait and test
sleep 5
echo "Testing..."
echo "HTTP (should redirect):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://herbal-management.duckdns.org
echo "HTTPS:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://herbal-management.duckdns.org

echo ""
echo "✅ Setup complete!"
echo "🌐 Your application is available at:"
echo "   HTTPS: https://herbal-management.duckdns.org"
echo "   HTTP will automatically redirect to HTTPS"
echo ""
echo "📊 Check status: docker-compose ps"
echo "📋 View logs: docker-compose logs -f app"