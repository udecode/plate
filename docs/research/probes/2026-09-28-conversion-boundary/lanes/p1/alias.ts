// Lane P1 preload: config/plite-source-aliases.ts plus an optional Plite source
// override, so baseline and candidate runs load the same Plate source and differ
// only in the Plite tree. P1_PLITE_SRC is a directory relative to the repo root
// that mirrors packages/plitejs/src. tsconfig `paths` resolve `plitejs` before
// runtime plugins, so the override swaps module contents at load time and keeps
// every module path unchanged.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { getWorkspaceSourceEntries } from '../../../../../../config/workspace-source-entries.mjs';

const workspaceDistEntryFilter = /\/packages\/.*\/dist\/.*\.js$/;
const workspaceSpecifierFilter =
  /^(?:@platejs\/|platejs(?:\/|$)|plitejs(?:\/|$))/;
const pliteSourceFilter = /\/packages\/plitejs\/src\/.*\.tsx?$/;
const repoRoot = path.resolve(import.meta.dir, '../../../../../..');
const pliteSource = path.join(repoRoot, 'packages/plitejs/src');
const override = process.env.P1_PLITE_SRC
  ? path.resolve(repoRoot, process.env.P1_PLITE_SRC)
  : null;
const sourceEntries = getWorkspaceSourceEntries(repoRoot);
const sourceEntryByDistEntry = new Map(
  sourceEntries.map(({ distEntry, sourceEntry }) => [distEntry, sourceEntry])
);
const sourceEntryBySpecifier = new Map(
  sourceEntries.map(({ sourceEntry, specifier }) => [specifier, sourceEntry])
);

Bun.plugin({
  name: 'p1-plite-source-aliases',
  setup(build) {
    build.onResolve({ filter: workspaceSpecifierFilter }, (args) => {
      const sourceEntry = sourceEntryBySpecifier.get(args.path);

      if (sourceEntry) return { path: sourceEntry };

      return undefined;
    });
    build.onLoad({ filter: workspaceDistEntryFilter }, (args) => {
      const sourceEntry = sourceEntryByDistEntry.get(args.path);

      if (!sourceEntry) return undefined;

      return {
        contents: `export * from ${JSON.stringify(sourceEntry)};`,
        loader: 'js',
      };
    });
    if (!override) return;
    build.onLoad({ filter: pliteSourceFilter }, (args) => {
      const replacement = path.join(
        override,
        path.relative(pliteSource, args.path)
      );

      if (!existsSync(replacement)) {
        throw new Error(`P1_PLITE_SRC is missing ${replacement}.`);
      }

      return {
        contents: readFileSync(replacement, 'utf8'),
        loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
      };
    });
  },
});
