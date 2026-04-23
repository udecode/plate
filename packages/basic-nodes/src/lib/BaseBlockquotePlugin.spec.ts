import { createSlateEditor, NodeApi } from 'platejs';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';

describe('BaseBlockquotePlugin', () => {
  it('uses wrapper semantics and drops text-block break rules', () => {
    const editor = createSlateEditor({
      plugins: [BaseBlockquotePlugin],
    } as any);
    const plugin = editor.getPlugin(BaseBlockquotePlugin);
    const toggleBlockSpy = spyOn(editor.tf, 'toggleBlock');

    expect(plugin.rules).toMatchObject({
      break: {
        empty: 'lift',
      },
      delete: {
        start: 'lift',
      },
    });

    (editor.getTransforms(BaseBlockquotePlugin) as any).blockquote.toggle();

    expect(toggleBlockSpy).toHaveBeenCalledWith(editor.getType('blockquote'), {
      wrap: true,
    });
  });

  it('normalizes legacy flat blockquote children into paragraphs', () => {
    const editor = createSlateEditor({
      plugins: [BaseBlockquotePlugin],
      value: [
        {
          children: [{ text: 'Quote' }],
          type: 'blockquote',
        },
      ],
    } as any);

    const path = [0];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect(editor.children).toEqual([
      {
        children: [
          {
            children: [{ text: 'Quote' }],
            type: 'p',
          },
        ],
        type: 'blockquote',
      },
    ]);
  });

  it('wraps inline runs when a legacy blockquote mixes inline and block children', () => {
    const editor = createSlateEditor({
      plugins: [BaseBlockquotePlugin],
      value: [
        {
          children: [
            { text: 'Lead' },
            {
              children: [{ text: 'Nested block' }],
              type: 'p',
            },
            { text: 'Tail' },
          ],
          type: 'blockquote',
        },
      ],
    } as any);

    const path = [0];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect(editor.children).toEqual([
      {
        children: [
          {
            children: [{ text: 'Lead' }],
            type: 'p',
          },
          {
            children: [{ text: 'Nested block' }],
            type: 'p',
          },
          {
            children: [{ text: 'Tail' }],
            type: 'p',
          },
        ],
        type: 'blockquote',
      },
    ]);
  });
});
