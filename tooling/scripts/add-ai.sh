#!/bin/sh

# add editor-ai
# node ./packages/cli/dist/index.js add localhost:3000/rd/editor-ai -c ./templates/plate-template

./pre-registry.sh && npx shadcn@latest add localhost:3000/rd/editor-ai -o && ./post-registry.sh