import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import * as Plite from '../src';
import { createEditor, type Descendant } from '../src';
import { getTestEditorSnapshot, replaceEditorValue } from './support/snapshot';

const repoRoot = resolve(import.meta.dir, '../../..');

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('test helper snapshot boundary', () => {
  it('keeps full snapshots in test support instead of public Plite exports', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('test snapshot')],
      selection: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 8 },
      },
    });

    const snapshot = getTestEditorSnapshot(editor);

    assert.deepEqual(snapshot.children, [paragraph('test snapshot')]);
    assert.deepEqual(snapshot.selection, {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 8 },
    });
    assert.equal('getTestEditorSnapshot' in Plite, false);
  });

  it('implements the helper through the runtime snapshot state group', () => {
    const helperSource = readFileSync(
      resolve(repoRoot, 'packages/plite/test/support/snapshot.ts'),
      'utf8'
    );

    assert.match(helperSource, /state\.runtime\.snapshot\(\)/);
    assert.equal(/\bEditor\.getSnapshot\b/.test(helperSource), false);
    assert.equal(
      /from ['"]@platejs\/plite\/internal['"]/.test(helperSource),
      false
    );
  });

  it('seeds editor values through the public update transaction helper', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('seeded')],
      selection: null,
    });

    assert.deepEqual(
      editor.read((state) => state.runtime.snapshot().children),
      [paragraph('seeded')]
    );

    const helperSource = readFileSync(
      resolve(repoRoot, 'packages/plite/test/support/snapshot.ts'),
      'utf8'
    );

    assert.match(helperSource, /tx\.value\.replace\(input\)/);
    assert.equal(/\bEditor\.replace\b/.test(helperSource), false);
  });
});
