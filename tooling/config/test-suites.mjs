export const TEST_FILE_PATTERNS = [
  'apps/**/*.spec.{ts,tsx}',
  'packages/**/*.spec.{ts,tsx}',
];

export const TEST_IGNORE_PATTERNS = [
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
  '.next/**',
];

// When a fast-suite spec repeatedly crosses these thresholds in
// `bun run test:slowest`, move the whole spec into a slow bucket or document why
// it stays in the fast loop.
export const FAST_TEST_SLOW_CASE_THRESHOLD_MS = 75;
export const FAST_TEST_SLOW_FILE_THRESHOLD_MS = 150;

export const TEST_SLOW_BUCKETS = {
  docx: ['packages/docx/src/**', 'packages/docx-io/src/**'],
  integration: ['apps/www/src/__tests__/package-integration/**'],
  reactHeavy: [
    'packages/ai/src/react/ai-chat/streaming/streamInsertChunk.spec.tsx',
    'packages/core/src/react/components/Plate.spec.tsx',
    'packages/core/src/react/plugins/SlateReactExtensionPlugin.spec.tsx',
  ],
};

export const FAST_TEST_EXCLUDE_PATTERNS =
  Object.values(TEST_SLOW_BUCKETS).flat();
