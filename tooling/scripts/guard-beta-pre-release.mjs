#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');

export function readBetaPreState(cwd = repoRoot) {
  const prePath = path.join(cwd, '.changeset/pre.json');

  try {
    return JSON.parse(readFileSync(prePath, 'utf8'));
  } catch (error) {
    throw new Error(
      `next must be in Changesets beta pre-release mode before publishing. Run pnpm changeset pre enter beta on next. (${error.message})`
    );
  }
}

export function validateBetaPreState(preState) {
  if (preState?.mode !== 'pre') {
    throw new Error(
      `next must be in active Changesets pre-release mode, found ${JSON.stringify(preState?.mode ?? null)}.`
    );
  }

  if (preState?.tag !== 'beta') {
    throw new Error(
      `next must use the beta pre-release tag, found ${JSON.stringify(preState?.tag ?? null)}.`
    );
  }
}

if (isMainModule()) {
  try {
    validateBetaPreState(readBetaPreState());
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exit(1);
  }
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return (
    !!entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)
  );
}
