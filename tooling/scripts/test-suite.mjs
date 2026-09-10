#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

import { globSync, isDynamicPattern } from 'tinyglobby';

import {
  TEST_FAST_IGNORE_PATTERNS,
  TEST_FILE_PATTERNS,
  TEST_IGNORE_PATTERNS,
  TEST_SLOW_FILE_PATTERNS,
  TEST_NODE_FILE_PATTERNS,
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
const JUNIT_OUTFILE_PREFIX = 'plate-junit-';
const MOCK_MODULE_PATTERN = 'mock.module(';
const LOCAL_IMPORT_PATTERN =
  /\b(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)|\bimport\s*['"]([^'"]+)['"]/g;
const XML_DECLARATION_RE = /^<\?xml[^>]*>\s*/u;
const TESTSUITES_OPEN_RE = /^<testsuites\b[^>]*>\s*/u;
const TESTSUITES_CLOSE_RE = /\s*<\/testsuites>\s*$/u;
const TRAILING_SLASH_RE = /\/$/;
const LOCAL_SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

const [suite, ...rawArgs] = process.argv.slice(2);
if (suite !== 'fast' && suite !== 'slow') {
  throw new Error(
    'Usage: bun tooling/scripts/test-suite.mjs <fast|slow> [paths and Bun test flags]'
  );
}
const patterns =
  suite === 'fast' ? TEST_FILE_PATTERNS : TEST_SLOW_FILE_PATTERNS;
const ignore =
  suite === 'fast' ? TEST_FAST_IGNORE_PATTERNS : TEST_IGNORE_PATTERNS;
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

      if (nextArg && (matchedValueFlag !== '--bail' || /^\d+$/.test(nextArg))) {
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

const matches = (file, filePatterns) =>
  filePatterns.some((pattern) => new Bun.Glob(pattern).match(file));
const normalizeFilter = (value) =>
  (isAbsolute(value)
    ? relative(
        realpathSync(process.cwd()),
        existsSync(value) ? realpathSync(value) : value
      )
    : value
  )
    .replaceAll('\\', '/')
    .replace(LEADING_DOT_SLASH_RE, '')
    .replace(TRAILING_SLASH_RE, '');
const filters = pathFilters.map(normalizeFilter);
const exactFiles =
  filters.length > 0 &&
  filters.every(
    (file) =>
      !isDynamicPattern(file) && existsSync(file) && statSync(file).isFile()
  );
const candidates = exactFiles
  ? filters
  : globSync(patterns, { cwd: process.cwd(), ignore, onlyFiles: true });
const selectedFiles = [...new Set(candidates)]
  .filter((file) => {
    if (!matches(file, patterns) || matches(file, ignore)) return false;
    return (
      filters.length === 0 ||
      filters.some((filter) =>
        isDynamicPattern(filter)
          ? new Bun.Glob(filter).match(file)
          : file === filter ||
            file.startsWith(`${filter}/`) ||
            file.includes(filter)
      )
    );
  })
  .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

if (selectedFiles.length === 0) {
  console.error(`No ${suite}-suite tests matched.`);
  process.exit(1);
}

const findArgValue = (args, flag) => {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === flag) return args[i + 1];
    if (arg.startsWith(`${flag}=`)) return arg.slice(flag.length + 1);
  }

  return undefined;
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

const rootDirectory = process.cwd();
const rootConfigPath = resolve('bunfig.toml');
const rootTestConfig = existsSync(rootConfigPath)
  ? Bun.TOML.parse(readFileSync(rootConfigPath, 'utf-8')).test
  : undefined;

const workingDirectory = (file) => {
  const [root, name] = file.split('/');
  const directory = root === 'apps' ? resolve(root, name) : rootDirectory;

  return existsSync(join(directory, 'package.json'))
    ? directory
    : rootDirectory;
};

const processArguments = (files, args, cwd) => [
  'test',
  // Bun discovers config from its cwd; app fixtures still need root setup.
  ...(cwd !== rootDirectory
    ? [
        ...(rootTestConfig?.preload ?? []).flatMap((file) => [
          '--preload',
          resolve(file),
        ]),
        ...(rootTestConfig?.onlyFailures ? ['--only-failures'] : []),
      ]
    : []),
  ...args,
  ...files.map((file) => resolve(file)),
];

const runFiles = (files, args, cwd) =>
  spawnSync(process.execPath, processArguments(files, args, cwd), {
    cwd,
    stdio: 'inherit',
  });

const resolveLocalImport = (fromFile, specifier) => {
  if (!specifier.startsWith('.')) return undefined;

  const sanitizedSpecifier = specifier.split('?')[0]?.split('#')[0];

  if (!sanitizedSpecifier) return undefined;

  const absoluteBase = resolve(dirname(fromFile), sanitizedSpecifier);
  const importCandidates = [
    absoluteBase,
    ...LOCAL_SOURCE_EXTENSIONS.map(
      (extension) => `${absoluteBase}${extension}`
    ),
    ...LOCAL_SOURCE_EXTENSIONS.map((extension) =>
      join(absoluteBase, `index${extension}`)
    ),
  ];

  return importCandidates.find((candidate) => {
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

  const source = readFileSync(file, 'utf-8');

  if (source.includes(MOCK_MODULE_PATTERN)) {
    mockModuleUsageCache.set(file, true);
    return true;
  }

  for (const match of source.matchAll(LOCAL_IMPORT_PATTERN)) {
    const specifier = match[1] ?? match[2] ?? match[3] ?? match[4];

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
        return readFileSync(file, 'utf-8')
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
const rawReporterOutfile = findArgValue(bunArgs, '--reporter-outfile');
const reporterOutfile = rawReporterOutfile && resolve(rawReporterOutfile);
const junitReporter = reporter === 'junit' && reporterOutfile;
const shouldIsolate = !shouldWatch;

let status = 0;
const nodeFiles =
  bunArgs.length === 0
    ? selectedFiles.filter((file) => matches(file, TEST_NODE_FILE_PATTERNS))
    : [];
if (nodeFiles.length > 0) {
  const env = { ...process.env };
  // A parent node:test process supplies a private reporting protocol to children.
  delete env.NODE_TEST_CONTEXT;
  const run = spawnSync(
    'node',
    [
      '--test',
      '--test-concurrency=2',
      ...nodeFiles.map((file) => resolve(file)),
    ],
    { env, stdio: 'inherit' }
  );
  if (run.error) throw run.error;
  if (run.status !== 0) status = run.status ?? 1;
}
const bunFiles = selectedFiles.filter((file) => !nodeFiles.includes(file));
if (bunFiles.length === 0) process.exit(status);

const isolatedFiles = shouldIsolate
  ? bunFiles.filter((file) => fileUsesMockModule(resolve(file)))
  : [];
const sharedFiles =
  isolatedFiles.length === 0
    ? bunFiles
    : bunFiles.filter((file) => !isolatedFiles.includes(file));
const sharedBatches = Map.groupBy(sharedFiles, workingDirectory);

if (shouldWatch) {
  const children = [...sharedBatches].map(([cwd, files]) =>
    spawn(process.execPath, processArguments(files, bunArgs, cwd), {
      cwd,
      stdio: 'inherit',
    })
  );
  const stopChildren = (signal) => {
    for (const child of children) child.kill(signal);
  };
  const stopOnInterrupt = () => stopChildren('SIGINT');
  const stopOnTermination = () => stopChildren('SIGTERM');
  process.once('SIGINT', stopOnInterrupt);
  process.once('SIGTERM', stopOnTermination);
  const exits = children.map(
    (child) =>
      new Promise((resolveExit, reject) => {
        child.once('error', reject);
        child.once('exit', (code, signal) =>
          resolveExit(code ?? (signal ? 1 : 0))
        );
      })
  );
  const result = await Promise.race(exits).finally(async () => {
    stopChildren('SIGTERM');
    await Promise.allSettled(exits);
    process.removeListener('SIGINT', stopOnInterrupt);
    process.removeListener('SIGTERM', stopOnTermination);
  });

  process.exit(result || status);
}

if (isolatedFiles.length === 0 && sharedBatches.size === 1 && !junitReporter) {
  const [[cwd, files]] = sharedBatches;
  const run = runFiles(files, bunArgs, cwd);

  process.exit((run.status ?? 1) || status);
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

const runBatch = (files, batchId, cwd) => {
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

  const run = runFiles(files, args, cwd);

  if (junitReporter && junitTempDir) {
    junitFiles.push(join(junitTempDir, `${batchId}.xml`));
  }

  if ((run.status ?? 1) !== 0) {
    status = run.status ?? 1;
  }
};

for (const [index, [cwd, files]] of [...sharedBatches].entries()) {
  if (bailEnabled && status !== 0) break;
  runBatch(files, `shared-${index}`, cwd);
}

if (!bailEnabled || status === 0) {
  isolatedFiles.forEach((file, index) => {
    if (bailEnabled && status !== 0) return;

    runBatch([file], `isolated-${index}`, workingDirectory(file));
  });
}

if (junitReporter && reporterOutfile) {
  try {
    mergeJunitReports(junitFiles, reporterOutfile);
  } finally {
    rmSync(junitTempDir, { recursive: true, force: true });
  }
}

process.exit(status);
