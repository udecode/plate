import { BaseParagraphPlugin, createBasePlateEditor } from 'platejs';

import { BaseAIPlugin } from '../BaseAIPlugin';
import { removeAIMarks } from './removeAIMarks';

describe('removeAIMarks', () => {
  it('unsets only ai marks and leaves other marks alone', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      value: [
        {
          type: 'p',
          children: [
            { ai: true, bold: true, text: 'one' },
            { bold: true, text: ' two' },
          ],
        },
      ],
    });

    removeAIMarks(editor);

    expect(editor.children).toEqual([
      {
        children: [
          { bold: true, text: 'one' },
          { bold: true, text: ' two' },
        ],
        type: 'p',
      },
    ]);
  });

  it('respects the at filter', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      value: [
        { type: 'p', children: [{ ai: true, text: 'one' }] },
        { type: 'p', children: [{ ai: true, text: 'two' }] },
      ],
    });

    removeAIMarks(editor, { at: [1] });

    expect(editor.children as any).toEqual([
      { type: 'p', children: [{ ai: true, text: 'one' }] },
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });
});
