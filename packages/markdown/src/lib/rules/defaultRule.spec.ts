import { BaseBoldPlugin, BaseH1Plugin } from '@platejs/basic-nodes';
import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { deserializeMd } from '../deserializer';
import { MarkdownPlugin } from '../MarkdownPlugin';
import { serializeMd } from '../serializer';
import { createTestEditor } from '../__tests__/createTestEditor';

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

    const editor = createSlateEditor({
      plugins: [
        MarkdownPlugin,
        BaseH1Plugin.configure({
          node: { type: 'custom-h1' },
        }),
        BaseParagraphPlugin.configure({
          node: { type: 'custom-p' },
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

    const editor = createSlateEditor({
      plugins: [
        MarkdownPlugin,
        BaseH1Plugin.configure({
          node: { type: 'custom-h1' },
        }),
        BaseParagraphPlugin.configure({
          node: { type: 'custom-p' },
        }),
        BaseBoldPlugin.configure({
          node: { type: 'custom-bold' },
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

    const editor = createSlateEditor({
      plugins: [
        MarkdownPlugin,
        BaseH1Plugin.configure({
          node: { type: 'custom-h1' },
        }),
        BaseParagraphPlugin.configure({
          node: { type: 'custom-p' },
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

    const editor = createSlateEditor({
      plugins: [
        MarkdownPlugin,
        BaseH1Plugin.configure({
          node: { type: 'custom-h1' },
        }),
        BaseParagraphPlugin.configure({
          node: { type: 'custom-p' },
        }),
        BaseBoldPlugin.configure({
          node: { type: 'custom-bold' },
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
});
