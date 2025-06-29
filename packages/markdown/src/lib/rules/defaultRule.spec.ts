import { H1Plugin } from '@platejs/basic-nodes/react';
import { createPlateEditor, ParagraphPlugin } from 'platejs/react';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { serializeMd } from '../serializer';

describe('defaultRules', () => {
  it('should serialize default keys', () => {
    const nodes = [
      {
        children: [{ text: 'Heading 1' }],
        type: 'h1',
      },
      {
        children: [{ text: 'Paragraph' }],
        type: 'p',
      },
    ];

    const editor = createPlateEditor({
      plugins: [MarkdownPlugin, H1Plugin, ParagraphPlugin],
    });

    const result = serializeMd(editor, { value: nodes });
    expect(result).toMatchSnapshot();
  });

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
        H1Plugin.configure({ key: 'custom-h1' as any }),
        ParagraphPlugin.configure({ key: 'custom-p' as any }),
      ],
    });

    const result = serializeMd(editor, { value: nodes });
    expect(result).toMatchSnapshot();
  });
});
