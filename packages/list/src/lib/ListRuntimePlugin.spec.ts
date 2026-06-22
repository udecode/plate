import type { Value } from 'platejs';
import { BaseIndentPlugin } from '@platejs/indent';
import { BaseParagraphPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseListPlugin } from './BaseListPlugin';

const plugins = [BaseParagraphPlugin, BaseIndentPlugin, BaseListPlugin];

describe('BaseListPlugin Slate v2 runtime', () => {
  it('removes the list layer on resetBlock at a root list item', () => {
    const editor = createPlateEditor<Value, (typeof plugins)[number]>({
      plugins,
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
      ],
    });

    expect(editor.tf.resetBlock()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'One' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('outdents a nested list item on resetBlock', () => {
    const editor = createPlateEditor<Value, (typeof plugins)[number]>({
      plugins,
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'One' }],
          indent: 2,
          listStyleType: 'disc',
          type: 'p',
        },
      ],
    });

    expect(editor.tf.resetBlock()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ text: 'One' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ]);
  });

  it('sets a new todo line to unchecked on insertBreak at the line end', () => {
    const editor = createPlateEditor<Value, (typeof plugins)[number]>({
      plugins,
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [
        {
          checked: true,
          children: [{ text: 'Todo' }],
          indent: 1,
          listStyleType: 'todo',
          type: 'p',
        },
      ],
    });

    expect(editor.tf.insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        checked: true,
        children: [{ text: 'Todo' }],
        indent: 1,
        listStyleType: 'todo',
        type: 'p',
      },
      {
        checked: false,
        children: [{ text: '' }],
        indent: 1,
        listStart: 2,
        listStyleType: 'todo',
        type: 'p',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('renumbers following ordered list items after removal', () => {
    const editor = createPlateEditor<Value, (typeof plugins)[number]>({
      plugins,
      runtime: 'slate-v2',
      value: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listStyleType: 'decimal',
          type: 'p',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          listStart: 2,
          listStyleType: 'decimal',
          type: 'p',
        },
        {
          children: [{ text: 'Three' }],
          indent: 1,
          listStart: 3,
          listStyleType: 'decimal',
          type: 'p',
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ text: 'One' }],
        indent: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'Three' }],
        indent: 1,
        listStart: 2,
        listStyleType: 'decimal',
        type: 'p',
      },
    ]);
  });
});
