import type { Value } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseColumnPlugin } from './BaseColumnPlugin';

describe('BaseColumnPlugin Slate v2 runtime', () => {
  it('unwraps a single-column group back to plain blocks', () => {
    const editor = createPlateEditor<Value, typeof BaseColumnPlugin>({
      plugins: [BaseColumnPlugin],
      runtime: 'slate-v2',
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'Only' }], type: 'p' }],
              type: 'column',
              width: '100%',
            },
          ],
          type: 'column_group',
        },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Only' }], type: 'p' },
    ]);
  });

  it('normalizes column widths so the group sums to one hundred percent', () => {
    const editor = createPlateEditor<Value, typeof BaseColumnPlugin>({
      plugins: [BaseColumnPlugin],
      runtime: 'slate-v2',
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'A' }], type: 'p' }],
              type: 'column',
              width: '20%',
            },
            {
              children: [{ children: [{ text: 'B' }], type: 'p' }],
              type: 'column',
              width: '20%',
            },
          ],
          type: 'column_group',
        },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          {
            children: [{ children: [{ text: 'A' }], type: 'p' }],
            type: 'column',
            width: '50%',
          },
          {
            children: [{ children: [{ text: 'B' }], type: 'p' }],
            type: 'column',
            width: '50%',
          },
        ],
        type: 'column_group',
      },
    ]);
  });

  it('unwraps column groups that contain only non-column children', () => {
    const editor = createPlateEditor<Value, typeof BaseColumnPlugin>({
      plugins: [BaseColumnPlugin],
      runtime: 'slate-v2',
      value: [
        {
          children: [
            { children: [{ text: 'A' }], type: 'p' },
            { children: [{ text: 'B' }], type: 'blockquote' },
          ],
          type: 'column_group',
        },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'A' }], type: 'p' },
      { children: [{ text: 'B' }], type: 'blockquote' },
    ]);
  });

  it('removes empty columns and unwraps the remaining single column', () => {
    const editor = createPlateEditor<Value, typeof BaseColumnPlugin>({
      plugins: [BaseColumnPlugin],
      runtime: 'slate-v2',
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'A' }], type: 'p' }],
              type: 'column',
              width: '50%',
            },
            {
              children: [],
              type: 'column',
              width: '50%',
            },
          ],
          type: 'column_group',
        },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'A' }], type: 'p' },
    ]);
  });

  it('selects the containing column and then the parent group', () => {
    const editor = createPlateEditor<Value, typeof BaseColumnPlugin>({
      plugins: [BaseColumnPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 1, path: [0, 0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'abc' }], type: 'p' }],
              type: 'column',
              width: '50%',
            },
            {
              children: [{ children: [{ text: 'def' }], type: 'p' }],
              type: 'column',
              width: '50%',
            },
          ],
          type: 'column_group',
        },
      ],
    });

    expect(editor.tf.selectAll()).toBe(true);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0, 0, 0] },
      focus: { offset: 3, path: [0, 0, 0, 0] },
    });

    expect(editor.tf.selectAll()).toBe(true);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0, 0, 0] },
      focus: { offset: 3, path: [0, 1, 0, 0] },
    });
  });
});
