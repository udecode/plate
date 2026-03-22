#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

import { globSync, isDynamicPattern } from 'tinyglobby';

import {
  TEST_IGNORE_PATTERNS,
  TEST_SLOW_FILE_PATTERNS,
} from '../config/test-suites.mjs';

const VALUE_FLAGS = new Set([
  '--bail',
  '--coverage-dir',
  '--coverage-reporter',
  '--max-concurrency',
  '--reporter',
  '--reporter-outfile',
  '--rerun-each',
  '--seed',
  '--test-name-pattern',
  '--timeout',
  '-t',
]);
const LEADING_DOT_SLASH_RE = /^\.\//;
const TRAILING_SLASH_RE = /\/$/;

const rawArgs = process.argv.slice(2);
const bunArgs = [];
const pathFilters = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];

  if (arg === '--') continue;

  const matchedValueFlag = [...VALUE_FLAGS].find(
    (flag) => arg === flag || arg.startsWith(`${flag}=`)
  );

  if (matchedValueFlag) {
    bunArgs.push(arg);

    if (arg === matchedValueFlag) {
      const nextArg = rawArgs[i + 1];

      if (nextArg) {
        bunArgs.push(nextArg);
        i += 1;
      }
    }

    continue;
  }

  if (arg.startsWith('-')) {
    bunArgs.push(arg);
    continue;
  }

  pathFilters.push(arg);
}

const allSlowFiles = globSync(TEST_SLOW_FILE_PATTERNS, {
  cwd: process.cwd(),
  ignore: TEST_IGNORE_PATTERNS,
  onlyFiles: true,
}).sort();

const normalizeFilter = (value) =>
  value
    .replaceAll('\\', '/')
    .replace(LEADING_DOT_SLASH_RE, '')
    .replace(TRAILING_SLASH_RE, '');

const staticFilters = [];
const dynamicMatches = new Set();

for (const filter of pathFilters.map(normalizeFilter)) {
  if (isDynamicPattern(filter)) {
    for (const match of globSync(filter, {
      cwd: process.cwd(),
      ignore: TEST_IGNORE_PATTERNS,
      onlyFiles: true,
    })) {
      dynamicMatches.add(match);
    }

    continue;
  }

  staticFilters.push(filter);
}

const selectedFiles =
  pathFilters.length === 0
    ? allSlowFiles
    : allSlowFiles.filter((file) => {
        if (dynamicMatches.has(file)) return true;

        return staticFilters.some(
          (filter) =>
            file === filter ||
            file.startsWith(`${filter}/`) ||
            file.includes(filter)
        );
      });

if (selectedFiles.length === 0) {
  console.error('No slow tests matched.');
  process.exit(1);
}

const explicitPaths = selectedFiles.map((file) =>
  file.startsWith('/') || file.startsWith('./') ? file : `./${file}`
);

const run = spawnSync(
  process.execPath,
  ['test', ...bunArgs, ...explicitPaths],
  {
    stdio: 'inherit',
  }
);

process.exit(run.status ?? 1);
