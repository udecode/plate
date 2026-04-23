/** @jsx jsxt */

import { BaseParagraphPlugin, createSlateEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { CodeBlockKit } from '@/registry/components/editor/plugins/code-block-kit';

jsxt;

const createEditor = (text: string, offset = text.length) =>
  createSlateEditor({
    plugins: [BaseParagraphPlugin, ...CodeBlockKit],
    selection: {
      anchor: { offset, path: [0, 0] },
      focus: { offset, path: [0, 0] },
    },
    value: [{ children: [{ text }], type: 'p' }],
  } as any);

describe('CodeBlockKit current contract', () => {
  it('promotes triple backticks into a code block in the shipped kit surface', () => {
    const editor = createEditor('``', 2);

    editor.tf.insertText('`');
    editor.tf.insertText('code');

    expect(editor.children).toMatchObject([
      {
        children: [{ children: [{ text: 'code' }], type: 'code_line' }],
        type: 'code_block',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 4, path: [0, 0, 0] },
      focus: { offset: 4, path: [0, 0, 0] },
    });
  });
});
