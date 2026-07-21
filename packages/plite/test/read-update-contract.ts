import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, DocumentChange, type Element } from '@platejs/plite';
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
        kind: 'text' as const,
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
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    editor.update({ tags: ['history-push', 'paste'] }, (tx) => {
      tx.text.insert('!');
    });

    assert.equal(
      editor.read((state) => state.text.string([])),
      'one!'
    );

    const commit = editor.read((state) => state.lastCommit());

    assert(commit);
    assert.equal(commit.changed.has('text'), true);
    assert.deepEqual(commit.tags, ['history-push', 'paste']);
  });

  it('exposes direct one-shot read and update methods on the lifecycle functions', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    assert.equal(editor.read.text.string([]), 'one');
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
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
    assert.equal(editor.read.lastCommit()?.changed.has('marks'), true);
  });

  it('toggles marks with mutually exclusive clear options', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update.marks.add('superscript', true);
    editor.update.marks.toggle('subscript', true, { clear: 'superscript' });

    assert.deepEqual(editor.read.marks(), { subscript: true });

    editor.update.marks.add('italic', true);
    editor.update((tx) => {
      tx.marks.toggle('subscript', true, { clear: ['italic', 'subscript'] });
    });

    assert.deepEqual(editor.read.marks(), { italic: true });
  });

  it('sets an exact expanded range without retargeting endpoints', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text' as const,
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
    const commit = editor.read.lastCommit();

    assert.equal(commit?.selectionChanged, true);
    assert.deepEqual(commit?.selectionAfter, selection);
    assert.equal(commit?.changes.empty, true);
  });

  it('rejects nested transaction writes inside a plain read', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
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

  it('rejects canonical change writes inside a plain read', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const before = editor.read.value();
    const change = DocumentChange.between(before, {
      ...before,
      children: [paragraph('one!')],
    });

    assert.throws(
      () =>
        editor.read(() => {
          editor.update((tx) => tx.changes.apply(change));
        }),
      NESTED_UPDATE_ERROR
    );
  });

  it('rejects direct update methods inside a plain read', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
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
