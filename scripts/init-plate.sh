#!/bin/sh

# init plate in new project
rimraf tmp
mkdir -p tmp/my-app
chmod -R 777 ./tmp
node ./packages/cli/dist/index.js init -c ./tmp -u http://localhost:3000/r --pm pnpm -d