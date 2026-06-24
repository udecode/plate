import path from 'node:path';

const repoRoot = path.resolve(import.meta.dir, '..');

const sourceAliases = new Map<string, string>([
  ['@platejs/browser/browser', 'packages/browser/src/browser/index.ts'],
  ['@platejs/browser/core', 'packages/browser/src/core/index.ts'],
  ['@platejs/browser/playwright', 'packages/browser/src/playwright/index.ts'],
  ['@platejs/browser/transports', 'packages/browser/src/transports/index.ts'],
  ['@platejs/plite', 'packages/plite/src/index.ts'],
  ['@platejs/plite/internal', 'packages/plite/src/internal/index.ts'],
  ['@platejs/plite-dom', 'packages/plite-dom/src/index.ts'],
  ['@platejs/plite-dom/internal', 'packages/plite-dom/src/internal/index.ts'],
  ['@platejs/plite-history', 'packages/plite-history/src/index.ts'],
  ['@platejs/plite-hyperscript', 'packages/plite-hyperscript/src/index.ts'],
  ['@platejs/plite-layout', 'packages/plite-layout/src/index.ts'],
  ['@platejs/plite-layout/react', 'packages/plite-layout/src/react.tsx'],
  ['@platejs/plite-react', 'packages/plite-react/src/index.ts'],
  ['@platejs/yjs', 'packages/yjs/src/index.ts'],
  ['@platejs/yjs/core', 'packages/yjs/src/core/index.ts'],
  ['@platejs/yjs/internal', 'packages/yjs/src/internal/index.ts'],
  ['@platejs/yjs/react', 'packages/yjs/src/react/index.ts'],
]);

const sourceAliasFilter =
  /^@platejs\/(?:browser|plite|plite-dom|plite-history|plite-hyperscript|plite-layout|plite-react|yjs)(?:\/[A-Za-z0-9_.-]+)?$/;

Bun.plugin({
  name: 'plite-source-test-aliases',
  setup(build) {
    build.onResolve(
      {
        filter: sourceAliasFilter,
      },
      (args) => {
        const sourcePath = sourceAliases.get(args.path);

        if (!sourcePath) return;

        return {
          path: path.join(repoRoot, sourcePath),
        };
      }
    );
  },
});

await import('./plite-test-jsx.js');
await import('../tooling/config/bunTestSetup.ts');
