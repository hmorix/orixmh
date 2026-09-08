#!/bin/bash
# ==============================================================================
# HMorix Platform — Termux Ubuntu Service Starter (Non-systemd)
# ==============================================================================

echo "=== Starting HMorix Local Databases ==="

# 1. Start PostgreSQL
if [ -x /etc/init.d/postgresql ]; then
    echo "Starting PostgreSQL via init.d..."
    /etc/init.d/postgresql start || true
elif command -v pg_ctl >/dev/null 2>&1; then
    PG_VER=$(ls /usr/lib/postgresql/ 2>/dev/null | sort -V | tail -n1 || echo "")
    if [ -n "$PG_VER" ]; then
        su - postgres -c "/usr/lib/postgresql/$PG_VER/bin/pg_ctl -D /var/lib/postgresql/$PG_VER/main -l /var/lib/postgresql/logfile start" || true
    fi
else
    echo "PostgreSQL init script not found. Run bash scripts/termux/setup_databases.sh first."
fi

# 2. Start MongoDB
if command -v mongod >/dev/null 2>&1; then
    mkdir -p /data/db /var/log/mongodb
    CONFIG_FILE="$(dirname "$0")/mongod.conf"
    if [ -f "$CONFIG_FILE" ]; then
        echo "Starting MongoDB with memory-optimized config..."
        mongod --config "$CONFIG_FILE" --fork || mongod --dbpath /data/db --wiredTigerCacheSizeGB 0.5 --fork --logpath /var/log/mongodb/mongod.log || true
    else
        mongod --dbpath /data/db --wiredTigerCacheSizeGB 0.5 --fork --logpath /var/log/mongodb/mongod.log || true
    fi
else
    echo "MongoDB binary 'mongod' not found. If using cloud, connect via MONGODB_URI."
fi

echo ""
bash "$(dirname "$0")/status_databases.sh"
