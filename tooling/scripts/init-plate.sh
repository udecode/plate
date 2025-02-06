#!/bin/sh

# init plate in new project
rimraf tmp
mkdir -p tmp/my-app
chmod -R 777 ./tmp
node ./packages/cli/dist/index.js init http://localhost:3000/r -c ./tmp --pm pnpm -d