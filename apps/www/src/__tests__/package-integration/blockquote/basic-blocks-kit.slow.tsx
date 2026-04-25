/** @jsx jsxt */

import { createSlateEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { BasicBlocksKit } from '@/registry/components/editor/plugins/basic-blocks-kit';

jsxt;

const createEditor = ({
  offset,
  path = [0, 0],
  text,
  value = [{ children: [{ text }], type: 'p' }],
}: {
  offset: number;
  path?: number[];
  text?: string;
  value?: any[];
}) =>
  createSlateEditor({
    plugins: BasicBlocksKit,
    selection: {
      anchor: { offset, path },
      focus: { offset, path },
    },
    value,
  } as any);

describe('BasicBlocksKit blockquote autoformat', () => {
  it('promotes `> ` into a blockquote at the root in the shipped kit surface', () => {
    const editor = createEditor({ offset: 1, text: '>hello' });

    editor.tf.insertText(' ');

    expect(editor.children[0]).toMatchObject({
      children: [{ children: [{ text: 'hello' }], type: 'p' }],
      type: 'blockquote',
    });
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0] },
    });
  });
});
