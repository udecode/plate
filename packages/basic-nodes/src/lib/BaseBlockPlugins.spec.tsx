/** @jsx jsxt */

import {
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BlockquoteRules,
  HorizontalRuleRules,
} from './BaseBlockPlugins';
import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { SelectionApi } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';

jsxt;

describe('BaseBlockquotePlugin', () => {
  it('decodes and encodes its HTML element claim', () => {
    const point = { offset: 0, path: [0, 0, 0] };
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
      initialValue: [
        {
          children: [{ children: [{ text: 'Quote' }], type: KEYS.p }],
          type: KEYS.blockquote,
        },
      ],
    });
    const data = new DataTransfer();

    expect(
      editor.api.html.deserialize({
        element: '<blockquote><p>Quote</p></blockquote>',
      })
    ).toEqual([
      {
        children: [{ children: [{ text: 'Quote' }], type: KEYS.p }],
        type: KEYS.blockquote,
      },
    ]);

    editor.api.dom.clipboard.writeSelection(data);

    const body = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    ).body;

    expect(body.querySelector('blockquote > p')?.textContent).toBe('Quote');
  });

  it('uses container grammar and scoped wrapper semantics', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'Quote' }], type: 'p' }],
    });
    const before = { children: editor.read.children() };

    expect(
      editor.read.schema.isElementTypeInGroup(KEYS.blockquote, 'block')
    ).toBe(true);
    expect(editor.read.schema.allowsElementType(KEYS.blockquote, KEYS.p)).toBe(
      true
    );
    expect(editor.read.schema.create(BaseBlockquotePlugin)).toEqual({
      children: [{ children: [{ text: '' }], type: KEYS.p }],
      type: KEYS.blockquote,
    });

    editor.update.blockquote.toggle();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ children: [{ text: 'Quote' }], type: KEYS.p }],
        type: 'blockquote',
      },
    ]);

    const commit = editor.read.lastCommit();

    expect(commit?.changed.has('structure')).toBe(true);
    expect(commit?.changes.apply(before).children).toEqual(
      editor.read.children()
    );
  });

  it('keeps canonical nested block content during repair', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            { children: [{ text: 'Quote' }], type: KEYS.p },
            { children: [{ text: 'Second paragraph' }], type: KEYS.p },
          ],
          type: 'blockquote',
        },
      ],
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: 'Quote' }], type: KEYS.p },
          { children: [{ text: 'Second paragraph' }], type: KEYS.p },
        ],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0] },
    });
  });

  it('lifts selected blockquote children on reverse-tab', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ text: 'One' }],
              type: KEYS.p,
            },
            {
              children: [{ text: 'Two' }],
              type: KEYS.p,
            },
          ],
          type: 'blockquote',
        },
      ],
    });

    expect(editor.update.blockquote.untab()).toBe(true);
    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'One' }],
        type: KEYS.p,
      },
      {
        children: [
          {
            children: [{ text: 'Two' }],
            type: KEYS.p,
          },
        ],
        type: 'blockquote',
      },
    ]);
  });

  it('lets reverse-tab fall through outside blockquote children', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'One' }], type: KEYS.p }],
    });

    expect(editor.update.blockquote.untab()).toBe(false);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], type: KEYS.p },
    ]);
  });

  it('lifts an empty blockquote child on Enter', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: KEYS.p,
            },
          ],
          type: 'blockquote',
        },
      ],
    });

    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        type: KEYS.p,
      },
    ]);
  });

  it('lifts an empty blockquote child on Backspace at block start', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: KEYS.p,
            },
          ],
          type: 'blockquote',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        type: KEYS.p,
      },
    ]);
  });
});

describe('BaseHorizontalRulePlugin', () => {
  it('decodes and encodes its void HTML element claim', () => {
    const point = { offset: 0, path: [0, 0] };
    const editor = createBaseEditor({
      plugins: [BaseHorizontalRulePlugin],
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
      initialValue: [
        {
          children: [{ text: '' }],
          type: KEYS.hr,
        },
      ],
    });
    const data = new DataTransfer();

    expect(
      editor.api.html.deserialize({
        element: '<hr>',
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        type: KEYS.hr,
      },
    ]);

    editor.api.dom.clipboard.writeSelection(data);

    const body = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    ).body;

    expect(body.querySelector('hr')).not.toBeNull();
  });
});

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
      initialValue: input.children,
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
      initialValue: [
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
      initialValue: [{ children: [{ text: '--' }], type: KEYS.p }],
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
