#!/usr/bin/env bash
set -euo pipefail

# Starts the backend Docker image after ensuring Prisma migrations are applied.
# Usage: ./apps/backend/scripts/start-backend-docker.sh [path-to-env-file]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/apps/backend/.env}"
IMAGE_NAME="bvmw-backend"
CONTAINER_NAME="bvmw-backend"
DOCKERFILE_PATH="$ROOT_DIR/apps/backend/Dockerfile"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

pushd "$ROOT_DIR" >/dev/null

# Build the image from the monorepo root so pnpm workspaces resolve correctly.
echo "Building Docker image '$IMAGE_NAME'..."
docker build -f "$DOCKERFILE_PATH" -t "$IMAGE_NAME" .

# Load environment variables for Prisma commands.
echo "Loading environment from $ENV_FILE for migrations..."
set -a
source "$ENV_FILE"
set +a

# Apply migrations and verify their status before starting the container.
echo "Applying Prisma migrations..."
pnpm --filter backend... prisma migrate deploy

echo "Checking Prisma migration status..."
pnpm --filter backend... prisma migrate status

# Restart the container with the latest image.
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Removing existing container '${CONTAINER_NAME}'..."
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

echo "Starting container '${CONTAINER_NAME}' on port 3000..."
docker run --env-file "$ENV_FILE" -d --name "$CONTAINER_NAME" -p 3000:3000 "$IMAGE_NAME"

echo "Container is running. Tail logs with: docker logs -f $CONTAINER_NAME"

popd >/dev/null
