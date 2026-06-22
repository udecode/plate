import { BaseBlockquotePlugin } from '@platejs/basic-nodes';
import type { Value } from 'platejs';
import { BaseParagraphPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseIndentPlugin } from './BaseIndentPlugin';

type IndentRuntimePlugin =
  | typeof BaseBlockquotePlugin
  | typeof BaseIndentPlugin
  | typeof BaseParagraphPlugin;

describe('BaseIndentPlugin Slate v2 runtime', () => {
  it('caps matching block indent during normalization', () => {
    const editor = createPlateEditor<Value, IndentRuntimePlugin>({
      plugins: [
        BaseParagraphPlugin,
        BaseIndentPlugin.configure({
          options: { indentMax: 2 },
        }),
      ],
      runtime: 'slate-v2',
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
      runtime: 'slate-v2',
      value: [{ children: [{ text: 'One' }], indent: 2, type: 'quote' }],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'One' }], type: 'quote' },
    ]);
  });

  it('indents and outdents every selected paragraph on tab', () => {
    const editor = createPlateEditor<Value, IndentRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
      value: [
        { children: [{ text: 'One' }], type: 'p' },
        { children: [{ text: 'Two' }], type: 'p' },
      ],
    });

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'One' }], indent: 1, type: 'p' },
      { children: [{ text: 'Two' }], indent: 1, type: 'p' },
    ]);

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'One' }], type: 'p' },
      { children: [{ text: 'Two' }], type: 'p' },
    ]);
  });

  it('falls through to blockquote reverse-tab when there is no indent', () => {
    const editor = createPlateEditor<Value, IndentRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseBlockquotePlugin, BaseIndentPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: 'One' }], type: 'p' }],
          type: 'blockquote',
        },
      ],
    });

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'One' }], type: 'p' },
    ]);
  });
});
