import { BaseBoldPlugin, BaseH1Plugin } from '@platejs/basic-nodes';
import { BaseParagraphPlugin, createBaseEditor } from 'platejs';

import { createTestEditor } from './createTestEditor';
import { deserializeMd } from '../../../../../../packages/markdown/src/lib/deserializer';
import { MarkdownPlugin } from '../../../../../../packages/markdown/src/lib/MarkdownPlugin';
import { serializeMd } from '../../../../../../packages/markdown/src/lib/serializer';

describe('defaultRules', () => {
  it('serialize custom keys', () => {
    const nodes = [
      {
        children: [{ text: 'Heading 1' }],
        type: 'custom-h1',
      },
      {
        children: [{ text: 'Paragraph' }],
        type: 'custom-p',
      },
    ];

    const editor = createBaseEditor({
      plugins: [
        MarkdownPlugin,
        BaseH1Plugin.configure({
          type: 'custom-h1',
        }),
        BaseParagraphPlugin.configure({
          type: 'custom-p',
        }),
      ],
    });

    const result = serializeMd(editor, { value: nodes });
    expect(result).toBe('# Heading 1\n\nParagraph\n');
  });

  it('serialize custom mark', () => {
    const nodes = [
      {
        children: [
          { text: 'Paragraph' },
          { 'custom-bold': true, text: 'text' },
        ],
        type: 'custom-p',
      },
    ];

    const editor = createBaseEditor({
      plugins: [
        MarkdownPlugin,
        BaseH1Plugin.configure({
          type: 'custom-h1',
        }),
        BaseParagraphPlugin.configure({
          type: 'custom-p',
        }),
        BaseBoldPlugin.configure({
          type: 'custom-bold',
        }),
      ],
    });

    const result = serializeMd(editor, { value: nodes });
    expect(result).toBe('Paragraph**text**\n');
  });

  it('deserialize custom keys', () => {
    const nodes = [
      {
        children: [{ text: 'Heading 1' }],
        type: 'custom-h1',
      },
      {
        children: [{ text: 'Paragraph' }],
        type: 'custom-p',
      },
    ];

    const editor = createBaseEditor({
      plugins: [
        MarkdownPlugin,
        BaseH1Plugin.configure({
          type: 'custom-h1',
        }),
        BaseParagraphPlugin.configure({
          type: 'custom-p',
        }),
      ],
    });

    const result = deserializeMd(editor, '# Heading 1\nParagraph');
    expect(result).toEqual(nodes);
  });

  it('deserialize custom mark', () => {
    const nodes = [
      {
        children: [{ text: 'Heading 1' }],
        type: 'custom-h1',
      },
      {
        children: [
          { text: 'Paragraph' },
          { 'custom-bold': true, text: 'text' },
        ],
        type: 'custom-p',
      },
    ];

    const editor = createBaseEditor({
      plugins: [
        MarkdownPlugin,
        BaseH1Plugin.configure({
          type: 'custom-h1',
        }),
        BaseParagraphPlugin.configure({
          type: 'custom-p',
        }),
        BaseBoldPlugin.configure({
          type: 'custom-bold',
        }),
      ],
    });

    const result = deserializeMd(editor, '# Heading 1\nParagraph**text**');
    expect(result).toEqual(nodes);
  });

  it('deserialize table with math formula in cell', () => {
    const editor = createTestEditor();

    const result = deserializeMd(
      editor,
      '| 名称 | 公式 |\n|:-----|:-----|\n| 面积 | $a=b$ |'
    );

    // 检查结果是一个表格
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('table');

    // 检查表格有2行
    const table = result[0];
    expect(table.children).toHaveLength(2);

    // 检查第二行第二列包含数学公式
    const secondRow = table.children[1];
    expect(secondRow.children).toHaveLength(2);

    const formulaCell = (secondRow as any).children?.[1];
    expect(formulaCell.children).toHaveLength(1);

    const paragraph = formulaCell.children[0];
    expect(paragraph.children).toHaveLength(1);

    const inlineEquation = paragraph.children[0];
    expect(inlineEquation.type).toBe('inline_equation');
    expect(inlineEquation.texExpression).toBe('a=b');
  });

  it('converts footnote definitions into dedicated nodes', () => {
    const editor = createTestEditor();
    const [result] = deserializeMd(
      editor,
      '[^1]: First note\n\n    Second note'
    );

    expect(result).toMatchObject({
      children: [
        {
          children: [{ text: 'First note' }],
          type: 'p',
        },
        {
          children: [{ text: 'Second note' }],
          type: 'p',
        },
      ],
      identifier: '1',
      type: 'footnoteDefinition',
    });
  });

  it('prefers image attributes over mdast url and alt fields', () => {
    const editor = createTestEditor();
    const [result] = deserializeMd(
      editor,
      '<img alt="caption alt" src="/from-attr.png" title="Image title" width="320" />'
    );

    expect(result).toMatchObject({
      caption: [{ text: 'caption alt' }],
      children: [{ text: '' }],
      title: 'Image title',
      type: 'img',
      url: '/from-attr.png',
      width: 320,
    });
  });

  it('serializes a trailing blockquote break as html so the newline survives', () => {
    const editor = createTestEditor();
    const result = serializeMd(editor, {
      value: [
        {
          children: [{ text: 'Line one' }, { text: '\n' }],
          type: 'blockquote',
        },
      ],
    });

    expect(result).toContain('<br />');
    expect(deserializeMd(editor, result)[0]).toMatchObject({
      type: 'blockquote',
    });
  });
});
