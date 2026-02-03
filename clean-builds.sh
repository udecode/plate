#!/bin/bash

# Delete .turbo, .next, and dist directories from root, apps/www, and packages/docx-io

echo "Deleting build directories..."

# Root directories
[ -d ".turbo" ] && echo "Removing root/.turbo" && rm -rf .turbo
[ -d ".next" ] && echo "Removing root/.next" && rm -rf .next
[ -d "dist" ] && echo "Removing root/dist" && rm -rf dist

# apps/www directories
[ -d "apps/www/.turbo" ] && echo "Removing apps/www/.turbo" && rm -rf apps/www/.turbo
[ -d "apps/www/.next" ] && echo "Removing apps/www/.next" && rm -rf apps/www/.next
[ -d "apps/www/dist" ] && echo "Removing apps/www/dist" && rm -rf apps/www/dist

# packages/docx-io directories
[ -d "packages/docx-io/.turbo" ] && echo "Removing packages/docx-io/.turbo" && rm -rf packages/docx-io/.turbo
[ -d "packages/docx-io/.next" ] && echo "Removing packages/docx-io/.next" && rm -rf packages/docx-io/.next
[ -d "packages/docx-io/dist" ] && echo "Removing packages/docx-io/dist" && rm -rf packages/docx-io/dist

echo "Done!"
