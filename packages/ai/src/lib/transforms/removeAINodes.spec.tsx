import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { removeAINodes } from './removeAINodes';

describe('removeAINodes', () => {
  it('removes only text nodes marked with ai', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin],
      value: [
        {
          type: 'p',
          children: [{ ai: true, text: 'one' }, { text: ' two' }],
        },
      ],
    });

    removeAINodes(editor);

    expect(editor.children).toEqual([
      {
        type: 'p',
        children: [{ text: ' two' }],
      },
    ]);
  });

  it('respects the at filter and leaves ai nodes outside it untouched', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin],
      value: [
        { type: 'p', children: [{ ai: true, text: 'one' }] },
        { type: 'p', children: [{ ai: true, text: 'two' }] },
      ],
    });

    removeAINodes(editor, { at: [1] });

    expect(editor.children as any).toEqual([
      { type: 'p', children: [{ ai: true, text: 'one' }] },
      { type: 'p', children: [{ text: '' }] },
    ]);
  });
});
