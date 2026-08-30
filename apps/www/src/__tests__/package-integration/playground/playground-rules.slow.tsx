import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
  BlockquoteRules,
  BoldRules,
  CodeRules,
  HeadingRules,
  HighlightRules,
  HorizontalRuleRules,
  ItalicRules,
  ScriptRules,
  StrikethroughRules,
  UnderlineRules,
  BaseIndentPlugin,
  BaseLinkPlugin,
  LinkRules,
  BaseListPlugin,
  BulletedListRules,
  OrderedListRules,
  TaskListRules,
  BaseParagraphPlugin,
  TrailingBlockPlugin,
  createEditor as createProductEditor,
} from 'platejs';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  MathRules,
} from 'platejs/math';

const createEditor = ({
  offset,
  plugins,
  text,
}: {
  offset?: number;
  plugins: any[];
  text: string;
}) =>
  createProductEditor({
    plugins,
    selection: {
      kind: 'text',
      anchor: { offset: offset ?? text.length, path: [0, 0] },
      focus: { offset: offset ?? text.length, path: [0, 0] },
    },
    initialValue: [{ children: [{ text }], type: 'paragraph' }],
  } as any);

const insertText = (editor: ReturnType<typeof createEditor>, text: string) => {
  editor.update.text.insert(text);
};

describe('playground rules current contract', () => {
  describe('basic blocks', () => {
    const createBlocksEditor = (text: string, offset?: number) =>
      createEditor({
        offset,
        plugins: [
          BaseParagraphPlugin,
          BaseHeadingPlugin.configure({
            inputRules: [HeadingRules.markdown()],
          }),
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
      ['#', 1],
      ['##', 2],
      ['###', 3],
      ['####', 4],
      ['#####', 5],
      ['######', 6],
    ])('promotes `%s ` into heading level %s', (markdown, level) => {
      const editor = createBlocksEditor(markdown, markdown.length);

      insertText(editor, ' ');

      expect(editor.read.children()[0]).toMatchObject({
        children: [{ text: '' }],
        level,
        type: 'heading',
      });
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });

    it('promotes `> ` into a blockquote', () => {
      const editor = createBlocksEditor('>hello', 1);

      insertText(editor, ' ');

      expect(editor.read.children()[0]).toMatchObject({
        children: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
        type: 'blockquote',
      });
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      });
    });

    it.each([
      ['--', '-'],
      ['___', ' '],
    ])('promotes `%s` into a horizontal rule', (prefix, finalInput) => {
      const editor = createBlocksEditor(prefix, prefix.length);

      insertText(editor, finalInput);

      expect(editor.read.children()).toMatchObject([
        { type: 'horizontalRule' },
        { children: [{ text: '' }], type: 'paragraph' },
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
          BaseScriptPlugin.configure({
            inputRules: [
              ScriptRules.markdown({ value: 'sub' }),
              ScriptRules.markdown({ value: 'sup' }),
            ],
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
      ['~hello', '~', { script: 'sub', text: 'hello' }],
      ['^hello', '^', { script: 'sup', text: 'hello' }],
      ['==hello=', '=', { highlight: true, text: 'hello' }],
    ])('formats mark shorthand `%s`', (prefix, finalInput, expectedLeaf) => {
      const editor = createMarksEditor(prefix);

      insertText(editor, finalInput);

      expect(editor.read.children()[0]).toMatchObject({
        children: [expectedLeaf],
        type: 'paragraph',
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
      ['-', ' ', { indent: 1, listType: 'bulleted', type: 'paragraph' }],
      ['*', ' ', { indent: 1, listType: 'bulleted', type: 'paragraph' }],
      [
        '3.',
        ' ',
        {
          indent: 1,
          listStart: 3,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      [
        '3)',
        ' ',
        {
          indent: 1,
          listStart: 3,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      [
        '[]',
        ' ',
        { checked: false, indent: 1, listType: 'task', type: 'paragraph' },
      ],
      [
        '[x]',
        ' ',
        { checked: true, indent: 1, listType: 'task', type: 'paragraph' },
      ],
    ])('promotes list shorthand `%s`', (prefix, finalInput, expectedNode) => {
      const editor = createListsEditor(prefix, prefix.length);

      insertText(editor, finalInput);

      expect(editor.read.children()[0]).toMatchObject(expectedNode);
      expect(editor.read.children()[0]).toMatchObject({
        children: [{ text: '' }],
      });
      expect(editor.read.selection()).toEqual({
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

      insertText(editor, '$');

      expect(editor.read.children()[0]).toMatchObject({
        children: [
          { text: 'Math: ' },
          { latex: 'x', type: 'inlineEquation' },
          { text: '' },
        ],
        type: 'paragraph',
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

      insertText(editor, ')');

      expect(editor.read.children()[0]).toMatchObject({
        children: [
          { text: '' },
          {
            children: [{ text: 'Example' }],
            type: 'link',
            url: 'https://example.com',
          },
          { text: '' },
        ],
        type: 'paragraph',
      });
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      });
    });
  });
});
