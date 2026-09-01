import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { DocumentIndex } from '../../../../packages/plitejs/src/core/change/document-index.ts';
import { RootChange } from '../../../../packages/plitejs/src/core/change/root-change.ts';
import { PreparedTokenSlice } from '../../../../packages/plitejs/src/core/change/tokens.ts';
import { writeBenchmarkArtifact } from '../../../../benchmarks/slate-v2/donor/shared/stats.mjs';

const rows = [];
for (const blocks of [1000, 10000]) {
  for (const edits of [1, 30, 120]) {
    const before = DocumentIndex.fromValue(Array.from({ length: blocks }, (_, index) => ({
      type: 'paragraph', children: [{ text: `block-${index}` }],
    })));
    const change = RootChange.create(before, Array.from({ length: edits }, (_, index) => ({
      from: before.nodeRange([index, 0]).from + 1,
      insert: PreparedTokenSlice.text('!'),
    })));
    const fromIndexedValue = DocumentIndex.fromIndexedValue;
    let rootPublications = 0;
    DocumentIndex.fromIndexedValue = function (indexed) {
      if (indexed.value.length === blocks) rootPublications++;
      return fromIndexedValue.call(this, indexed);
    };
    let actual;
    try {
      actual = change.apply(before);
    } finally {
      DocumentIndex.fromIndexedValue = fromIndexedValue;
    }
    const start = performance.now();
    change.apply(before);
    const currentMs = performance.now() - start;
    const targetStart = performance.now();
    const children = [...before.value];
    for (let index = 0; index < edits; index++) {
      const node = children[index];
      children[index] = Object.freeze({ ...node, children: Object.freeze([
        Object.freeze({ ...node.children[0], text: '!' + node.children[0].text }),
      ]) });
    }
    const target = DocumentIndex.fromValue(Object.freeze(children));
    const targetMs = performance.now() - targetStart;
    assert.deepEqual(actual.value, target.value);
    assert.equal(actual.value[blocks - 1], before.value[blocks - 1]);
    const row = { blocks, edits, rootPublications, currentMs, targetMs };
    rows.push(row);
    console.log(JSON.stringify(row));
  }
}
await writeBenchmarkArtifact('docs/plans/artifacts/plite-fan-out-audit/batched-text-publication-probe.json', {
  purpose: 'One-sample causal probe, not a percentile. The target publishes one root but deliberately rebuilds its complete index; the durable target should reuse the existing grouped path-update owner.',
  rows,
  source: Object.fromEntries([
    'packages/plitejs/src/core/change/root-change.ts',
    'packages/plitejs/src/core/change/document-index.ts',
  ].map((file) => [file, createHash('sha256').update(readFileSync(file)).digest('hex')])),
});
