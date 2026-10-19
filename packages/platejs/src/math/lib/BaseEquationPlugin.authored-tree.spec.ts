import { createAuthoredPlugin } from 'plitejs/authored';

import { BaseParagraphPlugin, createEditor } from '../../core';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  MathRules,
} from './BaseEquationPlugin';

describe('math input rules on the authored review tree', () => {
  it('closes an inline equation across struck text and keeps that text struck', () => {
    const struck = {
      authored: [{ at: 1, author: 'bob', change: 'bob:1', kind: 'delete' }],
      text: 'junk',
    };
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseInlineEquationPlugin.configure({
          inputRules: [MathRules.markdown({ variant: '$' })],
        }),
        BaseEquationPlugin,
        createAuthoredPlugin({
          authorId: 'alice',
          createChangeId: () => 'alice:1',
          intent: 'edit',
          now: () => 1,
        }),
      ] as const,
      initialValue: [
        { children: [{ text: '$a' }, struck], type: 'paragraph' },
      ] as never,
    });
    const caret = { offset: 4, path: [0, 1] };

    editor.update((tx) => tx.selection.set({ anchor: caret, focus: caret }));
    editor.update.text.insert('$');

    expect(editor.read.value().children).toEqual([
      {
        children: [
          struck,
          { children: [{ text: '' }], latex: 'a', type: 'inlineEquation' },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
  });
});
