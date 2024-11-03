#!/bin/sh

# init plate in new project
rimraf tmp
mkdir -p tmp/my-app
chmod -R 777 ${PWD}/tmp
node ${PROJECT_CWD}/packages/cli/dist/index.js init -c ${PWD}/tmp -u http://localhost:3000/r --pm pnpm -d