import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';

import { BaseAIPlugin } from '../BaseAIPlugin';
import { removeAINodes } from './removeAINodes';

describe('removeAINodes', () => {
  it('removes only text nodes marked with ai', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      initialValue: [
        {
          type: 'p',
          children: [{ ai: true, text: 'one' }, { text: ' two' }],
        },
      ],
    });

    editor.update((tx) => removeAINodes(editor, tx));

    expect(editor.read.children()).toEqual([
      {
        type: 'p',
        children: [{ text: ' two' }],
      },
    ]);
  });

  it('removes only the explicit matching target', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      initialValue: [
        { type: 'p', children: [{ ai: true, text: 'one' }] },
        { type: 'p', children: [{ ai: true, text: 'two' }] },
      ],
    });

    editor.update((tx) => removeAINodes(editor, tx, { at: [1, 0] }));

    expect(editor.read.children()).toEqual([
      { type: 'p', children: [{ ai: true, text: 'one' }] },
      { type: 'p', children: [{ text: '' }] },
    ]);
  });

  it('removes AI nodes inserted earlier in the active transaction', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      initialValue: [{ type: 'p', children: [{ text: 'one' }] }],
    });

    editor.update((tx) => {
      tx.nodes.insert({ ai: true, text: ' AI' }, { at: [0, 1] });
      tx.ai.removeNodes();
    });

    expect(editor.read.children()).toEqual([
      { type: 'p', children: [{ text: 'one' }] },
    ]);
  });
});
