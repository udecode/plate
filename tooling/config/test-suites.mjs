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
  '**/tests/plite-browser/**',
  '.next/**',
  '**/__deferred__/**',
];

export const TEST_FAST_IGNORE_PATTERNS = [
  ...TEST_IGNORE_PATTERNS,
  'tooling/scripts/**/*.slow.test.mjs',
];

const isCI = !!process.env.CI;

// When an inherently blocking test repeatedly crosses these thresholds, split
// that case into the matching `*.slow.*` lane. Keep cheap contracts in the fast
// file. `pnpm test:slowest` and `pnpm check` enforce these limits. CI runners are
// noisier than fast local machines, so keep local enforcement tight and give CI
// a slightly wider bucket before it hard-fails. Use `pnpm test:profile` for a
// non-failing profile run.
export const FAST_TEST_SLOW_CASE_THRESHOLD_MS = isCI ? 90 : 75;
export const FAST_TEST_SLOW_FILE_THRESHOLD_MS = isCI ? 180 : 150;

// Keep the local warning zone where it already was, but in CI surface the old
// hard limits as warnings so slow drift is still visible in logs.
export const FAST_TEST_WARN_CASE_THRESHOLD_MS = isCI ? 75 : 60;
export const FAST_TEST_WARN_FILE_THRESHOLD_MS = isCI ? 150 : 120;
