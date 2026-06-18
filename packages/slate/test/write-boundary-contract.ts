import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/slate/internal';

import { createEditor } from '../src';

describe('editor write boundary', () => {
  const createSeededEditor = () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    return editor;
  };

  it('does not expose direct primitive writers outside editor.update', () => {
    const names = ['insertText', 'setNodes', 'delete', 'removeNodes', 'select'];

    for (const name of names) {
      const editor = createSeededEditor();

      assert.equal(name in editor, false, name);
      assert.equal(Editor.string(editor, []), 'one', name);
      assert.equal(Editor.getLastCommit(editor)?.classes[0], 'replace', name);
    }
  });

  it('replays imported operations through tx.operations.replay', () => {
    const editor = createSeededEditor();
    const staleOperationReplayKey = `apply${'Operations'}` as const;

    assert.equal('apply' in editor, false);
    assert.equal(staleOperationReplayKey in editor, false);

    editor.update((tx) => {
      tx.operations.replay([
        {
          offset: 3,
          path: [0, 0],
          text: '!',
          type: 'insert_text',
        },
      ]);
    });

    const commit = Editor.getLastCommit(editor);

    assert(commit);
    assert.equal(Editor.string(editor, []), 'one!');
    assert.deepEqual(commit.classes, ['text']);
    assert.equal(commit.operations.length, 1);
  });

  it('routes implicit writes through editor.update and tx methods', () => {
    const editor = createEditor();

    Editor.replace(editor, {
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
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.set({ type: 'heading-one' });
      tx.text.insert('TWO');
    });

    const snapshot = Editor.getSnapshot(editor);

    assert.equal(snapshot.children[0].type, 'paragraph');
    assert.equal(snapshot.children[1].type, 'heading-one');
    assert.equal(Editor.string(editor, [1]), 'TWO');
    assert.deepEqual(snapshot.selection, {
      anchor: { path: [1, 0], offset: 3 },
      focus: { path: [1, 0], offset: 3 },
    });
  });
});
