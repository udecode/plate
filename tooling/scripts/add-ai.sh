#!/bin/sh

# add editor-ai
./pre-registry.sh && npx shadcn@latest add http://localhost:3000/rd/editor-ai -o && ./post-registry.sh