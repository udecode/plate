#!/usr/bin/env node

import { mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import {
  FAST_TEST_SLOW_CASE_THRESHOLD_MS,
  FAST_TEST_SLOW_FILE_THRESHOLD_MS,
} from '../config/test-suites.mjs';

const rawArgs = process.argv.slice(2);
const bunArgs = [];
let limit = 50;
let runAll = false;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];

  if (arg === '--') {
    continue;
  }

  if (arg === '--all') {
    runAll = true;
    continue;
  }

  if (arg === '--top') {
    const value = Number(rawArgs[i + 1]);

    if (!Number.isFinite(value) || value <= 0) {
      console.error(`Invalid --top value: ${rawArgs[i + 1] ?? ''}`);
      process.exit(1);
    }

    limit = value;
    i += 1;
    continue;
  }

  bunArgs.push(arg);
}

const outputDir = '/tmp/plate-test-slowest';
const junitFile = join(outputDir, runAll ? 'junit-all.xml' : 'junit-fast.xml');

mkdirSync(outputDir, { recursive: true });

const command = runAll
  ? ['test', ...bunArgs, '--reporter=junit', '--reporter-outfile', junitFile]
  : [
      'tooling/scripts/test-fast.mjs',
      ...bunArgs,
      '--reporter=junit',
      '--reporter-outfile',
      junitFile,
    ];

const run = spawnSync(process.execPath, command, { stdio: 'inherit' });

let xml = '';

try {
  xml = readFileSync(junitFile, 'utf8');
} catch {
  xml = '';
}

if (xml) {
  const rows = [];
  const fileRows = new Map();
  const testcasePattern = /<testcase\b([^>]*)\/>/g;
  const attributePattern = /(\w+)="([^"]*)"/g;

  for (const match of xml.matchAll(testcasePattern)) {
    const attrs = Object.fromEntries(
      [...match[1].matchAll(attributePattern)].map(([, key, value]) => [
        key,
        value,
      ])
    );

    const seconds = Number(attrs.time ?? 0);

    const row = {
      classname: attrs.classname ?? '',
      file: attrs.file ?? '',
      milliseconds: seconds * 1000,
      name: attrs.name ?? '',
    };

    rows.push(row);

    const fileKey = row.file || '(unknown file)';
    const fileRow = fileRows.get(fileKey) ?? {
      file: fileKey,
      milliseconds: 0,
      tests: 0,
    };

    fileRow.milliseconds += row.milliseconds;
    fileRow.tests += 1;
    fileRows.set(fileKey, fileRow);
  }

  rows.sort((a, b) => b.milliseconds - a.milliseconds);
  const sortedFiles = [...fileRows.values()].sort(
    (a, b) => b.milliseconds - a.milliseconds
  );
  const averageMs =
    rows.length === 0
      ? 0
      : rows.reduce((sum, row) => sum + row.milliseconds, 0) / rows.length;
  const medianMs =
    rows.length === 0
      ? 0
      : [...rows].sort((a, b) => a.milliseconds - b.milliseconds)[
          Math.floor(rows.length / 2)
        ].milliseconds;
  const modeLabel = runAll ? 'full suite' : 'fast suite';

  console.log('');
  console.log(`Suite: ${modeLabel}`);
  console.log(`JUnit report: ${junitFile}`);
  console.log(
    `Average: ${averageMs.toFixed(3)}ms  Median: ${medianMs.toFixed(3)}ms`
  );
  if (!runAll) {
    console.log(
      `Slow-bucket thresholds: ${FAST_TEST_SLOW_CASE_THRESHOLD_MS}ms/test, ${FAST_TEST_SLOW_FILE_THRESHOLD_MS}ms/file total`
    );
  }
  console.log(`Top ${Math.min(limit, rows.length)} slowest tests`);

  for (const row of rows.slice(0, limit)) {
    const location = row.file ? `${row.file}  ` : '';
    const prefix = row.classname ? `${row.classname} > ` : '';
    const marker =
      !runAll && row.milliseconds >= FAST_TEST_SLOW_CASE_THRESHOLD_MS
        ? '! '
        : '';

    console.log(
      `${marker}${row.milliseconds.toFixed(2).padStart(8)}ms  ${location}${prefix}${row.name}`
    );
  }

  console.log('');
  console.log(`Top ${Math.min(20, sortedFiles.length)} slowest files`);

  for (const row of sortedFiles.slice(0, 20)) {
    const marker =
      !runAll && row.milliseconds >= FAST_TEST_SLOW_FILE_THRESHOLD_MS
        ? '! '
        : '';

    console.log(
      `${marker}${row.milliseconds.toFixed(2).padStart(8)}ms  ${String(row.tests).padStart(3)} tests  ${row.file}`
    );
  }
}

process.exit(run.status ?? 1);
