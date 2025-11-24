#!/bin/bash

set -e # bail on errors

# Parse parameters
USE_LOCAL=false
MODE="${1:-basic}"

# Check for --local flag
if [[ "$1" == "--local" ]]; then
  USE_LOCAL=true
  MODE="${2:-basic}"
elif [[ "$2" == "--local" ]]; then
  USE_LOCAL=true
fi

# Determine registry prefix
if [[ "$USE_LOCAL" == true ]]; then
  REGISTRY_PREFIX="http://localhost:3000/rd"
else
  REGISTRY_PREFIX="@plate"
fi

# Map mode to template and registry
case "$MODE" in
  basic)
    TEMPLATE_NAME="plate-template"
    REGISTRY_NAME="$REGISTRY_PREFIX/editor-basic"
    ;;
  ai)
    TEMPLATE_NAME="plate-playground-template"
    REGISTRY_NAME="$REGISTRY_PREFIX/editor-ai"
    ;;
  *)
    echo "❌ Error: Mode must be 'basic' or 'ai'"
    echo "Usage: $0 [--local] <mode>"
    echo "  basic - Updates plate-template with @plate/editor-basic"
    echo "  ai    - Updates plate-playground-template with @plate/editor-ai"
    echo ""
    echo "Options:"
    echo "  --local - Use local registry (http://localhost:3000/rd/...)"
    exit 1
    ;;
esac

BASE=$(pwd)
TEMPLATE_DIR="$BASE/templates/$TEMPLATE_NAME"

echo "📦 Updating $TEMPLATE_NAME packages..."
cd "$TEMPLATE_DIR"

# Update all packages to latest versions
echo "Running bun update --latest..."
bun update --latest

# Add registry component via shadcn
echo "Adding $REGISTRY_NAME via shadcn..."
npx shadcn@latest add "$REGISTRY_NAME" -o

# Run lint:fix
echo "Running bun lint:fix..."
bun lint:fix

# Run typecheck
echo "Running bun typecheck..."
bun typecheck

echo "✅ Done! Packages updated, $REGISTRY_NAME added, linted, and typechecked in $TEMPLATE_NAME."
cd "$BASE"
