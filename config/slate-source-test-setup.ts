import path from 'node:path';

const repoRoot = path.resolve(import.meta.dir, '..');

const sourceAliases = new Map<string, string>([
  ['@platejs/browser/browser', 'packages/browser/src/browser/index.ts'],
  ['@platejs/browser/core', 'packages/browser/src/core/index.ts'],
  ['@platejs/browser/playwright', 'packages/browser/src/playwright/index.ts'],
  ['@platejs/browser/transports', 'packages/browser/src/transports/index.ts'],
  ['@platejs/slate', 'packages/slate/src/index.ts'],
  ['@platejs/slate/internal', 'packages/slate/src/internal/index.ts'],
  ['@platejs/slate-dom', 'packages/slate-dom/src/index.ts'],
  ['@platejs/slate-dom/internal', 'packages/slate-dom/src/internal/index.ts'],
  ['@platejs/slate-history', 'packages/slate-history/src/index.ts'],
  ['@platejs/slate-hyperscript', 'packages/slate-hyperscript/src/index.ts'],
  ['@platejs/slate-layout', 'packages/slate-layout/src/index.ts'],
  ['@platejs/slate-layout/react', 'packages/slate-layout/src/react.tsx'],
  ['@platejs/slate-react', 'packages/slate-react/src/index.ts'],
  ['@platejs/yjs', 'packages/yjs/src/index.ts'],
  ['@platejs/yjs/core', 'packages/yjs/src/core/index.ts'],
  ['@platejs/yjs/internal', 'packages/yjs/src/internal/index.ts'],
  ['@platejs/yjs/react', 'packages/yjs/src/react/index.ts'],
]);

const sourceAliasFilter =
  /^@platejs\/(?:browser|slate|slate-dom|slate-history|slate-hyperscript|slate-layout|slate-react|yjs)(?:\/[A-Za-z0-9_.-]+)?$/;

Bun.plugin({
  name: 'slate-source-test-aliases',
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

await import('./slate-test-jsx.js');
await import('../tooling/config/bunTestSetup.ts');
