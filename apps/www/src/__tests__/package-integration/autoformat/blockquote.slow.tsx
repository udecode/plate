import { createSlateEditor } from 'platejs';
import { BaseBlockquotePlugin } from '@platejs/basic-nodes';

import { AutoformatKit } from '@/registry/components/editor/plugins/autoformat-kit';

const createBlockquoteAutoformatEditor = ({
  selection,
  value,
}: {
  selection: any;
  value: any;
}) =>
  createSlateEditor({
    plugins: [BaseBlockquotePlugin, ...AutoformatKit],
    selection,
    value,
  } as any);

describe('AutoformatKit blockquote rule', () => {
  it('formats > into a blockquote at the root', () => {
    const editor = createBlockquoteAutoformatEditor({
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      value: [{ children: [{ text: '>hello' }], type: 'p' }],
    });

    editor.tf.insertText(' ');

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            children: [{ text: 'hello' }],
            type: 'p',
          },
        ],
        type: 'blockquote',
      },
    ]);
  });

  it('formats > into a nested blockquote inside an existing quote', () => {
    const editor = createBlockquoteAutoformatEditor({
      selection: {
        anchor: { path: [0, 0, 0], offset: 1 },
        focus: { path: [0, 0, 0], offset: 1 },
      },
      value: [
        {
          children: [
            {
              children: [{ text: '>hello' }],
              type: 'p',
            },
          ],
          type: 'blockquote',
        },
      ],
    });

    editor.tf.insertText(' ');

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ text: 'hello' }],
                type: 'p',
              },
            ],
            type: 'blockquote',
          },
        ],
        type: 'blockquote',
      },
    ]);
  });
});
