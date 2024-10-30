#!/bin/bash

set -e

mkdir -p logs
mkdir -p api-docs

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update the .env file with your actual configuration values."
fi

if [ ! -f api-docs/openapi.json ]; then
    echo "Creating api-docs directory..."
    mkdir -p api-docs

    if [ -f openapi.json ]; then
        echo "Copying OpenAPI specification from root directory..."
        cp openapi.json api-docs/openapi.json
    else
        echo "Error: openapi.json not found in root directory!"
        echo "Please ensure your OpenAPI specification is available as openapi.json"
        exit 1
    fi
fi

chmod 644 api-docs/openapi.json

docker-compose down


docker-compose pull

echo "Starting Docker containers..."
docker-compose up -d --build

echo "Waiting for services to start..."
sleep 5

if docker-compose ps | grep -q "swagger-ui"; then
    echo "Swagger UI is running"
else
    echo "Error: Swagger UI failed to start"
    docker-compose logs swagger-ui
    exit 1
fi

if docker-compose ps | grep -q "email-api"; then
    echo "API is running"
else
    echo "Error: API failed to start"
    docker-compose logs api
    exit 1
fi

echo "
Setup complete!
API is running on http://localhost:3001
Swagger UI is available at http://localhost:8080

To view logs:
docker-compose logs -f

To stop the services:
docker-compose down
"
