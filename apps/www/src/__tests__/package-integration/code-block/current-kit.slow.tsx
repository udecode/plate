/** @jsx jsxt */

import { BaseParagraphPlugin, createBaseEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { CodeBlockKit } from '@/registry/components/editor/plugins/code-block-kit';

jsxt;

const createEditor = (text: string, offset = text.length) =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, ...CodeBlockKit],
    selection: {
      kind: 'text',
      anchor: { offset, path: [0, 0] },
      focus: { offset, path: [0, 0] },
    },
    initialValue: [{ children: [{ text }], type: 'paragraph' }],
  } as any);

const insertText = (editor: ReturnType<typeof createEditor>, text: string) => {
  editor.update.text.insert(text);
};

describe('CodeBlockKit current contract', () => {
  it('promotes triple backticks into a code block in the shipped kit surface', () => {
    const editor = createEditor('``', 2);

    insertText(editor, '`');
    insertText(editor, 'code');

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ children: [{ text: 'code' }], type: 'codeLine' }],
        type: 'codeBlock',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 4, path: [0, 0, 0] },
      focus: { offset: 4, path: [0, 0, 0] },
    });
  });
});
