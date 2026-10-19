import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import {
  persistentMapChanges,
  persistentMapDelete,
  persistentMapEntries,
  type PersistentMapNode,
  persistentMapSet,
} from '../src/core/persistent-map';

const keyArbitrary = fc.integer({ max: 300, min: 0 }).map(String);

describe('persistentMapChanges', () => {
  it('names every key two versions disagree on, in key order, across writes that rebalance the tree', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(keyArbitrary, fc.integer({ max: 3, min: 0 })), {
          maxLength: 300,
        }),
        fc.array(
          fc.tuple(keyArbitrary, fc.option(fc.integer({ max: 3, min: 0 }))),
          { maxLength: 40 }
        ),
        (base, writes) => {
          let before: PersistentMapNode<number> | null = null;

          for (const [key, value] of base) {
            before = persistentMapSet(before, key, value);
          }

          let after = before;

          for (const [key, value] of writes) {
            after =
              value === null
                ? persistentMapDelete(after, key)
                : persistentMapSet(after, key, value);
          }

          const old = new Map(persistentMapEntries(before));
          const now = new Map(persistentMapEntries(after));
          const expected = [...new Set([...old.keys(), ...now.keys()])]
            .filter((key) => old.get(key) !== now.get(key))
            .sort();

          assert.deepEqual(persistentMapChanges(before, after), expected);
          assert.deepEqual(persistentMapChanges(after, before), expected);
        }
      ),
      { numRuns: 300 }
    );
  });
});
