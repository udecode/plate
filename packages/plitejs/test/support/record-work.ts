import { join } from 'node:path';

import * as persistentMap from '../../src/core/persistent-map';

const real = { ...persistentMap };

/**
 * The record entries read by lookup and the ones walked or copied since the
 * last reset. Only record sets hold strings in a persistent map. Import this
 * module before the source it counts, which the importer then loads with a
 * dynamic `import()`.
 */
export const recordWork = { copied: 0, read: 0 };

const countRecord = (value: unknown, kind: keyof typeof recordWork) => {
  if (typeof value === 'string') recordWork[kind] += 1;
};

mock.module(
  join(import.meta.dirname, '../../src/core/persistent-map.ts'),
  () => ({
    ...real,
    persistentMapCeiling: (
      ...args: Parameters<typeof persistentMap.persistentMapCeiling>
    ) => {
      const found = real.persistentMapCeiling(...args);

      countRecord(found?.[1], 'read');

      return found;
    },
    // The mock also takes the map's own recursive calls, so each node counts
    // where it is yielded and a build counts once, at its outer call.
    *persistentMapEntries(
      node: Parameters<typeof persistentMap.persistentMapEntries>[0]
    ) {
      for (const entry of real.persistentMapEntries(node)) {
        if (entry[0] === node?.key) countRecord(entry[1], 'copied');
        yield entry;
      }
    },
    persistentMapFromSorted: (
      ...args: Parameters<typeof persistentMap.persistentMapFromSorted>
    ) => {
      if (args.length === 1) {
        for (const [, value] of args[0]) countRecord(value, 'copied');
      }

      return real.persistentMapFromSorted(...args);
    },
    // A diff reads the entries of the keys it returns.
    persistentMapChanges: (
      ...args: Parameters<typeof persistentMap.persistentMapChanges>
    ) => {
      const changed = real.persistentMapChanges(...args);

      recordWork.read += changed.length;

      return changed;
    },
    persistentMapGet: (
      ...args: Parameters<typeof persistentMap.persistentMapGet>
    ) => {
      const value = real.persistentMapGet(...args);

      countRecord(value, 'read');

      return value;
    },
  })
);
