/** @jsxRuntime classic */
/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import {
  BaseParagraphPlugin,
  createBlockStartInputRule,
  createEditor,
  definePlugin,
  property,
  schema,
  SelectionApi,
} from '../../../core';
import { parseHtmlSliceContent } from '../../../internal/testing/parseHtmlSliceContent';
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
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
      initialValue: [
        {
          children: [{ children: [{ text: 'Quote' }], type: 'paragraph' }],
          type: 'blockquote',
        },
      ],
    });
    const data = new DataTransfer();

    expect(
      parseHtmlSliceContent(editor, '<blockquote><p>Quote</p></blockquote>')
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
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'horizontalRule',
        },
      ],
    });
    const data = new DataTransfer();

    expect(parseHtmlSliceContent(editor, '<hr>')).toEqual([
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

  describe('the divider shortcut', () => {
    const TitlePlugin = definePlugin('title', {
      schema: { element: schema.element.textBlock() },
    });
    const hr = { children: [{ text: '' }], type: 'horizontalRule' };
    const block = (type: string, text = '') => ({
      children: [{ text }],
      type,
    });
    const type = (
      options: Readonly<{
        initialValue: unknown[];
        keys: string;
        path: number[];
        offset?: number;
        plugins?: unknown[];
        schema?: unknown;
        variant?: '-' | '_';
      }>
    ) => {
      const offset = options.offset ?? 0;
      const editor = createEditor({
        initialValue: options.initialValue,
        plugins: [
          ...(options.plugins ?? [BaseParagraphPlugin]),
          BaseHorizontalRulePlugin.configure({
            inputRules: [
              HorizontalRuleRules.markdown({ variant: options.variant }),
            ],
          }),
        ],
        schema: options.schema,
        selection: {
          kind: 'text',
          anchor: { offset, path: options.path },
          focus: { offset, path: options.path },
        },
      } as never);

      for (const key of options.keys) editor.update.text.insert(key);

      return editor;
    };
    const titleRoot = {
      plugins: [BaseParagraphPlugin.configure({ enabled: false }), TitlePlugin],
      schema: {
        root: schema.content.group('block', {
          default: { type: 'title' },
          min: 1,
        }),
      },
    };

    it('leaves an empty divider and a paragraph with the caret', () => {
      for (const [keys, variant] of [
        ['---', '-'],
        ['___ ', '_'],
      ] as const) {
        const editor = type({
          initialValue: [block('paragraph')],
          keys,
          path: [0, 0],
          variant,
        });

        expect(editor.read.children()).toEqual([hr, block('paragraph')]);
        expect(editor.read.selection()?.focus).toEqual({
          offset: 0,
          path: [1, 0],
        });
      }
    });

    it('lands the block the parent declares after the divider', () => {
      expect(
        type({
          ...titleRoot,
          initialValue: [block('title')],
          keys: '---',
          path: [0, 0],
        }).read.children()
      ).toEqual([hr, block('title')]);
      expect(
        type({
          initialValue: [
            { children: [{ text: 'Title' }], level: 1, type: 'heading' },
            block('paragraph'),
          ],
          keys: '---',
          path: [1, 0],
          plugins: [BaseParagraphPlugin, BaseHeadingPlugin],
          schema: {
            root: schema.content.prefix(
              [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
              schema.content.group('block', {
                default: { type: 'paragraph' },
                min: 1,
              })
            ),
          },
        }).read.children()
      ).toEqual([
        { children: [{ text: 'Title' }], level: 1, type: 'heading' },
        hr,
        block('paragraph'),
      ]);
      expect(
        type({
          initialValue: [
            { children: [block('paragraph')], type: 'blockquote' },
            block('title', 'after'),
          ],
          keys: '---',
          path: [0, 0, 0],
          plugins: [BaseParagraphPlugin, TitlePlugin, BaseBlockquotePlugin],
          schema: {
            root: schema.content.types(['blockquote', 'title'], {
              default: { type: 'title' },
              min: 1,
            }),
          },
        }).read.children()
      ).toEqual([
        { children: [hr, block('paragraph')], type: 'blockquote' },
        block('title', 'after'),
      ]);
    });

    it('lands a container default with the caret in its first text block', () => {
      const editor = type({
        initialValue: [block('paragraph')],
        keys: '---',
        path: [0, 0],
        plugins: [BaseParagraphPlugin, BaseBlockquotePlugin],
        schema: {
          root: schema.content.types(
            ['paragraph', 'blockquote', 'horizontalRule'],
            { default: { type: 'blockquote' }, min: 1 }
          ),
        },
      });

      expect(editor.read.children()).toEqual([
        hr,
        { children: [block('paragraph')], type: 'blockquote' },
      ]);
      expect(editor.read.selection()?.focus).toEqual({
        offset: 0,
        path: [1, 0, 0],
      });
    });

    it('keeps the marker as text when an inline atom follows the caret', () => {
      const MentionPlugin = definePlugin('mention', {
        schema: {
          element: {
            properties: {
              label: property.string(),
              ref: property.string({ required: true }),
            },
            void: 'markable-inline',
          },
        },
      });
      const mention = {
        children: [{ text: '' }],
        label: 'Alice',
        ref: 'alice',
        type: 'mention',
      };
      const editor = type({
        initialValue: [
          {
            children: [{ text: '--' }, mention, { text: '' }],
            type: 'paragraph',
          },
        ],
        keys: '-',
        offset: 2,
        path: [0, 0],
        plugins: [BaseParagraphPlugin, MentionPlugin],
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: '---' }, mention, { text: '' }],
          type: 'paragraph',
        },
      ]);
    });

    it('keeps the marker as text when text follows the caret', () => {
      expect(
        type({
          initialValue: [block('paragraph', 'abc')],
          keys: '---',
          path: [0, 0],
        }).read.children()
      ).toEqual([block('paragraph', '---abc')]);
    });

    it('undoes in one step to the paragraph before the last key', () => {
      const editor = type({
        initialValue: [block('paragraph', '--')],
        keys: '-',
        offset: 2,
        path: [0, 0],
      });

      expect(editor.read.children()).toEqual([hr, block('paragraph')]);
      expect(editor.read.selection()?.focus).toEqual({
        offset: 0,
        path: [1, 0],
      });

      editor.api.history.undo();

      expect(editor.read.children()).toEqual([block('paragraph', '--')]);
    });
  });
});
