#!/bin/bash

# Build and Push Docker Image Script for Angular UI + Proxy
# Usage: ./build-and-push.sh [version] [registry]
#
# Example:
#   ./build-and-push.sh v1.0.0-alpha.1
#   ./build-and-push.sh v1.0.0-alpha.1 my-registry.com:5000

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load configuration from .build-config if it exists
CONFIG_FILE=".build-config"
if [ -f "$CONFIG_FILE" ]; then
    # Source the config file
    source "$CONFIG_FILE"
    if [ -z "$DOCKER_REGISTRY" ]; then
        echo -e "${RED}Error: DOCKER_REGISTRY is not set in ${CONFIG_FILE}${NC}"
        echo "Please set DOCKER_REGISTRY in ${CONFIG_FILE} or copy from .build-config.example"
        exit 1
    fi
    DEFAULT_REGISTRY="$DOCKER_REGISTRY"
else
    echo -e "${RED}Error: ${CONFIG_FILE} not found${NC}"
    echo -e "${YELLOW}Please create ${CONFIG_FILE} file:${NC}"
    echo "  cp .build-config.example .build-config"
    echo "  # Edit .build-config and set your DOCKER_REGISTRY"
    exit 1
fi

# Default values
APP_NAME="mind-zone-ui"
DEFAULT_PLATFORM="linux/arm64"
ALL_PLATFORMS="linux/arm64,linux/amd64"

# Function to display usage
usage() {
    echo "Usage: $0 [version] [registry]"
    echo ""
    echo "Arguments:"
    echo "  version    Optional. Version tag (default: from package.json)"
    echo "  registry   Optional. Docker registry (default: ${DEFAULT_REGISTRY})"
    echo ""
    echo "Examples:"
    echo "  $0                                      # Uses version from package.json"
    echo "  $0 v1.0.0-alpha.1                       # Custom version tag"
    echo "  $0 v1.0.0-alpha.1 my-registry.com:5000  # Custom registry"
    echo ""
    echo "Note: Platform will be selected interactively before build confirmation."
    echo "      The proxy server listens on port 80 by default in the container."
    exit 1
}

# Function to select platform interactively
select_platform() {
    echo ""
    echo -e "${GREEN}Select target platform:${NC}"
    echo "  1) linux/arm64 (Apple Silicon, ARM64 servers) [default]"
    echo "  2) linux/amd64 (Intel/AMD servers)"
    echo "  3) all (multi-arch build: linux/arm64 + linux/amd64)"
    echo ""
    read -p "Enter choice [1-3] (default: 1): " platform_choice
    platform_choice=${platform_choice:-1}
    
    case $platform_choice in
        1)
            SELECTED_PLATFORM="linux/arm64"
            SELECTED_PLATFORM_DISPLAY="linux/arm64"
            ;;
        2)
            SELECTED_PLATFORM="linux/amd64"
            SELECTED_PLATFORM_DISPLAY="linux/amd64"
            ;;
        3)
            SELECTED_PLATFORM="${ALL_PLATFORMS}"
            SELECTED_PLATFORM_DISPLAY="all (${ALL_PLATFORMS})"
            ;;
        *)
            echo -e "${RED}Invalid choice. Using default: linux/arm64${NC}"
            SELECTED_PLATFORM="linux/arm64"
            SELECTED_PLATFORM_DISPLAY="linux/arm64"
            ;;
    esac
}

# Get version from argument or package.json
VERSION=${1:-$(node -p "require('./package.json').version")}
REGISTRY=${2:-$DEFAULT_REGISTRY}

# Construct image tag
IMAGE_TAG="${REGISTRY}/${APP_NAME}:${VERSION}"

# Select platform interactively
select_platform

# Display final configuration
echo ""
echo -e "${GREEN}=== Docker Build Configuration (mind-zone-ui) ===${NC}"
echo "App Name:     ${APP_NAME}"
echo "Version:      ${VERSION}"
echo "Registry:     ${REGISTRY}"
echo "Platform(s):  ${SELECTED_PLATFORM_DISPLAY}"
echo "Full Tag:     ${IMAGE_TAG}"
echo ""

# Confirm before proceeding
read -p "Proceed with build and push? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Build cancelled${NC}"
    exit 0
fi

echo -e "${GREEN}=== Starting Docker Build (Buildx) ===${NC}"

# Build and push using buildx for multi-platform support
docker buildx build \
    --platform ${SELECTED_PLATFORM} \
    --target ${APP_NAME} \
    -t ${IMAGE_TAG} \
    -t ${REGISTRY}/${APP_NAME}:latest \
    --push \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=== Build and Push Successful ===${NC}"
    echo "Image: ${IMAGE_TAG}"
    echo "Built for: ${SELECTED_PLATFORM_DISPLAY}"
    echo ""
    echo -e "${GREEN}To deploy locally or server-side, use:${NC}"
    echo "docker pull ${IMAGE_TAG}"
    echo "docker run -p 8080:80 -e INSTANCES=2 -e API_URL=http://your-api:3001 ${IMAGE_TAG}"
    echo ""
    echo "To access health check:"
    echo "curl http://localhost:8080/_health"
else
    echo -e "${RED}=== Build Failed ===${NC}"
    exit 1
fi
