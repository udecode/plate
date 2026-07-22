import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ChangeSet,
  DocumentSlice,
  getChangeSetRelocations,
  IndexedDocument,
} from '../src/core/document-change';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('DocumentChange relocation scaling', () => {
  it('bounds a disjoint 2,000-node candidate scan', () => {
    const before = IndexedDocument.fromValue(
      Array.from({ length: 2000 }, (_, index) => paragraph(`before-${index}`))
    );
    const after = IndexedDocument.fromValue(
      Array.from({ length: 2000 }, (_, index) => paragraph(`after-${index}`))
    );
    const change = ChangeSet.create(before, {
      from: 0,
      insert: DocumentSlice.fromNodes(after.value),
      to: before.length,
    });
    const startedAt = performance.now();
    const relocations = getChangeSetRelocations(change, before, after);
    const duration = performance.now() - startedAt;

    assert.deepEqual(relocations, []);
    assert.ok(
      duration < 500,
      `2,000-node relocation scan took ${duration.toFixed(1)}ms`
    );
  });

  it('bounds maximal selection for 10,000 unique relocations', () => {
    const before = IndexedDocument.fromValue(
      Array.from({ length: 10_000 }, (_, index) => paragraph(String(index)))
    );
    const after = IndexedDocument.fromValue(
      Array.from({ length: 10_000 }, (_, index) => ({
        children: [paragraph(String(index))],
        type: 'quote',
      }))
    );
    const change = ChangeSet.between(before, after);
    const startedAt = performance.now();
    const relocations = getChangeSetRelocations(change, before, after);
    const duration = performance.now() - startedAt;

    assert.equal(relocations.length, 10_000);
    assert.deepEqual(
      [relocations[0], relocations.at(-1)],
      [
        { path: [0], targetPath: [0, 0] },
        { path: [9999], targetPath: [9999, 0] },
      ]
    );
    assert.ok(
      duration < 750,
      `10,000-node relocation selection took ${duration.toFixed(1)}ms`
    );
  });
});
