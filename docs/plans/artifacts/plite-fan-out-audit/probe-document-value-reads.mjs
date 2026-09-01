import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { createEditor, defineEditorSchema, schema } from '../../../../packages/plitejs/src/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../../../benchmarks/slate-v2/donor/shared/stats.mjs';

const extension = defineEditorSchema('fanout-document-read', {
  id: 'fanout-document-read', version: 1, unknown: 'reject',
  elements: { paragraph: { content: schema.content.text() } },
  root: schema.content.type('paragraph', { min: 1 }),
  roots: { notes: schema.content.type('paragraph', { min: 1 }) },
});
const paragraph = (text) => ({ type: 'paragraph', children: [{ text }] });
const rows = [];
for (const blocks of [100, 1000, 10000, 50000]) {
  const editor = createEditor({ extensions: [extension], initialValue: {
    children: Array.from({ length: blocks }, (_, index) => paragraph(`block-${index}`)),
    roots: { notes: [paragraph('notes')] },
  } });
  const children = editor.read.children();
  const samples = [];
  for (let iteration = 0; iteration < 21; iteration++) {
    const before = performance.now();
    const value = editor.read.value();
    const duration = performance.now() - before;
    assert.equal(value.children, children);
    assert.equal(Object.isFrozen(value), true);
    if (iteration) samples.push(duration);
  }
  const row = { blocks, readMs: summarize(samples) };
  rows.push(row);
  console.log(JSON.stringify(row));
}
await writeBenchmarkArtifact(`docs/plans/artifacts/plite-fan-out-audit/document-value-read-${process.env.PLITE_VALUE_PROBE_LABEL ?? 'current'}.json`, {
  purpose: 'Focused immutable value-read attribution, twenty unprofiled samples; the canonical schema target still owns projected clipboard closure.', rows,
  source: createHash('sha256').update(readFileSync('packages/plitejs/src/core/public-state.ts')).digest('hex'),
});
