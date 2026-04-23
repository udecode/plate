#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

import { globSync, isDynamicPattern } from 'tinyglobby';

import {
  TEST_DEFERRED_FILE_PATTERNS,
  TEST_IGNORE_PATTERNS,
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
const EXPECTED_RED_RE = /\(fail\)|\b\d+\s+fail\b/i;
const DEFERRED_IGNORE_PATTERNS = TEST_IGNORE_PATTERNS.filter(
  (pattern) => pattern !== '**/__deferred__/**'
);

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

const normalizeFilter = (value) =>
  value
    .replaceAll('\\', '/')
    .replace(LEADING_DOT_SLASH_RE, '')
    .replace(TRAILING_SLASH_RE, '');

const allDeferredFiles = globSync(TEST_DEFERRED_FILE_PATTERNS, {
  cwd: process.cwd(),
  ignore: DEFERRED_IGNORE_PATTERNS,
  onlyFiles: true,
}).sort();

const staticFilters = [];
const dynamicMatches = new Set();

for (const filter of pathFilters.map(normalizeFilter)) {
  if (isDynamicPattern(filter)) {
    for (const match of globSync(filter, {
      cwd: process.cwd(),
      ignore: DEFERRED_IGNORE_PATTERNS,
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
    ? allDeferredFiles
    : allDeferredFiles.filter((file) => {
        if (dynamicMatches.has(file)) return true;

        return staticFilters.some(
          (filter) =>
            file === filter ||
            file.startsWith(`${filter}/`) ||
            file.includes(filter)
        );
      });

if (selectedFiles.length === 0) {
  console.error('No deferred tests matched.');
  process.exit(1);
}

const explicitPaths = selectedFiles.map((file) =>
  file.startsWith('/') || file.startsWith('./') ? file : `./${file}`
);

const result = spawnSync(
  process.execPath,
  ['test', ...bunArgs, ...explicitPaths],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  }
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.status === 0) {
  console.error(
    'Deferred suite unexpectedly passed. Promote the specs out of __deferred__ or remove them.'
  );
  process.exit(1);
}

const combinedOutput = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

if (!EXPECTED_RED_RE.test(combinedOutput)) {
  process.exit(result.status ?? 1);
}

console.log('\nDeferred suite is red as expected.');
