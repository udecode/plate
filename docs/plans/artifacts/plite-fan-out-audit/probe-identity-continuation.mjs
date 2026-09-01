import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { createEditor } from '../../../../packages/plitejs/src/index.ts';
import { DocumentIndex } from '../../../../packages/plitejs/src/core/change/document-index.ts';
import * as Editor from '../../../../packages/plitejs/src/internal/index.ts';
import { writeBenchmarkArtifact } from '../../../../benchmarks/slate-v2/donor/shared/stats.mjs';

const counterfactual = process.env.PLITE_IDENTITY_COUNTERFACTUAL === '1';
assert.equal(Boolean(globalThis.__fanoutIdentityCounterfactualLoaded), counterfactual);
const document = (blocks, prefix) => Array.from({ length: blocks }, (_, index) => ({
  type: 'paragraph', children: [{ text: `${prefix}-${index} ${'x'.repeat(24)}` }],
}));
const rows = [];
for (const blocks of (process.env.PLITE_IDENTITY_BLOCKS ?? '100,1000,10000').split(',').map(Number)) {
  const editor = createEditor();
  Editor.replace(editor, { children: document(blocks, 'block'), marks: null, selection: null });
  const before = Editor.getSnapshot(editor);
  const beforeLastKey = before.index.keyAt([blocks - 1, 0]);
  const children = document(blocks, 'canonical');
  const readNode = DocumentIndex.prototype.node;
  let nodeReads = 0;
  DocumentIndex.prototype.node = function (...args) {
    nodeReads++;
    return readNode.apply(this, args);
  };
  const start = performance.now();
  try {
    editor.update((tx) => tx.value.replace({ children, marks: null, selection: null }));
  } finally {
    DocumentIndex.prototype.node = readNode;
  }
  const durationMs = performance.now() - start;
  const after = Editor.getSnapshot(editor);
  assert.deepEqual(after.children, children);
  assert.equal(before.index.keyAt([blocks - 1, 0]), beforeLastKey);
  const lastKey = after.index.keyAt([blocks - 1, 0]);
  editor.update((tx) => tx.text.insert('!', { at: { path: [blocks - 1, 0], offset: 0 } }));
  const followUp = Editor.getSnapshot(editor);
  assert.equal(followUp.index.keyAt([blocks - 1, 0]), lastKey);
  assert.equal(followUp.children[blocks - 1].children[0].text, '!' + children[blocks - 1].children[0].text);
  const row = { blocks, nodeReads, durationMs };
  rows.push(row);
  console.log(JSON.stringify(row));
}
await writeBenchmarkArtifact(`docs/plans/artifacts/plite-fan-out-audit/identity-continuation-${counterfactual ? 'cut' : 'current'}-probe.json`, {
  purpose: 'Single-sample causal counterfactual, not a percentile. The preload removes only generic text-containment matching; canonical positional, explicit and relocation identities remain.',
  counterfactual,
  rows,
  source: Object.fromEntries([
    'packages/plitejs/src/core/snapshot-index.ts',
    'packages/plitejs/src/core/change/document-index.ts',
    'packages/plitejs/src/core/change/root-change.ts',
    'packages/plitejs/src/core/public-state.ts',
  ].map((file) => [file, createHash('sha256').update(readFileSync(file)).digest('hex')])),
});
