#!/bin/bash
# ==============================================================================
# HMorix Platform — Termux Ubuntu Service Stopper (Non-systemd)
# ==============================================================================

echo "=== Stopping HMorix Local Databases ==="

# 1. Stop MongoDB
if pgrep -x "mongod" >/dev/null; then
    echo "Stopping MongoDB daemon..."
    pkill -x "mongod" || mongod --shutdown || true
    echo "MongoDB stopped."
else
    echo "MongoDB is not running."
fi

# 2. Stop PostgreSQL
if [ -x /etc/init.d/postgresql ]; then
    echo "Stopping PostgreSQL via init.d..."
    /etc/init.d/postgresql stop || true
    echo "PostgreSQL stopped."
elif pgrep -x "postgres" >/dev/null; then
    echo "Stopping PostgreSQL processes..."
    pkill -x "postgres" || true
else
    echo "PostgreSQL is not running."
fi

echo "All local database services stopped."
