import path from 'node:path';

import { getWorkspaceSourceEntries } from './workspace-source-entries.mjs';

const workspaceDistEntryFilter = /\/packages\/.*\/dist\/.*\.js$/;
const workspaceSpecifierFilter = /^(?:@platejs\/|@udecode\/|platejs(?:\/|$))/;
const repoRoot = path.resolve(import.meta.dir, '..');
const sourceEntries = getWorkspaceSourceEntries(repoRoot);
const sourceEntryByDistEntry = new Map(
  sourceEntries.map(({ distEntry, sourceEntry }) => [distEntry, sourceEntry])
);
const sourceEntryBySpecifier = new Map(
  sourceEntries.map(({ sourceEntry, specifier }) => [specifier, sourceEntry])
);

Bun.plugin({
  name: 'plite-source-aliases',
  setup(build) {
    build.onResolve({ filter: workspaceSpecifierFilter }, (args) => {
      const sourceEntry = sourceEntryBySpecifier.get(args.path);

      if (sourceEntry) return { path: sourceEntry };
    });
    build.onLoad({ filter: workspaceDistEntryFilter }, (args) => {
      const sourceEntry = sourceEntryByDistEntry.get(args.path);

      if (!sourceEntry) return;

      return {
        contents: `export * from ${JSON.stringify(sourceEntry)};`,
        loader: 'js',
      };
    });
  },
});
