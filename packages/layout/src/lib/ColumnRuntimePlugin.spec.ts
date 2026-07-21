import { createBaseEditor } from '@platejs/core';
import type { Selection, Value } from '@platejs/plite';

import { BaseColumnPlugin } from './BaseColumnPlugin';

const createColumnRuntimeEditor = ({
  selection,
  value,
}: {
  selection?: Selection;
  value: Value;
}) =>
  createBaseEditor({
    selection,
    value,
    plugins: [BaseColumnPlugin],
  });

describe('BaseColumnPlugin Plite runtime', () => {
  it('normalizes column widths so the group sums to one hundred percent', () => {
    const editor = createColumnRuntimeEditor({
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

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
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

  it('selects the containing column and then the parent group', () => {
    const editor = createColumnRuntimeEditor({
      selection: {
        kind: 'text',
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

    expect(editor.update.column.selectAll()).toBe(true);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0, 0, 0] },
      focus: { offset: 3, path: [0, 0, 0, 0] },
    });

    expect(editor.update.column.selectAll()).toBe(true);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0, 0, 0] },
      focus: { offset: 3, path: [0, 1, 0, 0] },
    });
  });

  it('expands a backward full-column selection to the parent group', () => {
    const editor = createColumnRuntimeEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0, 0] },
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

    expect(editor.update.column.selectAll()).toBe(true);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0, 0, 0] },
      focus: { offset: 3, path: [0, 1, 0, 0] },
    });
  });
});
