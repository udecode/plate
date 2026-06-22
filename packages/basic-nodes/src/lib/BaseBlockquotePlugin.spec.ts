import {
  createSlateEditor,
  type PlatePluginTxGroup,
  type SlateEditor,
} from 'platejs';
import type { EditorUpdateTransaction, Value } from '@platejs/slate';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';

const runBlockquoteToggleTx = (isActive: boolean) => {
  const set = mock(() => {});
  const some = mock(() => isActive);
  const unwrap = mock(() => {});
  const wrap = mock(() => {});
  const [extension] = BaseBlockquotePlugin.__txExtensions;
  const txGroups = extension({
    plugin: BaseBlockquotePlugin,
    type: 'blockquote',
  } as unknown as Parameters<typeof extension>[0]);
  const group = txGroups.blockquote as PlatePluginTxGroup;
  const commands = group(
    {
      nodes: { set, some, unwrap, wrap },
    } as unknown as EditorUpdateTransaction,
    createSlateEditor() as SlateEditor
  ) as { toggle: () => void };

  commands.toggle();

  return { set, some, unwrap, wrap };
};

describe('BaseBlockquotePlugin', () => {
  it('uses wrapper semantics and drops text-block break rules', () => {
    const editor = createSlateEditor({
      plugins: [BaseBlockquotePlugin],
    });
    const plugin = editor.getPlugin(BaseBlockquotePlugin);

    expect(plugin.rules).toMatchObject({
      break: {
        empty: 'lift',
      },
      delete: {
        start: 'lift',
      },
    });
  });

  it('registers blockquote as an exclusive transaction wrapper toggle', () => {
    const inactive = runBlockquoteToggleTx(false);
    const active = runBlockquoteToggleTx(true);

    expect(inactive.wrap).toHaveBeenCalledWith({
      children: [],
      type: 'blockquote',
    });
    expect(inactive.unwrap).not.toHaveBeenCalled();

    expect(active.unwrap).toHaveBeenCalled();
    const [{ match }] = active.unwrap.mock.calls[0] as [
      { match: (node: unknown) => boolean },
    ];
    expect(match({ children: [], type: 'blockquote' })).toBe(true);
    expect(match({ children: [], type: 'p' })).toBe(false);
    expect(active.wrap).not.toHaveBeenCalled();
  });

  it('normalizes legacy flat blockquote children into paragraphs', () => {
    const editor = createSlateEditor({
      plugins: [BaseBlockquotePlugin],
      value: [
        {
          children: [{ text: 'Quote' }],
          type: 'blockquote',
        },
      ] satisfies Value,
    });

    const path = [0];
    const node = editor.api.node(path)?.[0];

    expect(node).toBeDefined();

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
      ] satisfies Value,
    });

    const path = [0];
    const node = editor.api.node(path)?.[0];

    expect(node).toBeDefined();

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
