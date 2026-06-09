#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-$HOME/green-web/frontend}"
WEB_DIR="${WEB_DIR:-/var/www/carbongo-frontend/dist}"

cd "$APP_DIR"

echo "Reset local changes..."
git fetch origin main
git reset --hard origin/main
git clean -fd

echo "Install dependencies..."
npm install

echo "Build frontend..."
rm -rf dist
npm run build

echo "Copy build to Nginx frontend folder..."
sudo mkdir -p "$WEB_DIR"
sudo rm -rf "$WEB_DIR"/*
sudo cp -r dist/* "$WEB_DIR"/

echo "Set permission..."
sudo chown -R www-data:www-data /var/www/carbongo-frontend

echo "Reload Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "Deploy frontend selesai."
echo "Open: https://carbongo.site?v=$(date +%s)"