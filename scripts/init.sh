#!/bin/sh

# init shadcn in new project
rimraf tmp
mkdir -p tmp/my-app
chmod -R 777 ./tmp
node ./packages/cli/dist/index.js init -y -c ./tmp -d --pm pnpm
