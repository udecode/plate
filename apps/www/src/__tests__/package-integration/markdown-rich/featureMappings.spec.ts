import type { Root } from 'mdast';
import {
  ElementApi,
  property,
  schema,
  createEditor,
  definePlugin,
} from 'platejs';
import { BaseCalloutPlugin } from 'platejs/callout';
import type {
  MarkdownApi,
  MarkdownEditorSerializeOptions,
} from 'platejs/markdown';
import { BaseImagePlugin } from 'platejs/media';

import { MarkdownPlugin } from '../../../../../../packages/platejs/src/markdown/lib/MarkdownPlugin';
import { createTestEditor } from './createTestEditor';

const inlineContent = schema.content.any(
  [schema.content.text(), schema.content.group('inline')],
  { default: 'text', min: 1 }
);

type MarkdownEditor = Readonly<{ api: Readonly<{ markdown: MarkdownApi }> }>;

const parseMarkdown = (editor: MarkdownEditor, source: string) => {
  const result = editor.api.markdown.parse(source);

  if (!result.ok) throw new Error(result.diagnostics[0].message);

  return result.document;
};

const serializeMarkdown = (
  editor: MarkdownEditor,
  options: MarkdownEditorSerializeOptions
) => {
  const result = editor.api.markdown.serialize(options);

  if (!result.ok) throw new Error(result.diagnostics[0].message);

  return result.data;
};

const CustomHeadingPlugin = definePlugin('customH1', {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      markdown: {
        decode: ({ decode, marks, node }) =>
          node.depth === 1
            ? {
                children: decode(node.children, marks),
                type,
              }
            : undefined,
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          depth: 1,
          type: 'heading',
        }),
        node: 'heading',
      },
    }),
  schema: {
    element: {
      content: inlineContent,
    },
  },
});

const CustomParagraphPlugin = definePlugin('customParagraph', {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      markdown: {
        decode: ({ decode, marks, node }) => ({
          children: decode(node.children, marks),
          type,
        }),
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          type: 'paragraph',
        }),
        node: 'paragraph',
      },
    }),
  schema: {
    element: {
      content: inlineContent,
    },
  },
});

const CustomBoldPlugin = definePlugin('customBold', {
  formats: ({ defineFormats }) =>
    defineFormats({
      markdown: { node: 'strong' },
    }),
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

describe('feature-owned Markdown formats', () => {
  it('decodes callouts without installing a Plate paragraph plugin', () => {
    const editor = createEditor({
      plugins: [
        BaseCalloutPlugin,
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [] },
        }),
      ],
    });

    expect(
      parseMarkdown(editor, '<callout>\n  Text\n</callout>').children
    ).toEqual([
      {
        children: [{ text: 'Text' }],
        icon: '💡',
        type: 'callout',
      },
    ]);
  });

  it('rejects callout paragraphs that decode to block elements', () => {
    const remarkCalloutImage = () => (tree: Root) => {
      tree.children = [
        {
          attributes: [],
          children: [
            {
              children: [
                {
                  alt: 'Plate',
                  title: null,
                  type: 'image',
                  url: '/plate.png',
                },
              ],
              type: 'paragraph',
            },
          ],
          name: 'callout',
          type: 'mdxJsxFlowElement',
        },
      ];
    };
    const editor = createEditor({
      plugins: [
        BaseImagePlugin,
        BaseCalloutPlugin,
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [remarkCalloutImage] },
        }),
      ],
    });

    expect(() => parseMarkdown(editor, 'seed')).toThrow(
      '<callout> content must be one Markdown paragraph.'
    );
  });

  it('serialize custom keys', () => {
    const nodes = [
      {
        children: [{ text: 'Heading 1' }],
        type: 'customH1',
      },
      {
        children: [{ text: 'Paragraph' }],
        type: 'customParagraph',
      },
    ];

    const editor = createEditor({
      plugins: [MarkdownPlugin, CustomHeadingPlugin, CustomParagraphPlugin],
    });

    const result = serializeMarkdown(editor, {
      document: { children: nodes },
    });
    expect(result).toBe('# Heading 1\n\nParagraph\n');
  });

  it('serialize custom mark', () => {
    const nodes = [
      {
        children: [{ text: 'Paragraph' }, { customBold: true, text: 'text' }],
        type: 'customParagraph',
      },
    ];

    const editor = createEditor({
      plugins: [
        MarkdownPlugin,
        CustomHeadingPlugin,
        CustomParagraphPlugin,
        CustomBoldPlugin,
      ],
    });

    const result = serializeMarkdown(editor, {
      document: { children: nodes },
    });
    expect(result).toBe('Paragraph**text**\n');
  });

  it('parse custom keys', () => {
    const nodes = [
      {
        children: [{ text: 'Heading 1' }],
        type: 'customH1',
      },
      {
        children: [{ text: 'Paragraph' }],
        type: 'customParagraph',
      },
    ];

    const editor = createEditor({
      plugins: [MarkdownPlugin, CustomHeadingPlugin, CustomParagraphPlugin],
    });

    const result = parseMarkdown(editor, '# Heading 1\nParagraph').children;
    expect(result).toEqual(nodes);
  });

  it('parse custom mark', () => {
    const nodes = [
      {
        children: [{ text: 'Heading 1' }],
        type: 'customH1',
      },
      {
        children: [{ text: 'Paragraph' }, { customBold: true, text: 'text' }],
        type: 'customParagraph',
      },
    ];

    const editor = createEditor({
      plugins: [
        MarkdownPlugin,
        CustomHeadingPlugin,
        CustomParagraphPlugin,
        CustomBoldPlugin,
      ],
    });

    const result = parseMarkdown(
      editor,
      '# Heading 1\nParagraph**text**'
    ).children;
    expect(result).toEqual(nodes);
  });

  it('parse table with math formula in cell', () => {
    const editor = createTestEditor();

    const result = parseMarkdown(
      editor,
      '| 名称 | 公式 |\n|:-----|:-----|\n| 面积 | $a=b$ |'
    ).children;

    // 检查结果是一个表格
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('table');

    // 检查表格有2行
    const table = result[0];
    expect(table.children).toHaveLength(2);

    // 检查第二行第二列包含数学公式
    const secondRow = table.children[1];
    expect(secondRow.children).toHaveLength(2);

    if (!ElementApi.isElement(secondRow)) {
      throw new Error('Expected the second table row to be an element.');
    }
    const formulaCell = secondRow.children[1];

    if (!ElementApi.isElement(formulaCell)) {
      throw new Error('Expected the formula cell to be an element.');
    }
    expect(formulaCell.children).toHaveLength(1);

    const paragraph = formulaCell.children[0];

    if (!ElementApi.isElement(paragraph)) {
      throw new Error('Expected the formula paragraph to be an element.');
    }
    // Inline voids sit between canonical empty text spacers.
    expect(paragraph.children).toMatchObject([
      { text: '' },
      { latex: 'a=b', type: 'inlineEquation' },
      { text: '' },
    ]);
  });

  it('converts footnote definitions into dedicated nodes', () => {
    const editor = createTestEditor();
    const [result] = parseMarkdown(
      editor,
      '[^1]: First note\n\n    Second note'
    ).children;

    expect(result).toMatchObject({
      children: [
        {
          children: [{ text: 'First note' }],
          type: 'paragraph',
        },
        {
          children: [{ text: 'Second note' }],
          type: 'paragraph',
        },
      ],
      ref: '1',
      type: 'footnoteDefinition',
    });
  });

  it('prefers image attributes over mdast url and alt fields', () => {
    const editor = createTestEditor();
    const [result] = parseMarkdown(
      editor,
      '<img alt="caption alt" src="/from-attr.png" title="Image title" width="320" />'
    ).children;

    expect(result).toMatchObject({
      alt: 'caption alt',
      children: [{ text: '' }],
      title: 'Image title',
      type: 'image',
      url: '/from-attr.png',
      width: 320,
    });
  });

  it('serializes a trailing blockquote break as html so the newline survives', () => {
    const editor = createTestEditor();
    const result = serializeMarkdown(editor, {
      document: {
        children: [
          {
            children: [
              { children: [{ text: 'Line one\n' }], type: 'paragraph' },
            ],
            type: 'blockquote',
          },
        ],
      },
    });

    expect(result).toContain('<br />');
    expect(parseMarkdown(editor, result).children[0]).toMatchObject({
      type: 'blockquote',
    });
  });
});
