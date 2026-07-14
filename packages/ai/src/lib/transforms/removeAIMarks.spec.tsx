import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';

import { BaseAIPlugin } from '../BaseAIPlugin';
import { removeAIMarks } from './removeAIMarks';

describe('removeAIMarks', () => {
  it('unsets only ai marks and leaves other marks alone', () => {
    const editor = createBaseEditor({
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

    editor.update((tx) => removeAIMarks(editor, tx));

    expect(editor.read.children()).toEqual([
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
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      value: [
        { type: 'p', children: [{ ai: true, text: 'one' }] },
        { type: 'p', children: [{ ai: true, text: 'two' }] },
      ],
    });

    editor.update((tx) => removeAIMarks(editor, tx, { at: [1] }));

    expect(editor.read.children()).toEqual([
      { type: 'p', children: [{ ai: true, text: 'one' }] },
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });
});
