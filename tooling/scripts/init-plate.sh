#!/bin/sh

# init plate in new project
rimraf tmp
mkdir -p tmp/my-app
chmod -R 777 ./tmp
npx shadcn@latest init http://localhost:3000/r -c ./tmp --pm pnpm -d