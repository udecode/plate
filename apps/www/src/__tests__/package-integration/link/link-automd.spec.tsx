import {
  BaseParagraphPlugin,
  createEditor as createProductEditor,
} from 'platejs';

import { AutoformatKit } from '@/registry/components/editor/autoformat';
import { LinkKit } from '@/registry/components/editor/link';

const createPlainEditor = (text: string, offset = text.length) =>
  createProductEditor({
    plugins: [BaseParagraphPlugin, ...LinkKit, ...AutoformatKit],
    selection: {
      kind: 'text',
      anchor: { offset, path: [0, 0] },
      focus: { offset, path: [0, 0] },
    },
    initialValue: [{ children: [{ text }], type: 'paragraph' }],
  } as any);

describe('AutoformatKit link automd', () => {
  it('converts [text](url on ) into a link in the shipped kit surface', () => {
    const editor = createPlainEditor('[Example](https://example.com');

    editor.update.text.insert(')');

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
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });
});
