/** @jsx jsxt */

import { BaseParagraphPlugin, KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';
import { BlockquoteRules } from './BasicBlockRules';
import { BaseHorizontalRulePlugin } from './BaseHorizontalRulePlugin';
import { HorizontalRuleRules } from './BasicBlockRules';

jsxt;

describe('basic block input rules', () => {
  it('wraps a paragraph in blockquote when markdown group is enabled', () => {
    const input = (
      <fragment>
        <hp>
          {'>'}
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseBlockquotePlugin.configure({
          inputRules: [BlockquoteRules.markdown()],
        }),
      ],
      value: input,
    } as any);

    editor.tf.insertText(' ');

    expect(input.children).toEqual(
      (
        <fragment>
          <hblockquote>
            <hp>hello</hp>
          </hblockquote>
        </fragment>
      ).children
    );
  });

  it('wraps a paragraph in a nested blockquote when already inside a quote', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseBlockquotePlugin.configure({
          inputRules: [BlockquoteRules.markdown()],
        }),
      ],
      selection: {
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: '>hello' }], type: KEYS.p }],
          type: KEYS.blockquote,
        },
      ],
    } as any);

    editor.tf.insertText(' ');

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            children: [{ children: [{ text: 'hello' }], type: KEYS.p }],
            type: KEYS.blockquote,
          },
        ],
        type: KEYS.blockquote,
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0] },
    });
  });

  it('inserts an hr and trailing paragraph from --- shorthand', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseHorizontalRulePlugin.configure({
          inputRules: [HorizontalRuleRules.markdown({ variant: '-' })],
        }),
      ],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: '--' }], type: KEYS.p }],
    } as any);

    editor.tf.insertText('-');

    expect(editor.children).toMatchObject([
      {
        type: KEYS.hr,
      },
      {
        children: [{ text: '' }],
        type: KEYS.p,
      },
    ]);
  });
});
