#!/usr/bin/env bash
set -e

# Install system dependencies
apt-get update && apt-get install -y libjpeg-dev zlib1g-dev nodejs npm

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Build React frontend with production API URL
cd frontend
npm install
VITE_API_URL="/api" npm run build
cd ..

# Django setup
python manage.py collectstatic --no-input --clear
python manage.py migrate