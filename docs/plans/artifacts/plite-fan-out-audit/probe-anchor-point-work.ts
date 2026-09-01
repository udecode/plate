import assert from 'node:assert/strict';
import { createEditor, DocumentChange } from '../../../../packages/plitejs/src';

const rows = [];
for (const count of [100, 1000, 10_000]) {
  const editor = createEditor({ initialValue: [{ type: 'paragraph', children: [{ text: 'abcdefghijk' }] }] });
  const anchors = Array.from({ length: count }, () => editor.anchor({ anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 8 } }, { association: 'inward', deletion: 'drop' }));
  const original = DocumentChange.prototype.mapPosition;
  let mappings = 0;
  DocumentChange.prototype.mapPosition = function (...args) {
    mappings++;
    return original.apply(this, args);
  };
  try {
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
  } finally {
    DocumentChange.prototype.mapPosition = original;
  }
  for (const anchor of anchors) assert.deepEqual(anchor.resolve(), { anchor: { path: [0, 0], offset: 1 }, focus: { path: [0, 0], offset: 9 } });
  const samples = [];
  for (let i = 0; i < 31; i++) {
    const start = performance.now();
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } });
    if (i > 0) samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  anchors.forEach(anchor => anchor.release());
  rows.push({ count, mappings, medianMs: samples[14], p95Ms: samples[28], maxMs: samples[29] });
}
console.log(JSON.stringify(rows));
