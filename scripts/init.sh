#!/bin/sh

# init shadcn in new project
rimraf tmp
mkdir -p tmp/my-app
chmod -R 777 ${PWD}/tmp
node packages/cli/dist/index.js init -y -c ${PWD}/tmp -d --pm pnpm
