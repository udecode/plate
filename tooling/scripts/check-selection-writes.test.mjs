import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { findSelectionWrites } from './check-selection-writes.mjs';

const scan = (source) => {
  const root = mkdtempSync(path.join(tmpdir(), 'selection-writes-'));
  const file = path.join(root, 'selection.ts');

  writeFileSync(file, source);

  return findSelectionWrites({
    files: [file],
    options: { lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], strict: true },
    root,
  }).map(
    ({ kind, line, method }) =>
      `${kind === 'computed-key' ? 'computed key' : method}:${line}`
  );
};

test('reports a Selection method however the code reaches it', () => {
  const found = scan(`declare const selection: Selection;
declare const key: 'getRangeAt';
declare const pick: 'removeAllRanges' | 'empty' | 'rangeCount';
declare const name: string;
selection.setBaseAndExtent(document, 0, document, 0);
const { removeAllRanges } = selection;
selection['modify']('move', 'forward', 'character');
Reflect.apply(selection.extend, selection, [document, 0]);
selection[key](0);
selection[pick]();
selection[name];
export const clear = removeAllRanges;
`);

  assert.deepEqual(found, [
    'setBaseAndExtent:5',
    'removeAllRanges:6',
    'modify:7',
    'extend:8',
    'getRangeAt:9',
    'empty:10',
    'removeAllRanges:10',
    'computed key:11',
  ]);
});

test('reports a Selection method that a computed binding name extracts', () => {
  const found = scan(`declare const selection: Selection;
declare const key: 'modify';
declare const name: string;
const { ['removeAllRanges']: clear } = selection;
const { [key]: modify } = selection;
const { [name]: anything } = selection;
clear.call(selection);
`);

  assert.deepEqual(found, ['removeAllRanges:4', 'modify:5', 'computed key:6']);
});

test('leaves Range and same-named members of other types alone', () => {
  const found = scan(`declare const range: Range;
declare const own: { collapse(): void; empty: boolean; modify(): void };
declare const rangeKey: keyof Range;
declare const ownKey: 'collapse' | 'modify';
declare const name: string;
range.collapse(true);
range[rangeKey];
range[name];
own.collapse();
own.modify();
own[ownKey]();
export const empty = own.empty;
const { ['collapse']: collapseRange } = range;
const { [ownKey]: ownMethod } = own;
`);

  assert.deepEqual(found, []);
});
