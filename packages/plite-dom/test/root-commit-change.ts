import {
  createEditor,
  createEditorView,
  type Descendant,
} from '@platejs/plite';
import { history } from '@platejs/plite-history';

import { dom } from '../src';
import {
  EDITOR_TO_ROOT_VIEW_EDITORS,
  EDITOR_TO_USER_SELECTION,
} from '../src/internal';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

describe('root commit handling', () => {
  test('uses change roots for DOM key preservation during sibling-root history replay', () => {
    const editor = createEditor({
      extensions: [history(), dom()],
      initialValue: {
        children: [paragraph('first'), paragraph('second')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(editor, { root: 'header' });
    const mainEditor = createEditorView(editor);

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [1, 0], offset: 'second'.length },
        focus: { path: [1, 0], offset: 'second'.length },
      });
      tx.text.insert('!');
    });

    expect(() => {
      headerEditor.update((tx) => {
        tx.history.undo();
      });
    }).not.toThrow();

    expect(editor.read((state) => state.value())).toEqual({
      children: [paragraph('first'), paragraph('second')],
      roots: { header: [paragraph('header')] },
    });
  });

  test('clears root view user selection anchors on explicit selection changes', () => {
    const editor = createEditor({
      extensions: [dom()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(editor, { root: 'header' });
    const selectionAnchor = headerEditor.anchor(
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 6 },
      },
      { association: 'inward', deletion: 'nearest' }
    );

    EDITOR_TO_ROOT_VIEW_EDITORS.set(editor, new Set([headerEditor]));
    EDITOR_TO_USER_SELECTION.set(headerEditor, selectionAnchor);

    headerEditor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 3 });
    });

    expect(EDITOR_TO_USER_SELECTION.has(headerEditor)).toBe(false);
  });
});
