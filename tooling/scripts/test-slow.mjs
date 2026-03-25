#!/usr/bin/env node

import {
  existsSync,
  mkdtempSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

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
const JUNIT_OUTFILE_PREFIX = 'plate-slow-junit-';
const MOCK_MODULE_PATTERN = 'mock.module(';
const LOCAL_IMPORT_PATTERN =
  /\b(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const XML_DECLARATION_RE = /^<\?xml[^>]*>\s*/u;
const TESTSUITES_OPEN_RE = /^<testsuites\b[^>]*>\s*/u;
const TESTSUITES_CLOSE_RE = /\s*<\/testsuites>\s*$/u;
const TRAILING_SLASH_RE = /\/$/;
const LOCAL_SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

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

const findArgValue = (args, flag) => {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === flag) return args[i + 1];
    if (arg.startsWith(`${flag}=`)) return arg.slice(flag.length + 1);
  }
};

const hasArg = (args, flag) =>
  args.some((arg) => arg === flag || arg.startsWith(`${flag}=`));

const stripArgWithValue = (args, flag) => {
  const nextArgs = [];
  let skipNextArg = false;

  for (const arg of args) {
    if (skipNextArg) {
      skipNextArg = false;
      continue;
    }

    if (arg === flag) {
      skipNextArg = true;
      continue;
    }

    if (arg.startsWith(`${flag}=`)) continue;

    nextArgs.push(arg);
  }

  return nextArgs;
};

const runFiles = (files, args) => {
  const explicitPaths = files.map((file) =>
    file.startsWith('/') || file.startsWith('./') ? file : `./${file}`
  );

  return spawnSync(process.execPath, ['test', ...args, ...explicitPaths], {
    stdio: 'inherit',
  });
};

const resolveLocalImport = (fromFile, specifier) => {
  if (!specifier.startsWith('.')) return;

  const sanitizedSpecifier = specifier.split('?')[0]?.split('#')[0];

  if (!sanitizedSpecifier) return;

  const absoluteBase = resolve(dirname(fromFile), sanitizedSpecifier);
  const candidates = [
    absoluteBase,
    ...LOCAL_SOURCE_EXTENSIONS.map(
      (extension) => `${absoluteBase}${extension}`
    ),
    ...LOCAL_SOURCE_EXTENSIONS.map((extension) =>
      join(absoluteBase, `index${extension}`)
    ),
  ];

  return candidates.find((candidate) => {
    if (!existsSync(candidate)) return false;

    return statSync(candidate).isFile();
  });
};

const mockModuleUsageCache = new Map();

const fileUsesMockModule = (file) => {
  if (mockModuleUsageCache.has(file)) {
    return mockModuleUsageCache.get(file);
  }

  mockModuleUsageCache.set(file, false);

  const source = readFileSync(file, 'utf8');

  if (source.includes(MOCK_MODULE_PATTERN)) {
    mockModuleUsageCache.set(file, true);
    return true;
  }

  for (const match of source.matchAll(LOCAL_IMPORT_PATTERN)) {
    const specifier = match[1] ?? match[2] ?? match[3];

    if (!specifier) continue;

    const resolvedImport = resolveLocalImport(file, specifier);

    if (!resolvedImport) continue;

    if (fileUsesMockModule(resolvedImport)) {
      mockModuleUsageCache.set(file, true);
      return true;
    }
  }

  return false;
};

const mergeJunitReports = (files, outfile) => {
  const suites = files
    .map((file) => {
      try {
        return readFileSync(file, 'utf8')
          .replace(XML_DECLARATION_RE, '')
          .replace(TESTSUITES_OPEN_RE, '')
          .replace(TESTSUITES_CLOSE_RE, '')
          .trim();
      } catch {
        return '';
      }
    })
    .filter(Boolean);

  writeFileSync(
    outfile,
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<testsuites name="bun test">',
      ...suites,
      '</testsuites>',
      '',
    ].join('\n')
  );
};

const shouldWatch = hasArg(bunArgs, '--watch');
const reporter = findArgValue(bunArgs, '--reporter');
const reporterOutfile = findArgValue(bunArgs, '--reporter-outfile');
const junitReporter = reporter === 'junit' && reporterOutfile;
const shouldIsolate = !shouldWatch;

const isolatedFiles = shouldIsolate
  ? selectedFiles.filter((file) => fileUsesMockModule(resolve(file)))
  : [];
const sharedFiles =
  isolatedFiles.length === 0
    ? selectedFiles
    : selectedFiles.filter((file) => !isolatedFiles.includes(file));

if (isolatedFiles.length === 0) {
  const run = runFiles(selectedFiles, bunArgs);

  process.exit(run.status ?? 1);
}

const bailEnabled = hasArg(bunArgs, '--bail');
const junitBaseArgs = junitReporter
  ? stripArgWithValue(
      stripArgWithValue(bunArgs, '--reporter'),
      '--reporter-outfile'
    )
  : bunArgs;
const junitTempDir = junitReporter
  ? mkdtempSync(join(tmpdir(), JUNIT_OUTFILE_PREFIX))
  : null;
const junitFiles = [];
let status = 0;

const runBatch = (files, batchId) => {
  if (files.length === 0) return;

  const args =
    junitReporter && junitTempDir
      ? [
          ...junitBaseArgs,
          '--reporter=junit',
          '--reporter-outfile',
          join(junitTempDir, `${batchId}.xml`),
        ]
      : bunArgs;

  const run = runFiles(files, args);

  if (junitReporter && junitTempDir) {
    junitFiles.push(join(junitTempDir, `${batchId}.xml`));
  }

  if ((run.status ?? 1) !== 0) {
    status = run.status ?? 1;
  }
};

runBatch(sharedFiles, 'shared');

if (!bailEnabled || status === 0) {
  isolatedFiles.forEach((file, index) => {
    if (bailEnabled && status !== 0) return;

    runBatch([file], `isolated-${index}`);
  });
}

if (junitReporter && reporterOutfile) {
  mergeJunitReports(junitFiles, reporterOutfile);
}

process.exit(status);
