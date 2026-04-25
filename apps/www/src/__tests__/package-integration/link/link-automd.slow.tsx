/** @jsx jsxt */

import { BaseParagraphPlugin, createSlateEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { LinkKit } from '@/registry/components/editor/plugins/link-kit';
import { AutoformatKit } from '@/registry/components/editor/plugins/autoformat-kit';

jsxt;

const createPlainEditor = (text: string, offset = text.length) =>
  createSlateEditor({
    plugins: [BaseParagraphPlugin, ...LinkKit, ...AutoformatKit],
    selection: {
      anchor: { offset, path: [0, 0] },
      focus: { offset, path: [0, 0] },
    },
    value: [{ children: [{ text }], type: 'p' }],
  } as any);
const createEditor = (value: any) =>
  createSlateEditor({
    plugins: [BaseParagraphPlugin, ...LinkKit, ...AutoformatKit],
    value,
  } as any);

describe('AutoformatKit link automd', () => {
  it('converts [text](url on ) into a link in the shipped kit surface', () => {
    const editor = createPlainEditor('[Example](https://example.com');

    editor.tf.insertText(')');

    expect(editor.children[0]).toMatchObject({
      children: [
        { text: '' },
        {
          children: [{ text: 'Example' }],
          type: 'a',
          url: 'https://example.com',
        },
        { text: '' },
      ],
      type: 'p',
    });
    expect(editor.selection).toEqual({
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

    editor.tf.insertText(' ');

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
