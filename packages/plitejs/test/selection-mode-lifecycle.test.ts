import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  type Descendant,
  schema,
  SelectionApi,
} from 'plitejs';
import { authored } from 'plitejs/authored';

import { History, history } from '../src/history';
import { initializePlugins } from '../src/internal';
import { getEditorLiveSelection } from '../src/testing';
import { createYjsEditorAdapter } from '../src/yjs/core/editor-adapter';

const objectSchema = defineEditorSchema('schema:selection-mode-lifecycle', {
  elements: {
    media: {
      content: schema.content.text({ default: 'text', min: 1 }),
      object: true,
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  id: 'selection-mode-lifecycle',
  root: schema.content.types(['media', 'paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  roots: {
    header: schema.content.types(['media', 'paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
  },
  unknown: 'reject',
  version: 1,
});

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});
const media = (text = 'caption'): Descendant => ({
  type: 'media',
  children: [{ text }],
});

const createObjectEditor = (withHistory = false) => {
  const editor = createEditor({
    plugins: [...(withHistory ? [history()] : []), objectSchema],
    initialValue: {
      children: [paragraph('before'), media(), paragraph('after')],
      roots: { header: [paragraph('top'), media('header caption')] },
    },
  });

  editor.update.selection.setNodes([[1]], { mode: 'object' });

  return editor;
};

const objectAt = (path: number[], root?: string) =>
  SelectionApi.nodes([path], {
    mode: 'object',
    ...(root === undefined ? {} : { root }),
  });

describe('node selection mode lifecycle', () => {
  it('keeps an object pick while edits move its object', () => {
    const editor = createObjectEditor();

    editor.update((tx) => {
      tx.nodes.insert(paragraph('new'), { at: [0] });
    });
    assert.deepEqual(getEditorLiveSelection(editor), objectAt([2]));

    editor.update((tx) => {
      tx.nodes.move({ at: [2], to: [0] });
    });
    assert.deepEqual(getEditorLiveSelection(editor), objectAt([0]));
  });

  it('turns an object pick into a block pick when its node stops being an object', () => {
    const editor = createObjectEditor();

    editor.update((tx) => {
      tx.nodes.set({ type: 'paragraph' }, { at: [1] });
    });

    assert.deepEqual(
      getEditorLiveSelection(editor),
      SelectionApi.nodes([[1]], { mode: 'block' })
    );
  });

  it('restores an object pick through undo, redo and persisted history', () => {
    const editor = createObjectEditor(true);

    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });
    editor.api.history.undo();
    assert.deepEqual(getEditorLiveSelection(editor), objectAt([1]));

    editor.api.history.redo();
    editor.api.history.undo();
    assert.deepEqual(getEditorLiveSelection(editor), objectAt([1]));

    editor.api.history.redo();

    const json = JSON.parse(JSON.stringify(History.toJSON(editor)));
    const restored = createEditor({
      plugins: [history(), objectSchema],
      initialValue: editor.read.value(),
    });

    restored.update((tx) =>
      tx.history.restore(History.fromJSON(restored, json))
    );
    restored.api.history.undo();
    assert.deepEqual(getEditorLiveSelection(restored), objectAt([1]));
  });

  it('keeps an object pick through value and children replacement', () => {
    const editor = createObjectEditor();
    const selection = objectAt([1]);

    editor.update((tx) =>
      tx.value.replace({
        children: [paragraph('x'), media('y')],
        selection,
      })
    );
    assert.deepEqual(getEditorLiveSelection(editor), selection);

    const [current] = editor.read.nodes.get([1])!;

    editor.update((tx) => {
      tx.nodes.replaceChildren([paragraph('z'), current as Descendant], {
        at: [],
      });
    });
    assert.deepEqual(getEditorLiveSelection(editor), selection);
  });

  it('keeps an object pick in a root view', () => {
    const editor = createObjectEditor();
    const header = createEditorView(editor, { root: 'header' });

    header.update.selection.setNodes([[1]], { mode: 'object' });
    assert.deepEqual(getEditorLiveSelection(header), objectAt([1], 'header'));

    header.update((tx) =>
      tx.value.replace({
        children: [paragraph('top'), media('next caption')],
        selection: SelectionApi.nodes([[1]], { mode: 'object' }),
      })
    );
    assert.deepEqual(getEditorLiveSelection(header), objectAt([1], 'header'));
  });

  it('keeps an object pick given as the initial selection', () => {
    const editor = createEditor({
      initialSelection: objectAt([1]),
      initialValue: {
        children: [paragraph('before'), media()],
        roots: { header: [paragraph('top')] },
      },
      plugins: [objectSchema],
    });

    assert.deepEqual(getEditorLiveSelection(editor), objectAt([1]));
  });

  it('keeps an object pick in a snapshot that plugin publication adopts', () => {
    const editor = createEditor();

    initializePlugins(editor, [objectSchema], {
      initialValue: () => ({
        children: [paragraph('before'), media()],
        roots: { header: [paragraph('top')] },
        selection: objectAt([1]),
      }),
    });

    assert.deepEqual(getEditorLiveSelection(editor), objectAt([1]));
  });

  it('keeps an object pick through a proposed edit', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('before'), media(), paragraph('after')],
        roots: { header: [paragraph('top')] },
      },
      plugins: [history(), authored({ authorId: 'alice' }), objectSchema],
    });
    const view = createEditorView(editor, { authored: { intent: 'propose' } });

    view.update.selection.setNodes([[1]], { mode: 'object' });
    view.update((tx) => {
      tx.text.insert('x', { at: { offset: 0, path: [0, 0] } });
    });

    assert.deepEqual(getEditorLiveSelection(view), objectAt([1]));
  });

  it('keeps an object pick through an explicit collaboration import', () => {
    const editor = createObjectEditor();
    const adapter = createYjsEditorAdapter(editor, (_root, value) => value);

    adapter.applyRemote({ effects: [], selection: objectAt([1]) });

    assert.deepEqual(getEditorLiveSelection(editor), objectAt([1]));
  });
});
