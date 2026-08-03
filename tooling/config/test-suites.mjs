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

// Budget the feedback loop, not file topology. A coherent file with many cheap
// tests is not slow and must not be split to game an aggregate file timer.
// Individual hard limits catch genuinely blocking cases; the suite limit catches
// distributed drift. CI runners get wider budgets for ordinary machine noise.
export const FAST_TEST_SLOW_CASE_THRESHOLD_MS = isCI ? 1500 : 1000;
export const FAST_TEST_SLOW_SUITE_THRESHOLD_MS = isCI ? 30_000 : 20_000;

export const FAST_TEST_WARN_CASE_THRESHOLD_MS = isCI ? 300 : 200;
export const FAST_TEST_WARN_SUITE_THRESHOLD_MS = isCI ? 25_000 : 15_000;
