import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, DocumentChange } from 'plitejs';

import {
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '../src/internal';

describe('editor write boundary', () => {
  const createSeededEditor = () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    return editor;
  };

  it('does not expose direct primitive writers outside editor.update', () => {
    const names = ['insertText', 'setNodes', 'delete', 'removeNodes', 'select'];

    for (const name of names) {
      const editor = createSeededEditor();

      assert.equal(name in editor, false, name);
      assert.equal(editorString(editor, []), 'one', name);
      assert.equal(
        editorGetLastCommit(editor)?.changed.has('replace'),
        true,
        name
      );
    }
  });

  it('applies imported canonical changes through the transaction boundary', () => {
    const editor = createSeededEditor();
    const before = editor.read.value();
    const change = DocumentChange.between(before, {
      ...before,
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one!' }],
        },
      ],
    });

    editor.update((tx) => tx.changes.apply(change));

    const commit = editorGetLastCommit(editor);

    assert.ok(commit);
    assert.equal(editorString(editor, []), 'one!');
    assert.equal(commit.changed.has('text'), true);
    assert.equal(commit.changes.empty, false);
  });

  it('routes implicit writes through editor.update and tx methods', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'two' }],
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      },
    });

    editor.update((tx) => {
      tx.nodes.set({ type: 'heading-one' });
      tx.text.insert('TWO');
    });

    const snapshot = editorGetSnapshot(editor);

    assert.equal(snapshot.children[0].type, 'paragraph');
    assert.equal(snapshot.children[1].type, 'heading-one');
    assert.equal(editorString(editor, [1]), 'TWO');
    assert.deepEqual(snapshot.selection, {
      kind: 'text',
      anchor: { path: [1, 0], offset: 3 },
      focus: { path: [1, 0], offset: 3 },
    });
  });
});
