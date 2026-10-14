import { execFileSync } from 'node:child_process';

import { globSync } from 'tinyglobby';

export const TEST_FILE_PATTERNS = [
  'apps/**/*.spec.{ts,tsx}',
  'packages/**/*.spec.{ts,tsx}',
  'tooling/scripts/**/*.test.mjs',
];

export const TEST_SLOW_FILE_PATTERNS = [
  'apps/**/*.slow.{ts,tsx}',
  'packages/**/*.slow.{ts,tsx}',
  'tooling/scripts/**/*.slow.test.mjs',
];

export const TEST_DEFERRED_FILE_PATTERNS = [
  'apps/**/__deferred__/**/*.deferred.spec.{ts,tsx}',
];

export const TEST_IGNORE_PATTERNS = [
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
  '.next/**',
  '**/__deferred__/**',
];

export const TEST_FAST_IGNORE_PATTERNS = [
  ...TEST_IGNORE_PATTERNS,
  'tooling/scripts/**/*.slow.test.mjs',
];

export const findGitVisibleTestFiles = (patterns, ignore) => {
  const visibleFiles = new Set(
    execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
    ).split('\0')
  );

  return globSync(patterns, { cwd: process.cwd(), ignore, onlyFiles: true })
    .filter((file) => visibleFiles.has(file))
    .sort();
};

const isCI = !!process.env.CI;

// When a fast-suite spec repeatedly crosses these thresholds, move the whole
// spec to `*.slow.ts[x]`. `pnpm test:slowest` and `pnpm check` enforce these
// limits. CI runners are noisier than fast local machines, so keep local
// enforcement tight and give CI a slightly wider bucket before it hard-fails.
// Use `pnpm test:profile` for a non-failing profile run.
export const FAST_TEST_SLOW_CASE_THRESHOLD_MS = isCI ? 90 : 75;
export const FAST_TEST_SLOW_FILE_THRESHOLD_MS = isCI ? 180 : 150;

// Keep the local warning zone where it already was, but in CI surface the old
// hard limits as warnings so slow drift is still visible in logs.
export const FAST_TEST_WARN_CASE_THRESHOLD_MS = isCI ? 75 : 60;
export const FAST_TEST_WARN_FILE_THRESHOLD_MS = isCI ? 150 : 120;
