#!/bin/sh

# Change to the initial working directory
cd "$INIT_CWD" || { echo "Failed to change directory to $INIT_CWD"; exit 1; }

# Run barrelsby on the src directory
barrelsby -d "$INIT_CWD/src" -D -l all -q -e '.*__tests__.*|(.*(fixture|template|spec|internal|react).*)'

# Check if the src/react directory exists and run barrelsby if it does
if [ -d "$INIT_CWD/src/react" ]; then
  barrelsby -d "$INIT_CWD/src/react" -l all -q  -e '.*__tests__.*|(.*(fixture|template|spec|internal).*)'
fi