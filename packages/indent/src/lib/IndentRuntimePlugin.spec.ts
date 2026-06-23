import type { Value } from 'platejs';
import { BaseParagraphPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseIndentPlugin } from './BaseIndentPlugin';

type IndentRuntimePlugin = typeof BaseIndentPlugin | typeof BaseParagraphPlugin;

describe('BaseIndentPlugin Plite runtime', () => {
  it('caps matching block indent during normalization', () => {
    const editor = createPlateEditor<Value, IndentRuntimePlugin>({
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin.configure({
          options: { indentMax: 2 },
        }),
      ],
      runtime: 'plite',
      value: [{ children: [{ text: 'One' }], indent: 4, type: 'p' }],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'One' }], indent: 2, type: 'p' },
    ]);
  });

  it('unsets indent when the block no longer matches target types', () => {
    const editor = createPlateEditor<Value, IndentRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      runtime: 'plite',
      value: [{ children: [{ text: 'One' }], indent: 2, type: 'quote' }],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'One' }], type: 'quote' },
    ]);
  });
});
