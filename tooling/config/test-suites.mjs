export const TEST_FILE_PATTERNS = [
  'apps/**/*.spec.{ts,tsx}',
  'packages/**/*.spec.{ts,tsx}',
];

export const TEST_SLOW_FILE_PATTERNS = [
  'apps/**/*.slow.{ts,tsx}',
  'packages/**/*.slow.{ts,tsx}',
];

export const TEST_IGNORE_PATTERNS = [
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
  '.next/**',
];

// When a fast-suite spec repeatedly crosses these thresholds, move the whole
// spec to `*.slow.ts[x]`. `pnpm test:slowest` and `pnpm check` enforce these
// limits. Use `pnpm test:profile` for a non-failing profile run.
export const FAST_TEST_SLOW_CASE_THRESHOLD_MS = 75;
export const FAST_TEST_SLOW_FILE_THRESHOLD_MS = 150;

// CI is less forgiving than a fast local machine. Treat this lower warning
// zone as the "move it before CI humiliates you" band, especially for React-
// heavy specs with noisy timing variance.
export const FAST_TEST_WARN_CASE_THRESHOLD_MS = 60;
export const FAST_TEST_WARN_FILE_THRESHOLD_MS = 120;
