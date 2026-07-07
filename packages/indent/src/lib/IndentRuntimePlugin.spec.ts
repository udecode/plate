import { BaseParagraphPlugin } from '@platejs/core';
import type { Value } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { BaseIndentPlugin } from './BaseIndentPlugin';

describe('BaseIndentPlugin Plite runtime', () => {
  it('caps matching block indent during normalization', () => {
    const value: Value = [
      { children: [{ text: 'One' }], indent: 4, type: 'p' },
    ];

    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin.configure({
          options: { indentMax: 2 },
        }),
      ],
      value,
    });

    editor.update.normalize({ force: true });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], indent: 2, type: 'p' },
    ]);
  });

  it('unsets indent when the block no longer matches target types', () => {
    const value: Value = [
      { children: [{ text: 'One' }], indent: 2, type: 'quote' },
    ];

    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      value,
    });

    editor.update.normalize({ force: true });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], type: 'quote' },
    ]);
  });
});
