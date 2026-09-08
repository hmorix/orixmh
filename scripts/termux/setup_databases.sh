#!/bin/bash
# ==============================================================================
# HMorix Platform — Termux Ubuntu (ARM64) Database Setup Script
# Installs & configures MongoDB and PostgreSQL in a non-systemd PRoot environment
# ==============================================================================

set -e

echo "=== HMorix Database Setup for Termux / PRoot Ubuntu (ARM64) ==="

# 1. Verify architecture
ARCH=$(uname -m)
if [ "$ARCH" != "aarch64" ] && [ "$ARCH" != "arm64" ]; then
    echo "Warning: Architecture is $ARCH, expected aarch64/arm64."
fi

# 2. Check root privileges
if [ "$(id -u)" -ne 0 ]; then
    echo "Error: This script must be run as root inside Ubuntu PRoot."
    exit 1
fi

echo "--> Updating package repository..."
apt-get update -y

# 3. Setup PostgreSQL
echo "--> Installing PostgreSQL..."
DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib

echo "--> Ensuring postgres user and data directories..."
mkdir -p /var/run/postgresql
chown -R postgres:postgres /var/run/postgresql

# Initialize cluster if not initialized
PG_VER=$(ls /usr/lib/postgresql/ 2>/dev/null | sort -V | tail -n1 || echo "")
if [ -n "$PG_VER" ]; then
    PG_BIN="/usr/lib/postgresql/$PG_VER/bin"
    PG_DATA="/var/lib/postgresql/$PG_VER/main"
    echo "Found PostgreSQL $PG_VER at $PG_BIN"
    
    # Start service via init.d (since systemctl doesn't exist in PRoot)
    if [ -x /etc/init.d/postgresql ]; then
        /etc/init.d/postgresql start || true
    fi

    echo "--> Configuring default hmorix database and user..."
    su - postgres -c "psql -c \"CREATE DATABASE hmorix;\" 2>/dev/null || true"
    su - postgres -c "psql -c \"CREATE USER hmorix WITH ENCRYPTED PASSWORD 'hmorix_local_dev';\" 2>/dev/null || true"
    su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE hmorix TO hmorix;\" 2>/dev/null || true"
fi

# 4. Setup MongoDB
echo "--> Setting up MongoDB directories..."
mkdir -p /data/db /var/log/mongodb
chmod 777 /data/db /var/log/mongodb

echo "--> Checking MongoDB availability..."
if command -v mongod >/dev/null 2>&1; then
    echo "MongoDB is already installed: $(mongod --version | head -n1)"
else
    echo "Attempting to install mongodb package..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y mongodb-org 2>/dev/null || \
    DEBIAN_FRONTEND=noninteractive apt-get install -y mongodb 2>/dev/null || \
    DEBIAN_FRONTEND=noninteractive apt-get install -y mongodb-server 2>/dev/null || {
        echo "Note: If apt mongodb package is unavailable on Ubuntu 26 ARM64, install via tarball or use MongoDB Atlas MONGODB_URI."
    }
fi

echo ""
echo "=== Database Setup Complete ==="
echo "PostgreSQL Connection: postgresql://hmorix:hmorix_local_dev@localhost:5432/hmorix"
echo "MongoDB Connection:    mongodb://127.0.0.1:27017/hmorix"
echo "To start services:     bash scripts/termux/start_databases.sh"
echo "To check status:       bash scripts/termux/status_databases.sh"
echo "To stop services:      bash scripts/termux/stop_databases.sh"
