/** @jsx jsxt */

import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { jsxt } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';
import { BlockquoteRules } from './BasicBlockRules';
import { BaseHorizontalRulePlugin } from './BaseHorizontalRulePlugin';
import { HorizontalRuleRules } from './BasicBlockRules';

jsxt;

describe('basic block input rules', () => {
  it('wraps a paragraph in blockquote when markdown group is enabled', () => {
    const input = (
      <editor>
        <hp>
          {'>'}
          <cursor />
          hello
        </hp>
      </editor>
    );

    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseBlockquotePlugin.configure({
          inputRules: [BlockquoteRules.markdown()],
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual(
      (
        <editor>
          <hblockquote>
            <hp>hello</hp>
          </hblockquote>
        </editor>
      ).children
    );
  });

  it('wraps a paragraph in a nested blockquote when already inside a quote', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseBlockquotePlugin.configure({
          inputRules: [BlockquoteRules.markdown()],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: '>hello' }], type: KEYS.p }],
          type: KEYS.blockquote,
        },
      ],
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toMatchObject([
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
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0] },
    });
  });

  it('inserts an hr and trailing paragraph from --- shorthand', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseHorizontalRulePlugin.configure({
          inputRules: [HorizontalRuleRules.markdown({ variant: '-' })],
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: '--' }], type: KEYS.p }],
    });

    editor.update.text.insert('-');

    expect(editor.read.children()).toMatchObject([
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
