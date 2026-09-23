/** @jsxRuntime classic */
/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import {
  BaseParagraphPlugin,
  createBlockStartInputRule,
  createEditor,
  schema,
  SelectionApi,
} from '../../../core';
import {
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BlockquoteRules,
  HorizontalRuleRules,
} from './BaseBlockPlugins';
import { BaseHeadingPlugin } from './BaseHeadingPlugins';

jsxt;

describe('BaseBlockquotePlugin', () => {
  it('declines wrapping a required title without throwing or changing the document', () => {
    const initialValue = [
      { children: [{ text: 'Title' }], level: 1, type: 'heading' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ];
    const editor = createEditor({
      plugins: [BaseHeadingPlugin, BaseBlockquotePlugin],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      initialValue,
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    expect(() =>
      editor.plugin(BaseBlockquotePlugin).update.toggle()
    ).not.toThrow();
    expect(editor.read.children()).toEqual(initialValue);

    editor.update.selection.set({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [1, 0] },
    });
    expect(() =>
      editor.plugin(BaseBlockquotePlugin).update.toggle()
    ).not.toThrow();
    expect(editor.read.children()).toEqual(initialValue);

    editor.update.selection.set({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
    editor.plugin(BaseBlockquotePlugin).update.toggle();

    expect(editor.read.children()).toEqual([
      initialValue[0],
      { children: [initialValue[1]], type: 'blockquote' },
    ]);
  });

  it('decodes and encodes its HTML element claim', () => {
    const editor = createEditor({
      plugins: [BaseBlockquotePlugin],
      selection: SelectionApi.nodes([[0]]),
      initialValue: [
        {
          children: [{ children: [{ text: 'Quote' }], type: 'paragraph' }],
          type: 'blockquote',
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
        children: [{ children: [{ text: 'Quote' }], type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);

    editor.api.dom.clipboard.writeSelection(data);

    const { body } = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    );

    expect(body.querySelector('blockquote > p')?.textContent).toBe('Quote');
  });

  it('uses container grammar and scoped wrapper semantics', () => {
    const editor = createEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'Quote' }], type: 'paragraph' }],
    });
    const before = { children: editor.read.children() };

    expect(
      editor.read.schema.isElementTypeInGroup(
        editor.plugin(BaseBlockquotePlugin).schema.type,
        'block'
      )
    ).toBe(true);
    expect(
      editor.read.schema.allowsElementType(
        editor.plugin(BaseBlockquotePlugin).schema.type,
        editor.plugin(BaseParagraphPlugin).schema.type
      )
    ).toBe(true);
    expect(editor.read.schema.create(BaseBlockquotePlugin)).toEqual({
      children: [{ children: [{ text: '' }], type: 'paragraph' }],
      type: 'blockquote',
    });

    editor.plugin(BaseBlockquotePlugin).update.toggle();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ children: [{ text: 'Quote' }], type: 'paragraph' }],
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
    const editor = createEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            { children: [{ text: 'Quote' }], type: 'paragraph' },
            {
              children: [{ text: 'Second paragraph' }],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        },
      ],
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: 'Quote' }], type: 'paragraph' },
          { children: [{ text: 'Second paragraph' }], type: 'paragraph' },
        ],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 2, path: [0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0] },
    });
  });

  it('lifts selected blockquote children on reverse-tab', () => {
    const editor = createEditor({
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
              type: 'paragraph',
            },
            {
              children: [{ text: 'Two' }],
              type: 'paragraph',
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
        type: 'paragraph',
      },
      {
        children: [
          {
            children: [{ text: 'Two' }],
            type: 'paragraph',
          },
        ],
        type: 'blockquote',
      },
    ]);
  });

  it('lets reverse-tab fall through outside blockquote children', () => {
    const editor = createEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
    });

    expect(editor.update.blockquote.untab()).toBe(false);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], type: 'paragraph' },
    ]);
  });

  it('lifts an empty blockquote child on Enter', () => {
    const editor = createEditor({
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
              type: 'paragraph',
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
        type: 'paragraph',
      },
    ]);
  });

  it('lifts an empty blockquote child on Backspace at block start', () => {
    const editor = createEditor({
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
              type: 'paragraph',
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
        type: 'paragraph',
      },
    ]);
  });
});

describe('BaseHorizontalRulePlugin', () => {
  it('decodes and encodes its void HTML element claim', () => {
    const editor = createEditor({
      plugins: [BaseHorizontalRulePlugin],
      selection: SelectionApi.nodes([[0]]),
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'horizontalRule',
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
        type: 'horizontalRule',
      },
    ]);

    editor.api.dom.clipboard.writeSelection(data);

    const { body } = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    );

    expect(body.querySelector('hr')).not.toBeNull();
  });
});

describe('basic block input rules', () => {
  it('preserves typed syntax when a generic wrap rule cannot replace the required title', () => {
    const editor = createEditor({
      plugins: [
        BaseHeadingPlugin,
        BaseBlockquotePlugin.configure({
          inputRules: [
            createBlockStartInputRule({
              match: '>',
              mode: 'wrap',
              trigger: ' ',
            }),
          ],
        }),
      ],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      initialValue: [
        { children: [{ text: '>' }], level: 1, type: 'heading' },
        { children: [{ text: 'Body' }], type: 'paragraph' },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: '> ' }],
      level: 1,
      type: 'heading',
    });
  });

  it('keeps blockquote markdown syntax and the space in a required title', () => {
    const initialValue = [
      { children: [{ text: '>' }], level: 1, type: 'heading' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ];
    const editor = createEditor({
      plugins: [
        BaseHeadingPlugin,
        BaseBlockquotePlugin.configure({
          inputRules: [BlockquoteRules.markdown()],
        }),
      ],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      initialValue,
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual([
      { children: [{ text: '> ' }], level: 1, type: 'heading' },
      initialValue[1],
    ]);
  });

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

    const editor = createEditor({
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
    const editor = createEditor({
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
          children: [{ children: [{ text: '>hello' }], type: 'paragraph' }],
          type: 'blockquote',
        },
      ],
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          {
            children: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
            type: 'blockquote',
          },
        ],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0] },
    });
  });

  it('inserts an hr and trailing paragraph from --- shorthand', () => {
    const editor = createEditor({
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
      initialValue: [{ children: [{ text: '--' }], type: 'paragraph' }],
    });

    editor.update.text.insert('-');

    expect(editor.read.children()).toMatchObject([
      {
        type: 'horizontalRule',
      },
      {
        children: [{ text: '' }],
        type: 'paragraph',
      },
    ]);
  });

  it('keeps horizontal-rule syntax in a required title', () => {
    const editor = createEditor({
      plugins: [
        BaseHeadingPlugin,
        BaseHorizontalRulePlugin.configure({
          inputRules: [HorizontalRuleRules.markdown({ variant: '-' })],
        }),
      ],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      initialValue: [
        { children: [{ text: '--' }], level: 1, type: 'heading' },
        { children: [{ text: 'Body' }], type: 'paragraph' },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
    });

    editor.update.text.insert('-');

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: '---' }],
      level: 1,
      type: 'heading',
    });
  });
});
