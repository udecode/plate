import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import type { Selection, Value } from '@platejs/plite';
import type { TColumnGroupElement } from '@platejs/utils';

import { BaseColumnPlugin } from '../BaseColumnPlugin';

const createEditor = ({
  selection,
  value,
}: {
  selection?: Selection;
  value: Value;
}) => createBaseEditor({ plugins: [BaseColumnPlugin], selection, value });

const getColumnGroup = (editor: ReturnType<typeof createEditor>) => {
  const entry = editor.read.nodes.get<TColumnGroupElement>([0]);
  assert(entry);

  return entry[0];
};

describe('toggleColumnGroup', () => {
  it('wraps the selected block in a column group', () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'Some paragraph text' }], type: 'p' }],
    });

    editor.update.column.toggle({ columns: 2 });

    const group = getColumnGroup(editor);

    expect(group.children).toHaveLength(2);
    expect(editor.read.text.string([0, 0])).toBe('Some paragraph text');
    expect(editor.read.text.string([0, 1])).toBe('');
  });

  it('updates an existing column group', () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0, 0] },
      },
      value: [
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
      ],
    });

    editor.update.column.toggle({ columns: 3 });

    const group = getColumnGroup(editor);

    expect(group.children).toHaveLength(3);
    expect(group.children.map((column) => column.width)).toEqual([
      `${100 / 3}%`,
      `${100 / 3}%`,
      `${100 / 3}%`,
    ]);
    expect(editor.read.text.string([0, 0])).toBe('A');
    expect(editor.read.text.string([0, 1])).toBe('B');
    expect(editor.read.text.string([0, 2])).toBe('');
  });

  it('merges content when reducing an existing group', () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 0, path: [0, 1, 0, 0] },
        focus: { offset: 0, path: [0, 1, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'A' }], type: 'p' }],
              type: 'column',
              width: '33%',
            },
            {
              children: [{ children: [{ text: 'B' }], type: 'p' }],
              type: 'column',
              width: '33%',
            },
            {
              children: [{ children: [{ text: 'C' }], type: 'p' }],
              type: 'column',
              width: '34%',
            },
          ],
          type: 'column_group',
        },
      ],
    });

    editor.update.column.toggle({ columns: 2 });

    expect(editor.read.text.string([0, 0])).toBe('A');
    expect(editor.read.text.string([0, 1])).toBe('BC');
  });

  it('does nothing without a selected block', () => {
    const value = [{ children: [{ text: 'Some paragraph text' }], type: 'p' }];
    const editor = createEditor({ value });

    editor.update.column.toggle({ columns: 2 });

    expect(editor.read.children()).toEqual(value);
  });
});
