/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import {
  BaseParagraphPlugin,
  createSlateEditor,
  createSlatePlugin,
  NodeApi,
} from 'platejs';
import { BaseBlockquotePlugin } from '@platejs/basic-nodes';

import { BaseIndentPlugin } from './BaseIndentPlugin';

jsxt;

const FallbackTabPlugin = (
  fallbackTab: (options: { reverse: boolean }) => boolean | undefined
) =>
  createSlatePlugin({
    key: 'fallbackTab',
  }).overrideEditor(() => ({
    transforms: {
      tab: fallbackTab,
    },
  }));

describe('withIndent', () => {
  it('caps indent during normalization when it exceeds indentMax', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin.configure({
          options: { indentMax: 2 },
        }),
      ],
      value: [
        {
          children: [{ text: 'One' }],
          indent: 4,
          type: 'p',
        },
      ],
    });

    const path = [0];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect((editor.children[0] as any).indent).toBe(2);
  });

  it('unsets indent when the block no longer matches the injected target types', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      value: [
        {
          children: [{ text: 'One' }],
          indent: 2,
          type: 'quote',
        },
      ],
    });

    const path = [0];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect(editor.children[0] as any).toEqual({
      children: [{ text: 'One' }],
      type: 'quote',
    });
  });

  it('indents plain paragraphs on tab and outdents them on reverse tab', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
          One
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      selection: input.selection,
      value: input.children,
    });

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect((editor.children[0] as any).indent).toBe(1);

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect((editor.children[0] as any).indent).toBeUndefined();
  });

  it('claims plain paragraph tab before fallback focus handling', () => {
    const fallbackTab = mock(() => false);

    const input = (
      <editor>
        <hp>
          <cursor />
          One
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        FallbackTabPlugin(fallbackTab as any),
        BaseIndentPlugin,
      ],
      selection: input.selection,
      value: input.children,
    });

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(fallbackTab).toHaveBeenCalledTimes(0);
    expect((editor.children[0] as any).indent).toBe(1);
  });

  it('keeps reverse tab editor-owned on plain paragraphs with no indent', () => {
    const fallbackTab = mock(() => false);

    const input = (
      <editor>
        <hp>
          <cursor />
          One
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        FallbackTabPlugin(fallbackTab as any),
        BaseIndentPlugin,
      ],
      selection: input.selection,
      value: input.children,
    });

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(fallbackTab).toHaveBeenCalledTimes(0);
    expect(editor.children).toEqual(input.children);
  });

  it('lets quoted paragraphs outdent one quote level on reverse tab', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp>
            <cursor />
            One
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <cursor />
          One
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseBlockquotePlugin, BaseIndentPlugin],
      selection: input.selection,
      value: input.children,
    });

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('keeps quoted paragraph tab editor-owned by indenting the paragraph', () => {
    const fallbackTab = mock(() => false);

    const input = (
      <editor>
        <hblockquote>
          <hp>
            <cursor />
            One
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseBlockquotePlugin,
        FallbackTabPlugin(fallbackTab as any),
        BaseIndentPlugin,
      ],
      selection: input.selection,
      value: input.children,
    });

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(fallbackTab).toHaveBeenCalledTimes(0);
    expect((editor.children[0] as any).children[0].indent).toBe(1);
  });

  it('outdents quoted paragraph indent before lifting the quote on reverse tab', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp indent={1}>
            <cursor />
            One
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hblockquote>
          <hp>
            <cursor />
            One
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseBlockquotePlugin, BaseIndentPlugin],
      selection: input.selection,
      value: input.children,
    });

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('outdents every selected nested quoted block one quote level on reverse tab', () => {
    const input = (
      <editor>
        <hblockquote>
          <hblockquote>
            <hp>
              <anchor />
              One
            </hp>
            <hp>
              Two
              <focus />
            </hp>
          </hblockquote>
        </hblockquote>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hblockquote>
          <hp>
            <anchor />
            One
          </hp>
          <hp>
            Two
            <focus />
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseBlockquotePlugin, BaseIndentPlugin],
      selection: input.selection,
      value: input.children,
    });

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('falls through to the previous tab transform when the current block does not match', () => {
    const fallbackTab = mock(() => false);

    const editor = createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        FallbackTabPlugin(fallbackTab as any),
        BaseIndentPlugin,
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'One' }],
          type: 'quote',
        },
      ],
    });

    expect(editor.tf.tab({ reverse: false })).toBe(false);
    expect(fallbackTab).toHaveBeenCalledTimes(1);
    expect((editor.children[0] as any).indent).toBeUndefined();
  });
});
