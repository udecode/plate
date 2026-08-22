#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  FAST_TEST_WARN_CASE_THRESHOLD_MS,
  FAST_TEST_SLOW_CASE_THRESHOLD_MS,
  FAST_TEST_SLOW_SUITE_THRESHOLD_MS,
  FAST_TEST_WARN_SUITE_THRESHOLD_MS,
} from '../config/test-suites.mjs';

const rawArgs = process.argv.slice(2);
const bunArgs = [];
let limit = 50;
let profileOnly = false;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];

  if (arg === '--') {
    continue;
  }

  if (arg === '--profile') {
    profileOnly = true;
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
const junitFile = join(outputDir, 'junit-fast.xml');

mkdirSync(outputDir, { recursive: true });

const command = [
  'tooling/scripts/test-fast.mjs',
  ...bunArgs,
  '--reporter=junit',
  '--reporter-outfile',
  junitFile,
];

const run = spawnSync(process.execPath, command, { stdio: 'inherit' });

let xml = '';

try {
  xml = readFileSync(junitFile, 'utf-8');
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
  const slowTests = rows.filter(
    (row) => row.milliseconds >= FAST_TEST_SLOW_CASE_THRESHOLD_MS
  );
  const warnTests = rows.filter(
    (row) => row.milliseconds >= FAST_TEST_WARN_CASE_THRESHOLD_MS
  );
  const suiteMilliseconds = rows.reduce(
    (sum, row) => sum + row.milliseconds,
    0
  );
  const slowSuite = suiteMilliseconds >= FAST_TEST_SLOW_SUITE_THRESHOLD_MS;
  const warnSuite = suiteMilliseconds >= FAST_TEST_WARN_SUITE_THRESHOLD_MS;
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
  const modeLabel = 'fast suite';

  console.log('');
  console.log(`Suite: ${modeLabel}`);
  console.log(`JUnit report: ${junitFile}`);
  console.log(
    `Average: ${averageMs.toFixed(3)}ms  Median: ${medianMs.toFixed(3)}ms`
  );
  console.log(
    `Hard limits: ${FAST_TEST_SLOW_CASE_THRESHOLD_MS}ms/test, ${FAST_TEST_SLOW_SUITE_THRESHOLD_MS}ms/suite total`
  );
  console.log(
    `Warning zone: ${FAST_TEST_WARN_CASE_THRESHOLD_MS}ms/test, ${FAST_TEST_WARN_SUITE_THRESHOLD_MS}ms/suite total`
  );
  console.log(`Measured suite total: ${suiteMilliseconds.toFixed(2)}ms`);
  console.log(`Top ${Math.min(limit, rows.length)} slowest tests`);

  for (const row of rows.slice(0, limit)) {
    const location = row.file ? `${row.file}  ` : '';
    const prefix = row.classname ? `${row.classname} > ` : '';
    const marker =
      row.milliseconds >= FAST_TEST_SLOW_CASE_THRESHOLD_MS
        ? '! '
        : row.milliseconds >= FAST_TEST_WARN_CASE_THRESHOLD_MS
          ? '~ '
          : '';

    console.log(
      `${marker}${row.milliseconds.toFixed(2).padStart(8)}ms  ${location}${prefix}${row.name}`
    );
  }

  console.log('');
  console.log(`Top ${Math.min(20, sortedFiles.length)} slowest files`);

  for (const row of sortedFiles.slice(0, 20)) {
    console.log(
      `${row.milliseconds.toFixed(2).padStart(8)}ms  ${String(row.tests).padStart(3)} tests  ${row.file}`
    );
  }

  if (
    slowTests.length === 0 &&
    !slowSuite &&
    (warnTests.length > 0 || warnSuite)
  ) {
    console.log('');
    console.log(
      'Fast-suite warning zone reached. Optimize repeat offenders before the feedback loop crosses its hard budget.'
    );
    console.log(
      'Move only inherently blocking tests to `*.slow.*`; keep coherent families colocated.'
    );

    if (warnSuite) {
      console.log('');
      console.log(
        `Suite total is in the warning zone (${suiteMilliseconds.toFixed(2)}ms).`
      );
    }

    if (warnTests.length > 0) {
      console.log('');
      console.log('Tests in the warning zone:');

      for (const row of warnTests.filter(
        (innerRow) => innerRow.milliseconds < FAST_TEST_SLOW_CASE_THRESHOLD_MS
      )) {
        const prefix = row.classname ? `${row.classname} > ` : '';
        const location = row.file ? `${row.file}: ` : '';

        console.log(
          `  - ${location}${prefix}${row.name} (${row.milliseconds.toFixed(2)}ms)`
        );
      }
    }
  }

  if (!profileOnly && (slowTests.length > 0 || slowSuite)) {
    console.error('');
    console.error(
      'Fast-suite budget exceeded. Optimize aggregate drift or move inherently blocking tests to `*.slow.*`; do not split coherent files to game file totals.'
    );

    if (slowSuite) {
      console.error('');
      console.error(
        `Suite total exceeds ${FAST_TEST_SLOW_SUITE_THRESHOLD_MS}ms (${suiteMilliseconds.toFixed(2)}ms).`
      );
    }

    if (slowTests.length > 0) {
      console.error('');
      console.error('Tests over the fast-suite case threshold:');

      for (const row of slowTests) {
        const prefix = row.classname ? `${row.classname} > ` : '';
        const location = row.file ? `${row.file}: ` : '';

        console.error(
          `  - ${location}${prefix}${row.name} (${row.milliseconds.toFixed(2)}ms)`
        );
      }
    }

    process.exit(1);
  }
}

process.exit(run.status ?? 1);
