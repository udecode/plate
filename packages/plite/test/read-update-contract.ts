import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Element } from '@platejs/plite';
import { replaceEditorValue } from './support/snapshot';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const NESTED_UPDATE_ERROR =
  /editor\.update cannot be started inside editor\.read/;

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
      selection: state.selection(),
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

    const commit = editor.read((state) => state.lastCommit());

    assert(commit);
    assert.deepEqual(commit.classes, ['text']);
    assert.deepEqual(commit.tags, ['history-push', 'paste']);
  });

  it('exposes direct one-shot read and update methods on the lifecycle functions', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    assert.equal(editor.read.text.string([]), 'one');
    assert.deepEqual(editor.read.selection(), {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.equal(editor.read.schema.isBlock(paragraph('block')), true);
    assert.deepEqual(editor.read.nodes.get([0]), [paragraph('one'), [0]]);

    editor.update.text.insert('!');
    editor.update.nodes.insert(paragraph('two'), { at: [1] });
    editor.update.marks.toggle('bold');

    assert.equal(editor.read.text.string([]), 'one!two');
    assert.deepEqual(editor.read.value().children, [
      paragraph('one!'),
      paragraph('two'),
    ]);
    assert.deepEqual(editor.read.marks(), { bold: true });
    assert.equal(editor.read.lastCommit()?.classes.includes('mark'), true);
  });

  it('sets an exact expanded range without retargeting endpoints', () => {
    const editor = createEditor();
    const selection = {
      anchor: { path: [0, 1, 0, 0, 0], offset: 2 },
      focus: { path: [0, 0, 1, 0, 0], offset: 2 },
    };

    replaceEditorValue(editor, {
      children: [
        {
          type: 'table',
          children: [
            {
              type: 'tr',
              children: [
                {
                  type: 'td',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ text: 'one' }],
                    },
                  ],
                },
                {
                  type: 'td',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ text: 'two' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tr',
              children: [
                {
                  type: 'td',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ text: 'three' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      selection: null,
    });

    editor.update((tx) => {
      tx.selection.set(selection);
    });

    assert.deepEqual(
      editor.read((state) => state.selection()),
      selection
    );
    const operation = editor.read((state) => state.operations()).at(-1);

    assert.equal(operation?.type, 'set_selection');
    assert.deepEqual(operation?.newProperties, selection);
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
      NESTED_UPDATE_ERROR
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
      NESTED_UPDATE_ERROR
    );
  });

  it('rejects direct update methods inside a plain read', () => {
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
          editor.update.text.insert('!');
        }),
      NESTED_UPDATE_ERROR
    );
  });
});
