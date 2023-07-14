#!/bin/bash

set -e # bail on errors

OWNER=udecode
GLOB=$1
IS_CI="${CI:-false}"
BASE=$(pwd)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)

for folder in $GLOB; do
  [ -d "$folder" ] || continue
  cd $BASE

  if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "♻️"
    git push origin main
  fi

  NAME=${folder##*/}
  if [ -z "$API_TOKEN_GITHUB" ]; then
    REPO="git@github.com:${OWNER}/${NAME}.git"
  else
    REPO="git@github.com:${API_TOKEN_GITHUB}/${OWNER}/${NAME}.git"
  fi
  CLONE_DIR="__${NAME}__clone__"
  
  # sync to read-only clones
  # clone, delete files in the clone, and copy (new) files over
  # this handles file deletions, additions, and changes seamlessly
  # note: redirect output to dev/null to avoid any possibility of leaking token
  git clone --quiet --depth 1 $REPO $CLONE_DIR > /dev/null
  cd $CLONE_DIR
  find . | grep -v ".git" | grep -v "^\.*$" | xargs rm -rf # delete all files (to handle deletions in monorepo)
  cp -r $BASE/$folder/. .

  if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "$COMMIT_MESSAGE"
    git push origin main
  fi

  cd $BASE
  rm -rf $CLONE_DIR
done