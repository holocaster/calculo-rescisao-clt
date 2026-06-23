#!/usr/bin/env bash
set -euo pipefail

# Diretorio do repositorio (ajuste se necessario)
REPO_DIR="${REPO_DIR:-/opt/calculo-rescisao-app/calculo-rescisao-clt}"
cd "$REPO_DIR"

ehco "Executando git pull"

git checkout -- .
git pull

echo "Executando npm ci"
npm ci

echo "Executando npm run build"
rm -rf dist/
npm run build

APP_ROOT="/var/www/calculo-rescisao-clt"
INCOMING_DIR="$APP_ROOT/incoming"
RELEASES_DIR="$APP_ROOT/releases"
CURRENT_LINK="$APP_ROOT/current"

mkdir -p "$INCOMING_DIR" "$RELEASES_DIR"
find "$INCOMING_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

if [ -L /etc/nginx/sites-enabled/default ]; then
  rm -f /etc/nginx/sites-enabled/default
fi

DEPLOY_ID="${DEPLOYMENT_ID:-manual-$(date +%Y%m%d%H%M%S)}"
RELEASE_DIR="$RELEASES_DIR/$DEPLOY_ID"

cp -a dist/. "$INCOMING_DIR"/

if [ ! -f "$INCOMING_DIR/index.html" ]; then
  echo "Build esperado em $INCOMING_DIR/index.html mas o arquivo nao foi encontrado."
  exit 1
fi

mkdir -p "$RELEASE_DIR"
cp -a "$INCOMING_DIR"/. "$RELEASE_DIR"/

sudo nginx -t

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

sudo systemctl reload nginx

echo "Deploy concluido: $RELEASE_DIR -> $CURRENT_LINK"
