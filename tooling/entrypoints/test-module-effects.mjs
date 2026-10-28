// What a module that tests load reaches without an import the generator can
// walk. `reads` lists the files it reads. `runs` lists the modules it runs in a
// child process, imports by a computed path, or hands to a test runner or the
// TypeScript compiler, and the generator walks their imports too. A string says
// why the module reaches no repository file. Globs are relative to the
// repository root.
export const testModuleEffects = {
  'benchmarks/slate-v2/donor/core/current/yjs-collaboration.mjs': {
    runs: [
      'benchmarks/slate-v2/donor/core/current/yjs-collaboration.mjs',
      'config/plite-source-aliases.ts',
    ],
  },
  'benchmarks/slate-v2/donor/shared/stats.mjs':
    'writes the benchmark summary to the path its caller names',
  'config/plite-source-aliases.ts':
    'points package imports at their source files, which the trace records as they load',
  'config/workspace-source-entries.mjs': { reads: ['packages/*/package.json'] },
  'packages/platejs/src/docx/html/cleanWordHtml.whitespace.spec.ts': {
    reads: [
      'packages/platejs/src/docx/html/docx-cleaner/__tests__/input/*.html',
      'packages/platejs/src/docx/html/docx-cleaner/__tests__/output/*.html',
    ],
  },
  'packages/platejs/src/docx/import/lib/importDocx.spec.tsx': {
    reads: ['apps/www/src/__tests__/package-integration/docx/*.docx'],
  },
  'packages/platejs/src/docx/import/lib/numbering/importDocxNumbering.spec.ts':
    { reads: ['apps/www/src/__tests__/package-integration/docx/*.docx'] },
  'packages/platejs/src/html/server/index.ts':
    'loads linkedom from node_modules through createRequire',
  'packages/platejs/test/public-package-import-smoke.spec.ts': {
    reads: ['packages/plitejs/package.json', 'packages/test/package.json'],
  },
  'packages/plitejs/test/core-benchmark-scripts-contract.ts': {
    reads: [
      'benchmarks/slate-v2/donor/core/current/*.mjs',
      'benchmarks/targets/slate-v2.json',
    ],
  },
  'packages/plitejs/test/core/runtime-load-order.test.ts': {
    runs: [
      'packages/plitejs/src/core/plugin-dispatch.ts',
      'packages/plitejs/src/core/view-carets.ts',
    ],
  },
  'packages/plitejs/test/create-editor-options-message.test.ts': {
    reads: [
      'packages/plitejs/tsconfig.json',
      'tooling/config/tsconfig.base.json',
      'tsconfig.json',
    ],
    runs: [
      'packages/plitejs/src/history/index.ts',
      'packages/plitejs/src/index.ts',
    ],
  },
  'packages/plitejs/test/delete-contract.ts': {
    reads: ['packages/plitejs/src/transforms-text/delete-text-whole-blocks.ts'],
  },
  'packages/plitejs/test/dom/environment.ts': {
    runs: [
      'packages/plitejs/src/dom/index.ts',
      'packages/plitejs/src/dom/utils/environment.ts',
    ],
  },
  'packages/plitejs/test/dom/hotkeys-no-navigator.test.ts': {
    runs: ['packages/plitejs/src/dom/utils/hotkeys.ts'],
  },
  'packages/plitejs/test/dom/public-surface-contract.ts': {
    reads: [
      'content/docs/**/dom-coverage.mdx',
      'content/docs/api/dom.mdx',
      'packages/plitejs/package.json',
      'packages/plitejs/src/dom/**/*.ts',
      'packages/plitejs/tsdown.config.mts',
    ],
  },
  'packages/plitejs/test/history/index.spec.ts': {
    reads: [
      'packages/plitejs/test/history/isHistory/**',
      'packages/plitejs/test/history/undo/**',
    ],
  },
  'packages/plitejs/test/history/package-readme-contract.spec.ts': {
    reads: ['content/docs/**/history.mdx'],
  },
  'packages/plitejs/test/hyperscript/index.spec.ts': {
    reads: ['packages/plitejs/test/hyperscript/fixtures/**'],
  },
  'packages/plitejs/test/hyperscript/package-readme-contract.test.ts': {
    reads: ['content/docs/**/unit-testing.mdx'],
  },
  'packages/plitejs/test/index.spec.ts': {
    reads: [
      'packages/plitejs/test/interfaces/**',
      'packages/plitejs/test/normalization/**',
      'packages/plitejs/test/transforms/**',
      'packages/plitejs/test/utils/deep-equal/**',
    ],
  },
  'packages/plitejs/test/insert-node-keys-contract.test.ts': {
    runs: ['packages/plitejs/test/support/discard-arms.ts'],
  },
  'packages/plitejs/test/pagination/package-config-contract.test.ts': {
    reads: ['packages/plitejs/package.json'],
  },
  'packages/plitejs/test/public-surface-contract.ts': {
    reads: [
      'apps/plite/tests/plite-browser/**',
      'apps/www/src/app/*/examples/plite/**',
      'content/docs/**',
      'packages/*/package.json',
    ],
  },
  'packages/plitejs/test/react/dom-repair-policy-contract.test.ts': {
    reads: ['packages/plitejs/src/react/editable/dom-repair-queue.ts'],
  },
  'packages/plitejs/test/react/kernel-authority-audit-contract.ts': {
    reads: ['packages/plitejs/src/dom/**', 'packages/plitejs/src/react/**'],
  },
  'packages/plitejs/test/react/surface-contract.tsx': {
    reads: ['packages/plitejs/package.json', 'packages/plitejs/src/react/**'],
  },
  'packages/plitejs/test/react/vitest-setup.ts':
    'appends to the audit report that PLITE_PROOF_AUDIT_REPORT names',
  'packages/plitejs/test/release-scripts-contract.ts': {
    reads: [
      '.changeset/*.md',
      'package.json',
      'packages/*/README.md',
      'packages/*/Readme.md',
      'packages/*/package.json',
    ],
  },
  'packages/plitejs/test/test-helper-boundary-contract.ts': {
    reads: ['packages/plitejs/test/support/snapshot.ts'],
  },
  'packages/plitejs/test/yjs/package-config-contract.spec.ts': {
    reads: [
      'apps/plite/package.json',
      'apps/www/tsconfig.json',
      'content/docs/**/yjs.mdx',
      'package.json',
      'packages/*/package.json',
      'packages/*/tsconfig.json',
    ],
    runs: [
      'benchmarks/slate-v2/donor/core/current/yjs-collaboration.mjs',
      'config/plite-source-aliases.ts',
    ],
  },
  'packages/plitejs/vitest.config.mjs': {
    runs: ['packages/plitejs/test/react/vitest-setup.ts'],
  },
  'packages/test/src/playwright/artifacts.ts':
    'writes test output that its caller names',
  'packages/test/src/playwright/clipboard.ts':
    'reads only the lock file it writes',
  'packages/test/src/playwright/harness-scenario.ts':
    'writes the trace file that its caller names',
  'packages/test/src/playwright/test.ts':
    "writes editor-state.json in the failed test's output folder",
  'packages/test/test/node/device-witness.test.ts': {
    reads: ['packages/test/test/node/fixtures/*.json'],
  },
  'packages/test/test/proof/mobile-device-proof-command.test.ts': {
    reads: ['package.json'],
    runs: ['tooling/plite/donor/proof/mobile-device-proof.mjs'],
  },
  'packages/test/test/proof/package-scripts.test.ts': {
    reads: ['packages/test/package.json'],
  },
  'tooling/config/bunTestSetup.ts':
    'reads only the www modules Bun is loading, which the trace records, and reads the module registry without changing it',
  'tooling/config/load-trace-preload.ts':
    'reads the module registry and writes the load trace',
  'tooling/config/vitest-load-trace.mjs': 'writes the load trace',
  'tooling/plite/donor/proof/mobile-device-proof.mjs': {
    reads: ['test-results/release-proof/**'],
    runs: ['packages/test/src/proof/index.ts'],
  },
};
