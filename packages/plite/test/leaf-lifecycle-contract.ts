import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getChildren as editorGetChildren,
  getSelection as editorGetSelection,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import { createEditor, type Descendant, NodeApi, TextApi } from '../src';

const richTextParagraph = (): Descendant => ({
  type: 'paragraph',
  children: [
    { text: 'This is editable ' },
    { bold: true, text: 'rich' },
    { text: ' text, ' },
    { italic: true, text: 'much' },
    { text: ' better than a ' },
    { code: true, text: '<textarea>' },
    { text: '!' },
  ],
});

const setupEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [richTextParagraph()],
    selection: {
      anchor: { path: [0, 6], offset: 1 },
      focus: { path: [0, 6], offset: 1 },
    },
  });

  return editor;
};

const getTextChildren = (editor: ReturnType<typeof createEditor>) => {
  const block = editorGetChildren(editor)[0];

  assert(NodeApi.isElement(block));

  return block.children.filter(TextApi.isText);
};

describe('leaf lifecycle contract', () => {
  it('removes removable empty marked leaves after destructive word deletes', () => {
    const editor = setupEditor();

    editor.update((tx) => {
      tx.text.delete({ reverse: true, unit: 'word' });
      tx.text.delete({ reverse: true, unit: 'word' });
      tx.text.delete({ reverse: true, unit: 'word' });
      tx.text.delete({ reverse: true, unit: 'word' });
    });

    const children = getTextChildren(editor);

    assert.equal(
      editorString(editor, [0]),
      'This is editable rich text, much '
    );
    assert.deepEqual(
      children.map((child) => child.text),
      ['This is editable ', 'rich', ' text, ', 'much', ' ']
    );
    assert.equal(
      children.some((child) => child.text === ''),
      false
    );
    assert.deepEqual(editorGetSelection(editor), {
      anchor: { path: [0, 4], offset: 1 },
      focus: { path: [0, 4], offset: 1 },
    });
  });
});
