import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEditor,
  type Descendant,
  type Editor as EditorType,
} from '@platejs/plite';
import {
  deleteForward as editorDeleteForward,
  getChildren as editorGetChildren,
  getFragment as editorGetFragment,
  getSelection as editorGetSelection,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
} from '@platejs/plite/internal';
import { History, history } from '@platejs/plite-history';
import { createHyperscript } from '@platejs/plite-hyperscript';

import { jsx } from './index.js';

const createSelectedEditor = (): EditorType =>
  jsx(
    'editor',
    {},
    [
      jsx('element', { type: 'paragraph' }, 'alpha'),
      jsx('element', { type: 'paragraph' }, 'beta'),
    ],
    jsx(
      'selection',
      {},
      jsx('anchor', { path: [1, 0], offset: 2 }),
      jsx('focus', { path: [1, 0], offset: 2 })
    )
  ) as EditorType;

describe('plite headless contract', () => {
  it('supports package-split headless composition through source-resolved package imports', () => {
    const editor = createEditor({ extensions: [history()] });
    const input = createSelectedEditor();
    const h = createHyperscript({
      elements: {
        paragraph: { type: 'paragraph' },
      },
    });
    const fragment = h(
      'fragment',
      {},
      h('paragraph', {}, 'alpha')
    ) as Descendant[];

    assert.equal(
      editor.read((state) => History.isHistory(state.history.get())),
      true
    );

    editorReplace(editor, {
      children: editorGetChildren(input) as Descendant[],
      selection: editorGetSelection(input),
      marks: null,
    });

    const inputSelection = editorGetSelection(input)!;
    editor.update((tx) => {
      tx.fragment.insert(fragment);
    });

    const snapshot = editorGetSnapshot(editor);

    assert.deepEqual(snapshot.children, [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'bealphata' }],
      },
    ]);
    assert.deepEqual(snapshot.selection, {
      anchor: { path: [1, 0], offset: 7 },
      focus: { path: [1, 0], offset: 7 },
    });
    editor.update((tx) => {
      tx.history.undo();
    });

    assert.deepEqual(
      editorGetSnapshot(editor).children,
      editorGetChildren(input)
    );
    assert.deepEqual(editorGetSnapshot(editor).selection, inputSelection);
  });

  it('lets hyperscript-built selections drive core fragment extraction without React', () => {
    const h = createHyperscript({
      elements: {
        paragraph: { type: 'paragraph' },
      },
    });
    const input = h(
      'editor',
      {},
      h('paragraph', {}, 'word'),
      h(
        'selection',
        {},
        h('anchor', { path: [0, 0], offset: 1 }),
        h('focus', { path: [0, 0], offset: 3 })
      )
    ) as EditorType;
    const editor = createEditor();

    editorReplace(editor, {
      children: editorGetChildren(input) as Descendant[],
      selection: editorGetSelection(input),
      marks: null,
    });

    assert.deepEqual(editorGetFragment(editor), [
      {
        type: 'paragraph',
        children: [{ text: 'or' }],
      },
    ]);
  });

  it('lets headless selections drive character deletion without React', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'word' }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      marks: null,
    });

    editorDeleteForward(editor);

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'wrd' }],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });
});
