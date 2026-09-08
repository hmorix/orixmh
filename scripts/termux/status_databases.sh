#!/bin/bash
# ==============================================================================
# HMorix Platform — Termux Ubuntu Service Status (Non-systemd)
# ==============================================================================

echo "=== HMorix Database Status ==="

# Check PostgreSQL on port 5432
if timeout 1 bash -c "</dev/tcp/127.0.0.1/5432" 2>/dev/null; then
    echo "  [ONLINE] PostgreSQL is active on port 5432"
elif pgrep -x "postgres" >/dev/null; then
    echo "  [STARTING] PostgreSQL process detected, initializing socket..."
else
    echo "  [OFFLINE] PostgreSQL is not running"
fi

# Check MongoDB on port 27017
if timeout 1 bash -c "</dev/tcp/127.0.0.1/27017" 2>/dev/null; then
    echo "  [ONLINE] MongoDB is active on port 27017"
elif pgrep -x "mongod" >/dev/null; then
    echo "  [STARTING] MongoDB process detected, initializing socket..."
else
    echo "  [OFFLINE] MongoDB is not running"
fi

echo ""
echo "Processes:"
ps aux | grep -E "mongod|postgres" | grep -v grep || echo "  No database processes active."
