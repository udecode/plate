import { H1Plugin } from '@platejs/basic-nodes/react';
import { BoldPlugin } from '@platejs/basic-nodes/react';
import { createPlateEditor, ParagraphPlugin } from 'platejs/react';

import { deserializeMd } from '../deserializer';
import { MarkdownPlugin } from '../MarkdownPlugin';
import { serializeMd } from '../serializer';

describe('defaultRules', () => {
  it('should serialize custom keys', () => {
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

    const editor = createPlateEditor({
      plugins: [
        MarkdownPlugin,
        H1Plugin.configure({
          node: { type: 'custom-h1' },
        }),
        ParagraphPlugin.configure({
          node: { type: 'custom-p' },
        }),
      ],
    });

    const result = serializeMd(editor, { value: nodes });
    expect(result).toMatchSnapshot();
  });

  it('should serialize custom mark', () => {
    const nodes = [
      {
        children: [
          { text: 'Paragraph' },
          { 'custom-bold': true, text: 'text' },
        ],
        type: 'custom-p',
      },
    ];

    const editor = createPlateEditor({
      plugins: [
        MarkdownPlugin,
        H1Plugin.configure({
          node: { type: 'custom-h1' },
        }),
        ParagraphPlugin.configure({
          node: { type: 'custom-p' },
        }),
        BoldPlugin.configure({
          node: { type: 'custom-bold' },
        }),
      ],
    });

    const result = serializeMd(editor, { value: nodes });
    expect(result).toMatchSnapshot();
  });

  it('should deserialize custom keys', () => {
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

    const editor = createPlateEditor({
      plugins: [
        MarkdownPlugin,
        H1Plugin.configure({
          node: { type: 'custom-h1' },
        }),
        ParagraphPlugin.configure({
          node: { type: 'custom-p' },
        }),
      ],
    });

    const result = deserializeMd(editor, '# Heading 1\nParagraph');
    expect(result).toEqual(nodes);
  });

  it('should deserialize custom mark', () => {
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

    const editor = createPlateEditor({
      plugins: [
        MarkdownPlugin,
        H1Plugin.configure({
          node: { type: 'custom-h1' },
        }),
        ParagraphPlugin.configure({
          node: { type: 'custom-p' },
        }),
        BoldPlugin.configure({
          node: { type: 'custom-bold' },
        }),
      ],
    });

    const result = deserializeMd(editor, '# Heading 1\nParagraph**text**');
    expect(result).toEqual(nodes);
  });
});
