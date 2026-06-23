import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEditor,
  type Descendant,
  type Editor as PliteEditor,
} from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';
import { History, history } from '@platejs/plite-history';
import { createHyperscript } from '@platejs/plite-hyperscript';

import { jsx } from './index.js';

const createSelectedEditor = (): PliteEditor =>
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
  ) as PliteEditor;

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

    Editor.replace(editor, {
      children: Editor.getChildren(input) as Descendant[],
      selection: Editor.getSelection(input),
      marks: null,
    });

    const inputSelection = Editor.getSelection(input)!;
    editor.update((tx) => {
      tx.fragment.insert(fragment);
    });

    const snapshot = Editor.getSnapshot(editor);

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
      Editor.getSnapshot(editor).children,
      Editor.getChildren(input)
    );
    assert.deepEqual(Editor.getSnapshot(editor).selection, inputSelection);
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
    ) as PliteEditor;
    const editor = createEditor();

    Editor.replace(editor, {
      children: Editor.getChildren(input) as Descendant[],
      selection: Editor.getSelection(input),
      marks: null,
    });

    assert.deepEqual(Editor.getFragment(editor), [
      {
        type: 'paragraph',
        children: [{ text: 'or' }],
      },
    ]);
  });

  it('lets headless selections drive character deletion without React', () => {
    const editor = createEditor();

    Editor.replace(editor, {
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

    Editor.deleteForward(editor);

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'wrd' }],
      },
    ]);
    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });
});
