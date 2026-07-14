import path from 'node:path';

const repoRoot = path.resolve(import.meta.dir, '..');

const sourceAliases = new Map<string, string>([
  ['@platejs/browser/browser', 'packages/browser/src/browser/index.ts'],
  ['@platejs/browser/core', 'packages/browser/src/core/index.ts'],
  ['@platejs/browser/playwright', 'packages/browser/src/playwright/index.ts'],
  ['@platejs/browser/transports', 'packages/browser/src/transports/index.ts'],
  ['@platejs/code-block', 'packages/code-block/src/index.ts'],
  ['@platejs/code-block/react', 'packages/code-block/src/react/index.ts'],
  ['@platejs/core', 'packages/core/src/index.ts'],
  ['@platejs/core/react', 'packages/core/src/react/index.ts'],
  ['@platejs/core/static', 'packages/core/src/static/index.ts'],
  ['@platejs/math', 'packages/math/src/index.ts'],
  ['@platejs/math/react', 'packages/math/src/react/index.ts'],
  ['@platejs/plite', 'packages/plite/src/index.ts'],
  ['@platejs/plite/internal', 'packages/plite/src/internal/index.ts'],
  ['@platejs/plite-dom', 'packages/plite-dom/src/index.ts'],
  ['@platejs/plite-dom/internal', 'packages/plite-dom/src/internal/index.ts'],
  ['@platejs/plite-history', 'packages/plite-history/src/index.ts'],
  ['@platejs/plite-hyperscript', 'packages/plite-hyperscript/src/index.ts'],
  ['@platejs/plite-layout', 'packages/plite-layout/src/index.ts'],
  ['@platejs/plite-layout/react', 'packages/plite-layout/src/react.tsx'],
  ['@platejs/plite-react', 'packages/plite-react/src/index.ts'],
  ['@platejs/utils', 'packages/utils/src/index.ts'],
  ['@platejs/utils/react', 'packages/utils/src/react/index.ts'],
  ['@platejs/yjs', 'packages/yjs/src/index.ts'],
  ['@platejs/yjs/core', 'packages/yjs/src/core/index.ts'],
  ['@platejs/yjs/react', 'packages/yjs/src/react/index.ts'],
  ['platejs', 'packages/plate/src/index.tsx'],
  ['platejs/react', 'packages/plate/src/react/index.tsx'],
  ['platejs/static', 'packages/plate/src/static/index.ts'],
]);

const sourceAliasFilter =
  /^(?:platejs(?:\/[A-Za-z0-9_.-]+)?|@platejs\/(?:browser|code-block|core|math|plite|plite-dom|plite-history|plite-hyperscript|plite-layout|plite-react|utils|yjs)(?:\/[A-Za-z0-9_.-]+)?)$/;

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
