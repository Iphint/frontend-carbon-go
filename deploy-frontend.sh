cd ~/green-web/frontend

echo "Pull latest frontend..."
git pull origin main

echo "Install dependencies..."
npm install

echo "Build frontend..."
rm -rf dist
npm run build

echo "Copy build to Nginx frontend folder..."
sudo mkdir -p /var/www/carbongo-frontend/dist
sudo rm -rf /var/www/carbongo-frontend/dist/*
sudo cp -r dist/* /var/www/carbongo-frontend/dist/

echo "Set permission..."
sudo chown -R www-data:www-data /var/www/carbongo-frontend

echo "Reload Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "Deploy frontend selesai."
echo "Open: https://carbongo.site?v=$(date +%s)"