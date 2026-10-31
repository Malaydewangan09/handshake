#!/usr/bin/env bash
# Writes switch/.env with fresh secrets. Refuses to overwrite an existing one.
set -euo pipefail
cd "$(dirname "$0")"
[ -e .env ] && { echo ".env exists, delete it to regenerate" >&2; exit 1; }
r() { openssl rand -hex 24; }
cat > .env <<ENV
SWITCH_VERSION=0.31.0
API_HOST_PORT=8000
GATEWAY_HOST_PORT=3300
DB_NAME=switch
DB_USER=switch_app
DB_PASSWORD=$(r)
DB_OWNER_USER=postgres
DB_OWNER_PASSWORD=$(r)
AGENT_REGISTRATION_TOKEN=$(r)
SECRET_KEYS=local:$(openssl rand -hex 32)
CONTROLLER_TOKEN_SECRET=$(openssl rand -hex 32)
GATEWAY_ADMIN_EMAIL=admin@handshake.local
GATEWAY_ADMIN_PASSWORD=$(r)
MATTERMOST_HOST_PORT=8065
MATTERMOST_ADMIN_USER=admin
MATTERMOST_ADMIN_PASSWORD=Mm-$(r)
MATTERMOST_TEAM_NAME=handshake
MATTERMOST_USER=demo
MATTERMOST_USER_PASSWORD=Mm-$(r)
ENV
chmod 600 .env
echo "Wrote switch/.env. Admin login: admin@handshake.local / $(grep ^GATEWAY_ADMIN_PASSWORD= .env | cut -d= -f2)"
