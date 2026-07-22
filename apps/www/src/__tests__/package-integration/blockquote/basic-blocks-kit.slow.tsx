/** @jsx jsxt */

import { createBaseEditor } from 'platejs';
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
  createBaseEditor({
    plugins: BasicBlocksKit,
    selection: {
      kind: 'text',
      anchor: { offset, path },
      focus: { offset, path },
    },
    initialValue: value,
  } as any);

const insertText = (editor: ReturnType<typeof createEditor>, text: string) => {
  editor.update.text.insert(text);
};

describe('BasicBlocksKit blockquote autoformat', () => {
  it('promotes `> ` into a blockquote at the root in the shipped kit surface', () => {
    const editor = createEditor({ offset: 1, text: '>hello' });

    insertText(editor, ' ');

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ children: [{ text: 'hello' }], type: 'p' }],
      type: 'blockquote',
    });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0] },
    });
  });
});
