import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Descendant } from '../src';
import { replaceEditorValue } from './support/snapshot';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('read/update contract', () => {
  it('exposes a coherent read boundary and an update boundary with commit tags', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const state = editor.read((state) => ({
      children: state.runtime.snapshot().children,
      selection: state.selection.get(),
    }));

    assert.deepEqual(state.children, [paragraph('one')]);
    assert.deepEqual(state.selection, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    editor.update(
      (tx) => {
        tx.text.insert('!');
      },
      { tag: ['history-push', 'paste'] }
    );

    assert.equal(
      editor.read((state) => state.text.string([])),
      'one!'
    );

    const commit = editor.read((state) => state.value.lastCommit());

    assert(commit);
    assert.deepEqual(commit.classes, ['text']);
    assert.deepEqual(commit.tags, ['history-push', 'paste']);
  });

  it('rejects nested transaction writes inside a plain read', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    assert.throws(
      () =>
        editor.read(() => {
          editor.update((tx) => {
            tx.text.insert('!');
          });
        }),
      /editor\.update cannot be started inside editor\.read/
    );
  });

  it('rejects replay writes inside a plain read', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    assert.throws(
      () =>
        editor.read(() => {
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
        }),
      /editor\.update cannot be started inside editor\.read/
    );
  });
});
