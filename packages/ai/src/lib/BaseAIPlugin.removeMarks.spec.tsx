import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { property } from '@platejs/plite';

import { BaseAIPlugin } from './BaseAIPlugin';

const BaseBoldPlugin = createBasePlugin({
  key: 'bold',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

describe('removeAIMarks', () => {
  it('unsets only ai marks and leaves other marks alone', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseBoldPlugin, BaseAIPlugin],
      initialValue: [
        {
          type: 'p',
          children: [
            { ai: true, bold: true, text: 'one' },
            { bold: true, text: ' two' },
          ],
        },
      ],
    });

    editor.update((tx) => tx.ai.removeMarks());

    expect(editor.read.children()).toEqual([
      {
        children: [{ bold: true, text: 'one two' }],
        type: 'p',
      },
    ]);
  });

  it('respects the at filter', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      initialValue: [
        { type: 'p', children: [{ ai: true, text: 'one' }] },
        { type: 'p', children: [{ ai: true, text: 'two' }] },
      ],
    });

    editor.update((tx) => tx.ai.removeMarks({ at: [1] }));

    expect(editor.read.children()).toEqual([
      { type: 'p', children: [{ ai: true, text: 'one' }] },
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });
});
