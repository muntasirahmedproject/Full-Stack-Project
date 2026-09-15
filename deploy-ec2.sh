#!/bin/bash

# TripPlanner EC2 Automated Deployment Script
# Usage: ./deploy-ec2.sh <YOUR_EC2_PUBLIC_IP_OR_DOMAIN>

set -e

PUBLIC_HOST=$1

if [ -z "$PUBLIC_HOST" ]; then
  echo "Usage: ./deploy-ec2.sh <YOUR_EC2_PUBLIC_IP_OR_DOMAIN>"
  echo "Example: ./deploy-ec2.sh 54.210.12.34"
  exit 1
fi

echo "========================================="
echo " Deploying TripPlanner to AWS EC2 Host: $PUBLIC_HOST"
echo "========================================="

# Create .env if it does not exist
if [ ! -f .env ]; then
  cat <<EOT > .env
POSTGRES_USER=trip_user
POSTGRES_PASSWORD=tripplanner_secure_db_pass_2026
POSTGRES_DB=trip_planner
DATABASE_URL=postgresql://trip_user:tripplanner_secure_db_pass_2026@db:5432/trip_planner
JWT_SECRET=tripplanner_jwt_secret_key_2026
PORT=3000
FRONTEND_URL=*
REACT_APP_API_URL=http://${PUBLIC_HOST}:3001
EOT
  echo ".env created successfully!"
else
  echo "Existing .env file found, building with existing settings..."
fi

# Export REACT_APP_API_URL for docker compose build
export REACT_APP_API_URL="http://${PUBLIC_HOST}:3001"

echo "Building and starting Docker containers..."
docker compose down || true
docker compose up -d --build

echo "Waiting for PostgreSQL database to initialize..."
sleep 12

echo "Applying Prisma database migrations..."
docker compose exec -T backend npx prisma migrate deploy

echo "========================================="
echo " Deployment Complete!"
echo " Access Frontend: http://${PUBLIC_HOST}:8080"
echo " Access Backend API: http://${PUBLIC_HOST}:3001"
echo "========================================="
