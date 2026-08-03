/** @jsx jsxt */

import { BaseParagraphPlugin, createBaseEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { LinkKit } from '@/registry/components/editor/plugins/link-kit';
import { AutoformatKit } from '@/registry/components/editor/plugins/autoformat-kit';

jsxt;

const createPlainEditor = (text: string, offset = text.length) =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, ...LinkKit, ...AutoformatKit],
    selection: {
      kind: 'text',
      anchor: { offset, path: [0, 0] },
      focus: { offset, path: [0, 0] },
    },
    initialValue: [{ children: [{ text }], type: 'paragraph' }],
  } as any);
const createEditor = (value: any) =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, ...LinkKit, ...AutoformatKit],
    initialValue: value,
  } as any);

const insertText = (
  editor:
    | ReturnType<typeof createPlainEditor>
    | ReturnType<typeof createEditor>,
  text: string
) => {
  editor.update.text.insert(text);
};

describe('AutoformatKit link automd', () => {
  it('converts [text](url on ) into a link in the shipped kit surface', () => {
    const editor = createPlainEditor('[Example](https://example.com');

    insertText(editor, ')');

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { text: '' },
        {
          children: [{ text: 'Example' }],
          type: 'link',
          url: 'https://example.com',
        },
        { text: '' },
      ],
      type: 'paragraph',
    });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('autolinks a bare URL on trailing space in the shipped kit surface', () => {
    const input = (
      <fragment>
        <hp>
          https://example.com
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createEditor(input);

    insertText(editor, ' ');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>
            <ha url="https://example.com">https://example.com</ha>{' '}
          </hp>
        </fragment>
      ).children
    );
  });
});
