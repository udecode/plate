#!/bin/sh

# init shadcn in new project
rimraf tmp
mkdir -p tmp/my-app
chmod -R 777 ./tmp
npx shadcn@latest init -y -c ./tmp -d --pm pnpm
