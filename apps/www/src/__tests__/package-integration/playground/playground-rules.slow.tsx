import {
  BaseParagraphPlugin,
  TrailingBlockPlugin,
  createSlateEditor,
} from 'platejs';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
  BlockquoteRules,
  BoldRules,
  CodeRules,
  HeadingRules,
  HighlightRules,
  HorizontalRuleRules,
  ItalicRules,
  StrikethroughRules,
  SubscriptRules,
  SuperscriptRules,
  UnderlineRules,
} from '@platejs/basic-nodes';
import { BaseIndentPlugin } from '@platejs/indent';
import { BaseLinkPlugin, LinkRules } from '@platejs/link';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  MathRules,
} from '@platejs/math';
import {
  BaseListPlugin,
  BulletedListRules,
  OrderedListRules,
  TaskListRules,
} from '@platejs/list';

const createEditor = ({
  offset,
  plugins,
  text,
}: {
  offset?: number;
  plugins: any[];
  text: string;
}) =>
  createSlateEditor({
    plugins,
    selection: {
      anchor: { offset: offset ?? text.length, path: [0, 0] },
      focus: { offset: offset ?? text.length, path: [0, 0] },
    },
    value: [{ children: [{ text }], type: 'p' }],
  } as any);

describe('playground rules current contract', () => {
  describe('basic blocks', () => {
    const createBlocksEditor = (text: string, offset?: number) =>
      createEditor({
        offset,
        plugins: [
          BaseParagraphPlugin,
          BaseH1Plugin.configure({ inputRules: [HeadingRules.markdown()] }),
          BaseH2Plugin.configure({ inputRules: [HeadingRules.markdown()] }),
          BaseH3Plugin.configure({ inputRules: [HeadingRules.markdown()] }),
          BaseH4Plugin.configure({ inputRules: [HeadingRules.markdown()] }),
          BaseH5Plugin.configure({ inputRules: [HeadingRules.markdown()] }),
          BaseH6Plugin.configure({ inputRules: [HeadingRules.markdown()] }),
          BaseBlockquotePlugin.configure({
            inputRules: [BlockquoteRules.markdown()],
          }),
          BaseHorizontalRulePlugin.configure({
            inputRules: [
              HorizontalRuleRules.markdown({ variant: '-' }),
              HorizontalRuleRules.markdown({ variant: '_' }),
            ],
          }),
          TrailingBlockPlugin,
        ],
        text,
      });

    it.each([
      ['#', 'h1'],
      ['##', 'h2'],
      ['###', 'h3'],
      ['####', 'h4'],
      ['#####', 'h5'],
      ['######', 'h6'],
    ])('promotes `%s ` into %s', (markdown, type) => {
      const editor = createBlocksEditor(markdown, markdown.length);

      editor.tf.insertText(' ');

      expect(editor.children[0]).toMatchObject({
        children: [{ text: '' }],
        type,
      });
      expect(editor.selection).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });

    it('promotes `> ` into a blockquote', () => {
      const editor = createBlocksEditor('>hello', 1);

      editor.tf.insertText(' ');

      expect(editor.children[0]).toMatchObject({
        children: [{ children: [{ text: 'hello' }], type: 'p' }],
        type: 'blockquote',
      });
      expect(editor.selection).toEqual({
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      });
    });

    it.each([
      ['--', '-'],
      ['___', ' '],
    ])('promotes `%s` into a horizontal rule', (prefix, finalInput) => {
      const editor = createBlocksEditor(prefix, prefix.length);

      editor.tf.insertText(finalInput);

      expect(editor.children).toMatchObject([
        { type: 'hr' },
        { children: [{ text: '' }], type: 'p' },
        { children: [{ text: '' }], type: 'p' },
      ]);
    });
  });

  describe('basic marks', () => {
    const createMarksEditor = (text: string) =>
      createEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseBoldPlugin.configure({
            inputRules: [BoldRules.markdown({ variant: '*' })],
          }),
          BaseItalicPlugin.configure({
            inputRules: [ItalicRules.markdown({ variant: '*' })],
          }),
          BaseUnderlinePlugin.configure({
            inputRules: [UnderlineRules.markdown()],
          }),
          BaseCodePlugin.configure({
            inputRules: [CodeRules.markdown()],
          }),
          BaseStrikethroughPlugin.configure({
            inputRules: [StrikethroughRules.markdown()],
          }),
          BaseSubscriptPlugin.configure({
            inputRules: [SubscriptRules.markdown()],
          }),
          BaseSuperscriptPlugin.configure({
            inputRules: [SuperscriptRules.markdown()],
          }),
          BaseHighlightPlugin.configure({
            inputRules: [HighlightRules.markdown({ variant: '==' })],
          }),
          TrailingBlockPlugin,
        ],
        text,
      });

    it.each([
      ['**hello*', '*', { bold: true, text: 'hello' }],
      ['*hello', '*', { italic: true, text: 'hello' }],
      ['__hello_', '_', { underline: true, text: 'hello' }],
      ['`hello', '`', { code: true, text: 'hello' }],
      ['~~hello~', '~', { strikethrough: true, text: 'hello' }],
      ['~hello', '~', { subscript: true, text: 'hello' }],
      ['^hello', '^', { superscript: true, text: 'hello' }],
      ['==hello=', '=', { highlight: true, text: 'hello' }],
    ])('formats mark shorthand `%s`', (prefix, finalInput, expectedLeaf) => {
      const editor = createMarksEditor(prefix);

      editor.tf.insertText(finalInput);

      expect(editor.children[0]).toMatchObject({
        children: [expectedLeaf],
        type: 'p',
      });
    });
  });

  describe('list rules', () => {
    const createListsEditor = (text: string, offset?: number) =>
      createEditor({
        offset,
        plugins: [
          BaseParagraphPlugin,
          BaseIndentPlugin,
          BaseListPlugin.configure({
            inputRules: [
              BulletedListRules.markdown({ variant: '-' }),
              BulletedListRules.markdown({ variant: '*' }),
              OrderedListRules.markdown({ variant: '.' }),
              OrderedListRules.markdown({ variant: ')' }),
              TaskListRules.markdown({ checked: false }),
              TaskListRules.markdown({ checked: true }),
            ],
          }),
          TrailingBlockPlugin,
        ],
        text,
      });

    it.each([
      ['-', ' ', { indent: 1, listStyleType: 'disc', type: 'p' }],
      ['*', ' ', { indent: 1, listStyleType: 'disc', type: 'p' }],
      [
        '3.',
        ' ',
        { indent: 1, listStart: 3, listStyleType: 'decimal', type: 'p' },
      ],
      [
        '3)',
        ' ',
        {
          indent: 1,
          listRestartPolite: 3,
          listStart: 3,
          listStyleType: 'decimal',
          type: 'p',
        },
      ],
      [
        '[]',
        ' ',
        { checked: false, indent: 1, listStyleType: 'todo', type: 'p' },
      ],
      [
        '[x]',
        ' ',
        { checked: true, indent: 1, listStyleType: 'todo', type: 'p' },
      ],
    ])('promotes list shorthand `%s`', (prefix, finalInput, expectedNode) => {
      const editor = createListsEditor(prefix, prefix.length);

      editor.tf.insertText(finalInput);

      expect(editor.children[0]).toMatchObject(expectedNode);
      expect(editor.children[0]).toMatchObject({
        children: [{ text: '' }],
      });
      expect(editor.selection).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });
  });

  describe('math rules', () => {
    const mathPlugins = [
      BaseParagraphPlugin,
      BaseInlineEquationPlugin.configure({
        inputRules: [MathRules.markdown({ variant: '$' })],
      }),
      BaseEquationPlugin.configure({
        inputRules: [MathRules.markdown({ on: 'break', variant: '$$' })],
      }),
      TrailingBlockPlugin,
    ];

    it('promotes inline math on the closing `$`', () => {
      const editor = createEditor({
        plugins: mathPlugins,
        text: 'Math: $x',
      });

      editor.tf.insertText('$');

      expect(editor.children[0]).toMatchObject({
        children: [
          { text: 'Math: ' },
          { texExpression: 'x', type: 'inline_equation' },
          { text: '' },
        ],
        type: 'p',
      });
    });
  });

  describe('link rules', () => {
    const createLinksEditor = (text: string) =>
      createEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseLinkPlugin.configure({
            inputRules: [
              LinkRules.markdown(),
              LinkRules.autolink({ variant: 'space' }),
            ],
          }),
          TrailingBlockPlugin,
        ],
        text,
      });

    it('promotes markdown links on `)`', () => {
      const editor = createLinksEditor('[Example](https://example.com');

      editor.tf.insertText(')');

      expect(editor.children[0]).toMatchObject({
        children: [
          { text: '' },
          {
            children: [{ text: 'Example' }],
            target: undefined,
            type: 'a',
            url: 'https://example.com',
          },
          { text: '' },
        ],
        type: 'p',
      });
      expect(editor.selection).toEqual({
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      });
    });
  });
});
