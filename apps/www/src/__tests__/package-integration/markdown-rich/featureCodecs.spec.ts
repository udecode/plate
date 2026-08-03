import { ElementApi, property, schema } from '@platejs/plite';
import { createBaseEditor, defineBasePlugin } from 'platejs';

import { createTestEditor } from './createTestEditor';
import { MarkdownPlugin } from '../../../../../../packages/markdown/src/lib/MarkdownPlugin';

const inlineContent = schema.content.any(
  [schema.content.text(), schema.content.group('inline')],
  { default: 'text', min: 1 }
);

const CustomH1Plugin = defineBasePlugin('customH1', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        decode: ({ decode, decoration, element, node }) =>
          node.depth === 1
            ? {
                children: decode(node.children, decoration),
                type: element.type,
              }
            : undefined,
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          depth: 1,
          type: 'heading',
        }),
        from: 'heading',
        kind: 'node',
      },
    }),
  schema: {
    element: {
      content: inlineContent,
    },
  },
});

const CustomParagraphPlugin = defineBasePlugin('customParagraph', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        decode: ({ decode, decoration, element, node }) => ({
          children: decode(node.children, decoration),
          type: element.type,
        }),
        encode: ({ encodePhrasing, node }) => ({
          children: encodePhrasing(node.children),
          type: 'paragraph',
        }),
        from: 'paragraph',
        kind: 'node',
      },
    }),
  schema: {
    element: {
      content: inlineContent,
    },
  },
});

const CustomBoldPlugin = defineBasePlugin('customBold', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        decode: ({ decode, decoration, node, properties }) =>
          decode(node.children, {
            ...decoration,
            [properties.customBold.key]: true,
          }),
        encode: () => ({ children: [], type: 'strong' }),
        from: 'strong',
        kind: 'node',
        mark: true,
      },
    }),
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

describe('feature-owned Markdown codecs', () => {
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

    const editor = createBaseEditor({
      plugins: [MarkdownPlugin, CustomH1Plugin, CustomParagraphPlugin],
    });

    const result = editor.api.markdown.serialize({
      value: { children: nodes },
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

    const editor = createBaseEditor({
      plugins: [
        MarkdownPlugin,
        CustomH1Plugin,
        CustomParagraphPlugin,
        CustomBoldPlugin,
      ],
    });

    const result = editor.api.markdown.serialize({
      value: { children: nodes },
    });
    expect(result).toBe('Paragraph**text**\n');
  });

  it('deserialize custom keys', () => {
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

    const editor = createBaseEditor({
      plugins: [MarkdownPlugin, CustomH1Plugin, CustomParagraphPlugin],
    });

    const result = editor.api.markdown.deserialize(
      '# Heading 1\nParagraph'
    ).children;
    expect(result).toEqual(nodes);
  });

  it('deserialize custom mark', () => {
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

    const editor = createBaseEditor({
      plugins: [
        MarkdownPlugin,
        CustomH1Plugin,
        CustomParagraphPlugin,
        CustomBoldPlugin,
      ],
    });

    const result = editor.api.markdown.deserialize(
      '# Heading 1\nParagraph**text**'
    ).children;
    expect(result).toEqual(nodes);
  });

  it('deserialize table with math formula in cell', () => {
    const editor = createTestEditor();

    const result = editor.api.markdown.deserialize(
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
    expect(paragraph.children).toHaveLength(1);

    const inlineEquation = paragraph.children[0];
    expect(inlineEquation.type).toBe('inlineEquation');
    expect(inlineEquation.texExpression).toBe('a=b');
  });

  it('converts footnote definitions into dedicated nodes', () => {
    const editor = createTestEditor();
    const [result] = editor.api.markdown.deserialize(
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
      identifier: '1',
      type: 'footnoteDefinition',
    });
  });

  it('prefers image attributes over mdast url and alt fields', () => {
    const editor = createTestEditor();
    const [result] = editor.api.markdown.deserialize(
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
    const result = editor.api.markdown.serialize({
      value: {
        children: [
          {
            children: [{ text: 'Line one' }, { text: '\n' }],
            type: 'blockquote',
          },
        ],
      },
    });

    expect(result).toContain('<br />');
    expect(editor.api.markdown.deserialize(result).children[0]).toMatchObject({
      type: 'blockquote',
    });
  });
});
