// Node contracts do not need the editor's DOM preload. Bun-only CLI flags keep
// the selected suite on Bun so reporter, watch, and bail behavior stays intact.
export const TEST_NODE_FILE_PATTERNS = [
  '.agents/rules/**/*.test.mjs',
  'tooling/scripts/**/*.test.mjs',
  // oxlint's RuleTester refuses to run under Bun.
  'tooling/oxlint/plate-plugin.test.mjs',
  'apps/plite/scripts/**/*.test.mjs',
  'benchmarks/editor/benchmarks/{external-text,markdown-streaming}-measurement.test.mjs',
];

export const TEST_ISOLATED_FILE_PATTERNS = [
  'benchmarks/editor/benchmarks/*.test.ts',
];

export const TEST_FILE_PATTERNS = [
  '.agents/rules/**/*.test.mjs',
  'apps/**/*.spec.{ts,tsx}',
  'apps/**/*.test.{ts,tsx,mts,mjs}',
  'benchmarks/editor/benchmarks/*.test.ts',
  'benchmarks/editor/benchmarks/{external-text,markdown-streaming}-measurement.test.mjs',
  'packages/**/*.spec.{ts,tsx}',
  'tooling/scripts/**/*.test.mjs',
  'tooling/oxlint/**/*.test.mjs',
];

// Bun runs every package runtime test file except these, which Vitest runs
// with the package's config.
export const vitestSuites = {
  '@platejs/test': {
    args: ['--project', 'browser'],
    config: 'vitest.config.ts',
    includes: (partitionName) => partitionName === 'browser',
  },
  plitejs: {
    args: [],
    config: 'vitest.config.mjs',
    includes: (partitionName, filename) => filename.startsWith('test/react/'),
  },
};

export const TEST_DEFERRED_FILE_PATTERNS = [
  'apps/**/__deferred__/**/*.deferred.spec.{ts,tsx}',
];

export const TEST_IGNORE_PATTERNS = [
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
  '**/tests/plite-browser/**',
  '**/tests/browser/**',
  '.next/**',
  '**/__deferred__/**',
];

export const TEST_FAST_IGNORE_PATTERNS = [
  ...TEST_IGNORE_PATTERNS,
  'packages/platejs/**',
  'packages/plitejs/**',
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

export const FAST_TEST_TIMEOUT_MS = 5000;

// CI's dedicated runner judges each case against 5 s. On a shared local host,
// other sessions and the check's own parallel steps stretch wall-clock time,
// so local runs only catch a hang.
export const BUN_TEST_TIMEOUT_MS = isCI ? FAST_TEST_TIMEOUT_MS : 30_000;
